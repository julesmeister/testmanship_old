import { HiClock } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

interface FooterStatsProps {
  timeAllocation: number;
  difficultyLevel: string;
}

export function FooterStats({ timeAllocation, difficultyLevel }: FooterStatsProps) {
  return (
    <div className="flex items-center justify-between mt-4 px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <HiClock className="h-4 w-4" />
        <span>{timeAllocation} minutes</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={cn(
          "px-2 py-1 rounded-md text-xs font-medium",
          difficultyLevel === "Beginner" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
          difficultyLevel === "Intermediate" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
          difficultyLevel === "Advanced" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        )}>
          {difficultyLevel}
        </span>
      </div>
    </div>
  );
}
