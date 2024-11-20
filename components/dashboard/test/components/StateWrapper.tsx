import { ReactNode } from 'react';

interface StateWrapperProps {
  children: ReactNode;
}

export function StateWrapper({ children }: StateWrapperProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/40 via-zinc-50/30 to-zinc-50/20 dark:from-zinc-950/20 dark:via-zinc-950/15 dark:to-zinc-950/10" />
      <div className="relative text-center space-y-3">
        {children}
      </div>
    </div>
  );
}
