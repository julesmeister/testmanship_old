import { ReactNode } from 'react';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

interface StatsCardProps {
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  title: string;
  value: string | number;
  change?: number;
  subtitle: string;
}

export function StatsCard({
  icon,
  iconBgColor,
  iconTextColor,
  title,
  value,
  change,
  subtitle
}: StatsCardProps) {
  return (
    <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
          {value}
        </span>
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${change > 0 ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}>
            {change > 0 ? (
              <MdArrowUpward className="h-3 w-3" />
            ) : (
              <MdArrowDownward className="h-3 w-3" />
            )}
            <span>{change > 0 ? `+${change}` : change}</span>
          </div>
        )}
      </div>
      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {subtitle}
      </span>
    </div>
  );
}
