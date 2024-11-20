import { cn } from '@/lib/utils';
import { type FocusCardProps } from './types';

export function FocusCard({
  title,
  content,
  items,
  highlight,
  icon: Icon,
  className,
  colorScheme = 'blue',
}: FocusCardProps) {
  const colors = {
    emerald: 'before:from-emerald-500/30 before:to-emerald-600/30 dark:before:from-emerald-500/10 dark:before:to-emerald-600/10',
    amber: 'before:from-amber-500/30 before:to-orange-500/30 dark:before:from-amber-500/10 dark:before:to-orange-500/10',
    blue: 'before:from-blue-500/20 before:to-cyan-500/20 dark:before:from-blue-500/10 dark:before:to-cyan-500/10'
  } as const;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-background p-6',
        'before:absolute before:inset-0 before:transform before:bg-gradient-to-br',
        colors[colorScheme as keyof typeof colors],
        'before:blur-2xl before:content-[""]',
        'dark:border-slate-800 dark:bg-slate-950/50',
        className
      )}
    >
      <div className="relative space-y-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-foreground/70" />}
          <h3 className="font-medium">{title}</h3>
        </div>
        {content && <div className="text-sm text-muted-foreground">{content}</div>}
        {items && (
          <ul className="space-y-1.5">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full bg-${colorScheme}-500`} />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
