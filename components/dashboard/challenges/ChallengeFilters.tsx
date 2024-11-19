import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
      <div className="w-full max-w-md">
        <div className="relative w-full">
          <form onSubmit={(e) => {
            e.preventDefault();
            onSearchChange(localSearchQuery);
          }} className="relative group">
            <div className="relative flex-1">
              <div className="relative flex items-center">
                <Input
                  placeholder="Search in titles and instructions..."
                  className="pl-11 pr-11 bg-white dark:bg-zinc-900 h-11 text-base transition-shadow duration-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
                <div className="absolute left-0 inset-y-0 w-11 flex items-center justify-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                {localSearchQuery && (
                  <div className="absolute right-0 inset-y-0 w-11 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearchQuery('');
                        onSearchChange('');
                      }}
                      className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 -z-10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x blur-xl" />
              </div>
            </div>
          </form>
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
              <X className="h-3.5 w-3.5 text-current opacity-70 hover:opacity-100" />
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
