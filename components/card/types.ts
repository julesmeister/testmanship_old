import { type ReactNode } from 'react';
import { DifficultyLevel } from '@/types/difficulty';

export type IconComponent = React.ComponentType<{ className?: string }>;

export type ColorScheme = {
  [key: string]: string;
};

export interface CardBase {
  className?: string;
  children?: ReactNode;
}

export interface GradientCardProps extends CardBase {
  title?: string;
  subtitle?: string;
}

export interface InstructionsCardProps extends CardBase {
  instructions: string | ReactNode;
}

export interface InfoCardProps extends CardBase {
  title: string;
  content?: string | ReactNode;
  value?: string | number;
  icon?: IconComponent;
  colorScheme?: 'blue' | 'purple' | 'emerald' | 'amber';
}

export interface FocusCardProps extends CardBase {
  title: string;
  content?: string | ReactNode;
  items?: string[];
  highlight?: boolean;
  icon?: IconComponent;
  colorScheme?: 'emerald' | 'amber';
}

export interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface Stats {
  timeAllocation?: number;
  difficultyLevel?: string;
  completionRate?: number;
  attempts?: number;
}

export interface FooterStatsProps extends Stats {
  stats?: Stats;
  className?: string;
}
