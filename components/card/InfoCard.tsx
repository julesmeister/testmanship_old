import { IconType } from 'react-icons';

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  colorScheme: 'blue' | 'purple';
}

export function InfoCard({ title, value, icon: Icon, colorScheme }: InfoCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800',
      title: 'text-blue-900 dark:text-blue-100',
      value: 'text-blue-700 dark:text-blue-300',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-100 dark:border-purple-800',
      title: 'text-purple-900 dark:text-purple-100',
      value: 'text-purple-700 dark:text-purple-300',
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
      <h3 className={`flex items-center gap-2 text-sm font-medium ${colors.title} mb-1`}>
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <p className={`text-sm ${colors.value}`}>
        {value}
      </p>
    </div>
  );
}
