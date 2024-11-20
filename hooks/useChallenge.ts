import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { type Challenge } from '@/types/challenge';

export const useChallenge = (
  onStartChallenge: (challenge: Challenge) => void,
  onStopChallenge: () => void,
) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('a1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChallenges, setShowChallenges] = useState(true);
  const [showTip, setShowTip] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const supabase = createClientComponentClient();
  const itemsPerPage = 10;
  const [outputCodeState, setOutputCodeState] = useState('');

  const fetchChallenges = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    let query = supabase
      .from('challenges')
      .select('*')
      .eq('difficulty_level', selectedLevel.toUpperCase());
    
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to fetch challenges');
      return;
    }

    // Ensure all challenges have the created_by field
    const challengesWithCreator = data?.map(challenge => ({
      ...challenge,
      created_by: challenge.created_by || userId // Use current user ID as fallback
    })) || [];

    setChallenges(challengesWithCreator);
  }, [selectedLevel, searchQuery, supabase]);

  const handleStartChallenge = useCallback((challenge: Challenge) => {
    onStartChallenge(challenge);
    setShowTip(false);
    setShowChallenges(false);
    setOutputCodeState(''); // Clear feedback when starting new challenge
  }, [onStartChallenge]);

  const handleBackToChallenges = useCallback(() => {
    setShowChallenges(true);
    onStopChallenge();
    setShowTip(true);
    setSelectedLevel('a1');
  }, [onStopChallenge]);

  return {
    challenges,
    selectedLevel,
    searchQuery,
    showChallenges,
    showTip,
    currentPage,
    itemsPerPage,
    setSelectedLevel,
    setSearchQuery,
    setShowTip,
    setCurrentPage,
    setShowChallenges,
    handleStartChallenge,
    handleBackToChallenges,
    fetchChallenges,
    outputCodeState,
    setOutputCodeState,
  };
};
