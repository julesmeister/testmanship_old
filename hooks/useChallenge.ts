import { useState, useCallback, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
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
        return;
      }

      // Get current user for creator info
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // Ensure all challenges have the created_by field
      const challengesWithCreator = data?.map(challenge => ({
        ...challenge,
        created_by: challenge.created_by || userId || 'unknown' // Use current user ID or 'unknown' as fallback
      })) || [];

      setChallenges(challengesWithCreator);
    } catch (err) {
      console.error('Error in fetchChallenges:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedLevel, searchQuery]);

  // Fetch challenges when level or search changes
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const filteredChallenges = challenges;
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedChallenges = filteredChallenges.slice(startIndex, startIndex + itemsPerPage);

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
    challenges: paginatedChallenges,
    selectedLevel,
    setSelectedLevel,
    searchQuery,
    setSearchQuery,
    showChallenges,
    setShowChallenges,
    showTip,
    setShowTip,
    currentPage,
    setCurrentPage,
    totalPages,
    outputCodeState,
    setOutputCodeState,
    isLoading,
    challengeCompleted,
    wordCount,
    paragraphs,
    timeSpent,
    performanceScore,
    feedback,
    handleStartChallenge,
    handleBackToChallenges,
    fetchChallenges,
  };
};
