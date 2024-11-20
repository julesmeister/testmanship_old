import { Loader2Icon } from 'lucide-react';
import { StateWrapper } from './StateWrapper';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({ 
  title = "Loading challenges",
  description = "Please wait while we fetch your challenges"
}: LoadingStateProps) {
  return (
    <StateWrapper>
      <Loader2Icon className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-600 animate-spin" />
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </StateWrapper>
  );
}
