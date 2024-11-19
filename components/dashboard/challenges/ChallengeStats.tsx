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
    <div className="flex gap-8 mt-4">
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors relative group"
        onClick={onToggleUserChallenges}
      >
        <div className="p-2 rounded-md bg-primary/10">
          <PenLine className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">{userCount}</span>
          <span className="text-sm font-medium text-muted-foreground">Your challenges</span>
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
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50">
        <div className="p-2 rounded-md bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">{totalCount}</span>
          <span className="text-sm font-medium text-muted-foreground">Community challenges</span>
        </div>
      </div>
    </div>
  );
}
