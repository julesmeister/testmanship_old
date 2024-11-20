import { cn } from '@/lib/utils';
import { type FocusCardProps } from './types';
import { IconType } from 'react-icons';
import { HiChevronRight } from 'react-icons/hi';

interface FocusCardProps {
  title: string;
  items: string[];
  icon: IconType;
  colorScheme: 'emerald' | 'amber';
}

export function FocusCard({ title, items, icon: Icon, colorScheme }: FocusCardProps) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800',
      title: 'text-emerald-900 dark:text-emerald-100',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-800',
      title: 'text-amber-900 dark:text-amber-100',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500'
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
      <h3 className={`flex items-center gap-2 font-medium ${colors.title} mb-2`}>
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className={`flex items-start gap-2 text-sm ${colors.text}`}>
            <HiChevronRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
