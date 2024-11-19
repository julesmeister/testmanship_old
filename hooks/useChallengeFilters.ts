import { useState, useMemo } from 'react';
import { Challenge } from '@/types/challenge';

export const difficultyLevels = [
  { 
    value: 'a1', 
    label: 'A1',
    bgColor: 'bg-emerald-600 dark:bg-emerald-500',
    textColor: 'text-white',
    inactiveTextColor: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
  },
  { 
    value: 'a2', 
    label: 'A2',
    bgColor: 'bg-green-600 dark:bg-green-500',
    textColor: 'text-white',
    inactiveTextColor: 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'
  },
  { 
    value: 'b1', 
    label: 'B1',
    bgColor: 'bg-yellow-900 dark:bg-yellow-500',
    textColor: 'text-white',
    inactiveTextColor: 'text-yellow-800 dark:text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-500'
  },
  { 
    value: 'b2', 
    label: 'B2',
    bgColor: 'bg-orange-600 dark:bg-orange-500',
    textColor: 'text-white',
    inactiveTextColor: 'text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300'
  },
  { 
    value: 'c1', 
    label: 'C1',
    bgColor: 'bg-rose-600 dark:bg-rose-500',
    textColor: 'text-white',
    inactiveTextColor: 'text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300'
  },
  { 
    value: 'c2', 
    label: 'C2',
    bgColor: 'bg-red-600 dark:bg-red-500',
    textColor: 'text-white',
    inactiveTextColor: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
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
