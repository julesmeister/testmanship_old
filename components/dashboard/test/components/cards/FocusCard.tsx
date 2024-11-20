import { type FocusCardProps } from './types';

const colors = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-emerald-700 dark:text-emerald-300',
  amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-amber-700 dark:text-amber-300'
} as const;

export const FocusCard = ({ title, items, icon: Icon, colorScheme }: FocusCardProps) => (
  <div className={`p-4 rounded-lg border ${colors[colorScheme]}`}>
    <h3 className="flex items-center gap-2 font-medium mb-2">
      <Icon className="h-4 w-4" />
      {title}
    </h3>
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <span className={`mt-1 h-1 w-1 rounded-full bg-${colorScheme}-500`} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);
