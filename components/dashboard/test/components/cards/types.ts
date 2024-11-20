import { type ReactNode } from 'react';

export type IconComponent = React.ComponentType<{ className?: string }>;

export type ColorScheme = {
  [key: string]: string;
};

export interface BaseCardProps {
  title: string;
  icon?: IconComponent;
}

export interface GradientCardProps extends BaseCardProps {
  subtitle: string;
}

export interface InstructionsCardProps {
  instructions: string;
}

export interface InfoCardProps extends BaseCardProps {
  value: string | number;
  colorScheme: 'blue' | 'purple';
}

export interface FocusCardProps extends BaseCardProps {
  items: string[];
  colorScheme: 'emerald' | 'amber';
  icon: IconComponent;
}

export interface DifficultyBadgeProps {
  level: string;
}

export interface FooterStatsProps {
  timeAllocation: number;
  difficultyLevel: string;
}
