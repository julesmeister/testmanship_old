import { useState, useMemo } from 'react';
import { Challenge } from '@/types/challenge';

export const difficultyLevels = [
  { 
    value: 'a1', 
    label: 'A1',
    bgColor: 'bg-emerald-500 dark:bg-emerald-600',
    textColor: 'text-white',
    inactiveTextColor: 'text-emerald-600 dark:text-emerald-500'
  },
  { 
    value: 'a2', 
    label: 'A2',
    bgColor: 'bg-teal-500 dark:bg-teal-600',
    textColor: 'text-white',
    inactiveTextColor: 'text-teal-600 dark:text-teal-500'
  },
  { 
    value: 'b1', 
    label: 'B1',
    bgColor: 'bg-amber-500 dark:bg-amber-600',
    textColor: 'text-white',
    inactiveTextColor: 'text-amber-600 dark:text-amber-500'
  },
  { 
    value: 'b2', 
    label: 'B2',
    bgColor: 'bg-orange-500 dark:bg-orange-600',
    textColor: 'text-white',
    inactiveTextColor: 'text-orange-600 dark:text-orange-500'
  },
  { 
    value: 'c1', 
    label: 'C1',
    bgColor: 'bg-rose-500 dark:bg-rose-600',
    textColor: 'text-white',
    inactiveTextColor: 'text-rose-600 dark:text-rose-500'
  },
  { 
    value: 'c2', 
    label: 'C2',
    bgColor: 'bg-red-600 dark:bg-red-700',
    textColor: 'text-white',
    inactiveTextColor: 'text-red-600 dark:text-red-500'
  }
] as const;

export function useChallengeFilters(challenges: Challenge[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           challenge.instructions.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = !selectedLevel || (challenge.difficulty_level && challenge.difficulty_level.toLowerCase() === selectedLevel);
      return matchesSearch && matchesLevel;
    });
  }, [challenges, searchQuery, selectedLevel]);

  return {
    searchQuery,
    setSearchQuery,
    selectedLevel,
    setSelectedLevel,
    filteredChallenges,
    difficultyLevels
  };
}
