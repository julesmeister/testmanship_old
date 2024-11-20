import { cn } from '@/lib/utils';
import { type DifficultyBadgeProps } from './types';
import { getDifficultyDescription } from '@/types/difficulty';

export function DifficultyBadge({
  difficulty,
  size = 'md',
  className,
}: DifficultyBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const colorClasses = {
    'A1': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20',
    'A2': 'bg-teal-500/10 text-teal-700 dark:text-teal-400 ring-teal-500/20',
    'B1': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/20',
    'B2': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-indigo-500/20',
    'C1': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-purple-500/20',
    'C2': 'bg-pink-500/10 text-pink-700 dark:text-pink-400 ring-pink-500/20',
  };

  const description = getDifficultyDescription(difficulty);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium ring-1 ring-inset',
        sizeClasses[size],
        colorClasses[difficulty],
        className
      )}
      title={description}
    >
      {difficulty}
    </span>
  );
}
