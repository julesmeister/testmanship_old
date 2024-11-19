import { Clock } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { DifficultyBadge } from './DifficultyBadge';

interface ChallengeCardProps {
  challenge: Challenge;
  onClick: () => void;
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  return (
    <div
      onClick={onClick}
      className="block group cursor-pointer"
    >
      <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <DifficultyBadge level={challenge.difficulty_level} />
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {challenge.time_allocation} min
            </span>
          </div>

          <div>
            <h3 className="font-medium text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {challenge.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {challenge.instructions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
