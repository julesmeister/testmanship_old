import { HiSparkles } from 'react-icons/hi2';
import { StateWrapper } from './StateWrapper';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = "No challenges found",
  description = "Try adjusting your search or difficulty level to find more challenges"
}: EmptyStateProps) {
  return (
    <StateWrapper>
      <HiSparkles className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-600" />
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </StateWrapper>
  );
}
