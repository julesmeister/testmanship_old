import { difficultyColors } from './constants';

interface DifficultyBadgeProps {
  level: string | null;
  className?: string;
}

export function DifficultyBadge({ level, className = '' }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
        level ? difficultyColors[level.toLowerCase()] || 'bg-secondary text-secondary-foreground'
        : 'bg-secondary text-secondary-foreground'
      } ${className}`}
    >
      {level ? level.toUpperCase() : 'N/A'}
    </span>
  );
}
