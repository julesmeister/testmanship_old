"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/layout';
import ExerciseOverview from './components/overview';
import { useUserProgress } from '@/hooks/useUserProgress';
import ExerciseList from './components/exercise-list';
import ExerciseDetails from './components/exercise-details'; 
interface Props {
  title?: string;
  description?: string;
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function Exercise({ title, description, user, userDetails }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);

  const [weakestSkills, setWeakestSkills] = useState<string[]>([]);
  const [userProgressId, setUserProgressId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [exercisesTaken, setExercisesTaken] = useState(0);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  useUserProgress(supabase, user?.id as string, {
    setWeakestSkills,
    setUserProgressId,
    setUpdatedAt,
    setCurrentStreak,
    setExercisesTaken,
    setDifficulty,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching exercise data:', error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleLevelChange = async (newLevel: string) => {
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({ last_active_level: newLevel })
        .eq('user_id', user?.id);

      if (error) throw error;
      setDifficulty(newLevel);
    } catch (error) {
      console.error('Error updating difficulty level:', error);
    }
  };

  if (!user) {
    router.push('/dashboard/signin');
    return null;
  }

  return (
    <DashboardLayout
      user={user} 
      userDetails={userDetails} 
      title={title || 'Exercises'}
      description={description || "Practice your language skills with targeted exercises."}>
      <div className="grid gap-6">
        <ExerciseOverview
          difficultyLevel={difficulty || 'A1'}
          weakestSkills={weakestSkills}
          lastUpdated={updatedAt ? new Date(updatedAt) : new Date()}
          onLevelChange={handleLevelChange}
        />
        {/* Exercise List will go here */}
        {/* Exercise Details will go here */}
        {/* Exercise Grading will go here */}
      </div>
      <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ExerciseList
              exercises={[
                {
                  id: '1',
                  title: 'Basic Greetings',
                  description: 'Learn common greetings and introductions in everyday situations.',
                  duration: 15,
                  difficulty: 'A1',
                  completed: true,
                  score: 95
                },
                {
                  id: '2',
                  title: 'Family Members',
                  description: 'Practice vocabulary related to family relationships and descriptions.',
                  duration: 20,
                  difficulty: 'A1',
                },
                {
                  id: '3',
                  title: 'Daily Routines',
                  description: 'Learn to describe your daily activities and schedule.',
                  duration: 25,
                  difficulty: 'A2'
                }
              ]}
              selectedId={selectedExerciseId}
              onSelect={setSelectedExerciseId}
            />
          </div>

          <div className="md:col-span-3">
            {selectedExerciseId !== null && selectedExerciseId !== undefined && (
              <ExerciseDetails
              exercise={
                selectedExerciseId ? {
                  id: '2',
                  title: 'Family Members',
                  description: 'Master essential vocabulary for describing family relationships and personal connections. Perfect for beginners looking to talk about their loved ones.',
                  duration: 20,
                  difficulty: 'A1',
                  progress: 60,
                  objectives: [
                    'Learn basic family relationship terms',
                    'Practice describing family members',
                    'Understand possessive pronouns',
                    'Create simple family-related sentences'
                  ]
                } : undefined
              }
                onStart={() => console.log('Starting exercise...')}
                onContinue={() => console.log('Continuing exercise...')}
              />
            )}
          </div>
      </div>
    </DashboardLayout>
  );
}
