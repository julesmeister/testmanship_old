import { cn } from '@/lib/utils';
import { IconType } from 'react-icons';
import { HiCheckCircle } from 'react-icons/hi2';

interface ChecklistCardProps {
  title: string;
  items: string[];
  icon: IconType;
  colorScheme: 'emerald' | 'amber' | 'red' | 'blue' | 'purple' | 'indigo' | 'slate';
  checked?: boolean[];
  onItemCheck?: (index: number, isChecked: boolean) => void;
}

export function ChecklistCard({ 
  title, 
  items, 
  icon: Icon, 
  colorScheme,
  checked = items.map(() => false),
  onItemCheck
}: ChecklistCardProps) {
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
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-100 dark:border-red-800',
      title: 'text-red-900 dark:text-red-100',
      text: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-500'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800',
      title: 'text-blue-900 dark:text-blue-100',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-100 dark:border-purple-800',
      title: 'text-purple-900 dark:text-purple-100',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-100 dark:border-indigo-800',
      title: 'text-indigo-900 dark:text-indigo-100',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-500'
    },
    slate: {
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      border: 'border-slate-200 dark:border-slate-800',
      title: 'text-slate-900 dark:text-slate-50',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-600'
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
            <HiCheckCircle 
              className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                checked[index] ? "text-emerald-500 dark:text-emerald-400" : "text-gray-300 dark:text-gray-600"
              )} 
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
