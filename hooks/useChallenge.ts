import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  instructions: string;
  difficulty_level: string;
  time_allocation: number;
  word_count?: number;
  grammar_focus?: string[];
  vocabulary_themes?: string[];
}

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

  const fetchChallenges = useCallback(async () => {
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

    setChallenges(data || []);
  }, [selectedLevel, searchQuery, supabase]);

  const handleStartChallenge = useCallback((challenge: Challenge) => {
    onStartChallenge(challenge);
    setShowTip(false);
    setShowChallenges(false);
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
  };
};
