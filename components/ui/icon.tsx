'use client';

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export function Icon({ icon: Icon, className, size = 'md' }: IconProps) {
  return (
    <Icon className={cn(sizeMap[size], 'stroke-2', className)} />
  );
}
