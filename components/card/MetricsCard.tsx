import { IconType } from 'react-icons';
import { HiChartBar } from 'react-icons/hi2';

interface MetricItem {
  label: string;
  value: number;
}

interface MetricsCardProps {
  title: string;
  items: MetricItem[];
  icon?: IconType;
}

export function MetricsCard({ title, items, icon: Icon = HiChartBar }: MetricsCardProps) {
  return (
    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
      <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        <Icon className="h-4 w-4 text-zinc-500" />
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.label}</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
