import { PenLine, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ChallengeStatsProps {
  userCount: number;
  totalCount: number;
  showUserChallengesOnly: boolean;
  onToggleUserChallenges: () => void;
  onClearFilter: () => void;
}

export function ChallengeStats({
  userCount,
  totalCount,
  showUserChallengesOnly,
  onToggleUserChallenges,
  onClearFilter
}: ChallengeStatsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
      <div 
        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800/50 shadow-sm flex-1"
        onClick={onToggleUserChallenges}
      >
        <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/20">
          <PenLine className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{userCount}</span>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Your challenges</span>
        </div>
        {showUserChallengesOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilter();
            }}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear filter</span>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800/50 shadow-sm flex-1">
        <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/20">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalCount}</span>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Community challenges</span>
        </div>
      </div>
    </div>
  );
}
