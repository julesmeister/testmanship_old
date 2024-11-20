import { Search, X } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { difficultyButtonColors } from './constants';
import { difficultyLevels, FilterLevel } from '@/hooks/useChallengeFilters';

interface ChallengeFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLevel: FilterLevel;
  onLevelChange: (level: FilterLevel) => void;
  showUserChallengesOnly: boolean;
  onShowUserChallengesChange: (show: boolean) => void;
  userChallengesCount: number;
  totalChallengesCount: number;
  difficultyLevels: readonly { value: string; label: string }[];
}

export function ChallengeFilters({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  showUserChallengesOnly,
  onShowUserChallengesChange,
  userChallengesCount,
  totalChallengesCount,
  difficultyLevels
}: ChallengeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
      <div className="w-full max-w-md">
        <div className="relative w-full">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search in titles and instructions..."
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {difficultyLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onLevelChange(level.value.toUpperCase() as FilterLevel)}
            className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedLevel === level.value.toUpperCase()
              ? difficultyButtonColors[level.value as keyof typeof difficultyButtonColors]
              : 'bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground'
            }`}
          >
            {level.label}
            {selectedLevel === level.value.toUpperCase() && (
              <X 
                className="h-3.5 w-3.5 text-current opacity-70 hover:opacity-100 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the button click from firing
                  onLevelChange(null);
                }}
              />
            )}
          </button>
        ))}
        {selectedLevel && (
          <button
            onClick={() => onLevelChange(null)}
            className="px-2 py-1 rounded-md text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
