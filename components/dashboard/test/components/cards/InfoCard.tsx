import { type InfoCardProps } from './types';

const colors = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-900 dark:text-purple-100 text-purple-700 dark:text-purple-300'
} as const;

export const InfoCard = ({ title, value, icon: Icon, colorScheme }: InfoCardProps) => (
  <div className={`p-3 rounded-lg border ${colors[colorScheme]}`}>
    <h3 className="flex items-center gap-2 text-sm font-medium mb-1">
      <Icon className="h-4 w-4" />
      {title}
    </h3>
    <p className="text-sm">{value}</p>
  </div>
);
