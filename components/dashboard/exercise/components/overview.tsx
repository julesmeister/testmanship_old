"use client";

import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OverviewProps {
  difficultyLevel: string;
  weakestSkills: string[];
  lastUpdated: Date;
  onLevelChange?: (level: string) => void;
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

export default function ExerciseOverview({
  difficultyLevel,
  weakestSkills,
  lastUpdated,
  onLevelChange,
}: OverviewProps) {
  return (
    <div className="w-full group">
      <div className="grid grid-cols-4 gap-6">
        <motion.div 
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 p-4 shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-violet-600">Language Level</p>
              <div className="flex items-center gap-1 text-violet-500">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-medium">{difficultyLevel}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                <motion.button
                  key={level}
                  onClick={() => onLevelChange?.(level)}
                  className={cn(
                    "px-2 py-1.5 rounded text-xs font-medium transition-all",
                    "hover:bg-violet-200/50 relative overflow-hidden group",
                    difficultyLevel === level 
                      ? "bg-violet-500 text-white hover:bg-violet-600" 
                      : "bg-white/50 text-violet-700 hover:text-violet-900"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    initial={false}
                    animate={{
                      y: difficultyLevel === level ? 0 : 20,
                      opacity: difficultyLevel === level ? 1 : 0
                    }}
                    className="absolute inset-0 bg-violet-500/10"
                  />
                  <span className="relative">
                    {level}
                    {difficultyLevel === level && (
                      <motion.div
                        layoutId="activeLevel"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
                      />
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
            
            <div className="text-xs text-violet-600/80 font-medium">
              {difficultyLevel === 'A1' && 'Beginner - Basic phrases and expressions'}
              {difficultyLevel === 'A2' && 'Elementary - Simple, everyday language'}
              {difficultyLevel === 'B1' && 'Intermediate - Main points of clear standard input'}
              {difficultyLevel === 'B2' && 'Upper Intermediate - Complex text and technical discussion'}
              {difficultyLevel === 'C1' && 'Advanced - Complex and demanding texts'}
              {difficultyLevel === 'C2' && 'Mastery - Understanding with ease'}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 p-4 shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-600">Last Practice</p>
              <div className="flex items-center gap-1 text-blue-500">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex items-start -space-x-1">
                  <p className="text-6xl font-bold text-blue-700 leading-none">
                    {lastUpdated.toLocaleString('default', { day: 'numeric' })}
                  </p>
                  <div className="pt-1 pl-2">
                    <p className="text-base font-semibold text-blue-600 leading-tight">
                      {lastUpdated.toLocaleString('default', { month: 'long' })}
                    </p>
                    <p className="text-sm font-medium text-blue-500/80 leading-tight">
                      {lastUpdated.getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
              
              
              <div className="flex items-center justify-between text-xs pt-1">
                <p className="text-blue-600/80 font-medium">
                  {lastUpdated.toLocaleString('default', { 
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true 
                  })}
                </p>
                <motion.div 
                  className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700"
                  whileHover={{ scale: 1.05 }}
                >
                  {getTimeAgo(lastUpdated)}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="col-span-2 relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 p-4 shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-orange-600">Focus Areas</p>
              <div className="flex items-center gap-1 text-orange-500">
                <Target className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              {weakestSkills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
              >
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "group-hover:translate-x-1 transition-transform duration-200",
                    "bg-white/80 text-orange-700 hover:bg-white"
                  )}
                >
                  {skill}
                  <ArrowRight className="w-3 h-3 ml-1 inline-block opacity-100 transition-opacity duration-200" />
                </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
