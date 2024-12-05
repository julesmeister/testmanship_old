import { PenLine, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import cn from 'classnames';

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
    <div className="flex flex-col sm:flex-row gap-4 rounded-xl bg-muted dark:bg-zinc-900 p-4">
      <div 
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg bg-card border shadow-sm flex-1 relative cursor-pointer hover:bg-accent/50 transition-colors",
          "dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700/50",
          showUserChallengesOnly && "ring-2 ring-primary/50 dark:ring-2 dark:ring-primary"
        )}
        onClick={onToggleUserChallenges}
      >
        <div className={cn(
          "p-2 rounded-md bg-primary/10",
          "dark:bg-primary/30",
          showUserChallengesOnly && "dark:bg-primary/40"
        )}>
          <PenLine className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground dark:text-white">{userCount}</span>
          <span className={cn(
            "text-sm font-medium text-muted-foreground",
            "dark:text-zinc-300",
            showUserChallengesOnly && "dark:text-primary"
          )}>{showUserChallengesOnly ? "Showing your challenges only" : "Your challenges"}</span>
        </div>
        {showUserChallengesOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background dark:bg-zinc-700 border dark:border-zinc-600 shadow-sm transition-colors hover:dark:bg-zinc-600"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilter();
            }}
          >
            <X className="h-3 w-3 text-zinc-600 dark:text-zinc-300" />
            <span className="sr-only">Clear filter</span>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border shadow-sm flex-1 dark:bg-zinc-800 dark:border-zinc-700">
        <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/30">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground dark:text-white">{totalCount}</span>
          <span className="text-sm font-medium text-muted-foreground dark:text-zinc-300">Community challenges</span>
        </div>
      </div>
    </div>
  );
}
