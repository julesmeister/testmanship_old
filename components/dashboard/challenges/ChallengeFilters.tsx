import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { difficultyButtonColors } from './constants';
import { difficultyLevels, FilterLevel } from '@/hooks/useChallengeFilters';

interface ChallengeFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedLevel: FilterLevel;
  onLevelChange: (level: FilterLevel) => void;
  difficultyLevels: readonly { value: string; label: string }[];
}

export function ChallengeFilters({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  difficultyLevels
}: ChallengeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
      <div className="w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            className="pl-9 bg-background w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
