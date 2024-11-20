import { cn } from '@/lib/utils';
import { type GradientCardProps } from './types';

export function GradientCard({
  title,
  subtitle,
  className,
  children,
}: GradientCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-background p-6',
        'before:absolute before:inset-0 before:-translate-y-1/2 before:transform before:bg-gradient-to-br before:from-purple-500/25 before:to-blue-500/25 before:blur-3xl before:content-[""]',
        'dark:border-slate-800 dark:bg-slate-950/50',
        className
      )}
    >
      {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
      {subtitle && <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}
