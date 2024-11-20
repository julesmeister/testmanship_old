import { cn } from '@/lib/utils';
import { type InfoCardProps } from './types';

export function InfoCard({
  title,
  content,
  value,
  icon: Icon,
  colorScheme = 'blue',
  className,
}: InfoCardProps) {
  const colorVariants = {
    blue: 'from-blue-500/50 to-cyan-500/50 dark:from-blue-500/20 dark:to-cyan-500/20',
    purple: 'from-purple-500/50 to-pink-500/50 dark:from-purple-500/20 dark:to-pink-500/20',
    emerald: 'from-emerald-500/50 to-teal-500/50 dark:from-emerald-500/20 dark:to-teal-500/20',
    amber: 'from-amber-500/50 to-orange-500/50 dark:from-amber-500/20 dark:to-orange-500/20',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-background/95 p-6',
        'before:absolute before:inset-0 before:-translate-y-1/2 before:transform before:bg-gradient-to-br',
        colorVariants[colorScheme],
        'before:blur-2xl before:content-[""]',
        'dark:border-slate-800 dark:bg-slate-950/50',
        className
      )}
    >
      <div className="relative flex items-center gap-4">
        {Icon && <Icon className="h-6 w-6 text-foreground/80" />}
        <div>
          <h3 className="font-semibold">{title}</h3>
          <div className="text-sm text-muted-foreground">{value || content}</div>
        </div>
      </div>
    </div>
  );
}
