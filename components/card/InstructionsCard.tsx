import { cn } from '@/lib/utils';
import { type InstructionsCardProps } from './types';
import { BookOpen } from 'lucide-react';

export function InstructionsCard({
  instructions,
  className,
}: InstructionsCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-background p-6',
        'before:absolute before:inset-0 before:transform before:bg-gradient-to-br',
        'before:from-emerald-500/20 before:to-teal-500/20',
        'dark:before:from-emerald-500/10 dark:before:to-teal-500/10',
        'before:blur-2xl before:content-[""]',
        'dark:border-slate-800 dark:bg-slate-950/50',
        className
      )}
    >
      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-foreground/70" />
          <h3 className="font-medium">Instructions</h3>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {typeof instructions === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          ) : (
            instructions
          )}
        </div>
      </div>
    </div>
  );
}
