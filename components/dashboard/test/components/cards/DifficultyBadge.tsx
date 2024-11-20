import { cn } from '@/lib/utils';
import { type DifficultyBadgeProps } from './types';

const colors = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
} as const;

export const DifficultyBadge = ({ level }: DifficultyBadgeProps) => (
  <span className={cn("px-2 py-1 rounded-md text-xs font-medium", colors[level as keyof typeof colors])}>
    {level}
  </span>
);
