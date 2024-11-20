import { cn } from '@/lib/utils';
import { type FooterStatsProps } from './types';
import { DifficultyBadge } from './DifficultyBadge';
import { Clock, BarChart2 } from 'lucide-react';

export function FooterStats({ 
  stats,
  timeAllocation: propTimeAllocation,
  difficultyLevel: propDifficultyLevel,
  completionRate: propCompletionRate,
  attempts: propAttempts,
  className 
}: FooterStatsProps) {
  // Use direct props if provided, otherwise use stats object
  const timeAllocation = propTimeAllocation ?? stats?.timeAllocation;
  const difficultyLevel = propDifficultyLevel ?? stats?.difficultyLevel;
  const completionRate = propCompletionRate ?? stats?.completionRate;
  const attempts = propAttempts ?? stats?.attempts;

  return (
    <div
      className={cn(
        'mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-sm text-muted-foreground',
        'dark:border-slate-800',
        className
      )}
    >
      {timeAllocation && (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{timeAllocation} min</span>
        </div>
      )}
      {difficultyLevel && (
        <DifficultyBadge difficulty={difficultyLevel} size="sm" />
      )}
      {completionRate && (
        <div className="flex items-center gap-1">
          <BarChart2 className="h-4 w-4" />
          <span>{completionRate}% completed</span>
        </div>
      )}
      {attempts && (
        <div className="flex items-center gap-1">
          <span>{attempts} attempts</span>
        </div>
      )}
    </div>
  );
}
