import { type GradientCardProps } from './types';

export const GradientCard = ({ title, subtitle }: GradientCardProps) => (
  <div className="relative p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-emerald-50/40 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-emerald-950/10" />
    <div className="relative">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    </div>
  </div>
);
