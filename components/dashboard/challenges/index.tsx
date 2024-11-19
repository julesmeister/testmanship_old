"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/challenge';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';
import { useChallengeFilters, difficultyLevels } from '@/hooks/useChallengeFilters';
import { useChallenges } from '@/hooks/useChallenges';
import DashboardLayout from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { ChallengeFilters } from './ChallengeFilters';
import { ChallengeStats } from './ChallengeStats';
import { ChallengeCard } from './ChallengeCard';
import { ChallengeDialog } from './ChallengeDialog';
import { startProgress } from '@/components/ui/progress-bar';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function Challenges({ user, userDetails }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { challenges, isLoading } = useChallenges();
  const {
    searchQuery,
    setSearchQuery,
    selectedLevel,
    setSelectedLevel,
    showUserChallengesOnly,
    setShowUserChallengesOnly,
    filteredChallenges,
  } = useChallengeFilters(challenges, user?.id);

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [creatorName, setCreatorName] = useState('');

  const userChallengesCount = useMemo(() => {
    return challenges.filter(challenge => challenge.created_by === user?.id).length;
  }, [challenges, user?.id]);

  const totalChallengesCount = useMemo(() => challenges.length, [challenges]);

  const handleChallengeClick = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    if (challenge.created_by) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', challenge.created_by)
          .single();

        if (error) throw error;
        setCreatorName(data?.full_name || 'Unknown User');
      } catch (error) {
        console.error('Error fetching creator details:', error);
        setCreatorName('Unknown User');
      }
    }
  };

  const handleEditChallenge = () => {
    if (selectedChallenge) {
      startProgress();
      router.push(`/dashboard/challenges/edit/${selectedChallenge.id}`);
    }
  };

  const handleCreateChallenge = () => {
    startProgress();
    router.push('/dashboard/challenge-generator');
  };

  if (isLoading) {
    return (
      <DashboardLayout 
        user={user} 
        userDetails={userDetails} 
        title="Writing Challenges"
        description="Practice your writing skills with our curated collection of challenges."
      >
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      user={user} 
      userDetails={userDetails} 
      title="Writing Challenges"
      description="Practice your writing skills with our curated collection of challenges."
    >
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Writing Challenges</h2>
            <p className="text-muted-foreground">
              Practice your writing skills with these challenges
            </p>
          </div>
          <Button onClick={handleCreateChallenge} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Challenge
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-8">
            <ChallengeStats
              totalCount={challenges.length}
              userCount={userChallengesCount}
              showUserChallengesOnly={showUserChallengesOnly}
              onToggleUserChallenges={() => setShowUserChallengesOnly(!showUserChallengesOnly)}
              onClearFilter={() => setShowUserChallengesOnly(false)}
            />

            <ChallengeFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              difficultyLevels={difficultyLevels}
            />

            {filteredChallenges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No challenges found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onClick={() => handleChallengeClick(challenge)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ChallengeDialog
          challenge={selectedChallenge}
          creatorName={creatorName}
          isCurrentUser={selectedChallenge?.created_by === user?.id}
          onClose={() => setSelectedChallenge(null)}
          onEdit={handleEditChallenge}
        />
      </div>
    </DashboardLayout>
  );
}
