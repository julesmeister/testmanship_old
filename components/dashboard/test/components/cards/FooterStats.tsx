import { HiClock } from 'react-icons/hi2';
import { type FooterStatsProps } from './types';
import { DifficultyBadge } from './DifficultyBadge';

export const FooterStats = ({ timeAllocation, difficultyLevel }: FooterStatsProps) => (
  <div className="flex items-center justify-between mt-4 px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <HiClock className="h-4 w-4" />
      <span>{timeAllocation} minutes</span>
    </div>
    <DifficultyBadge level={difficultyLevel} />
  </div>
);
