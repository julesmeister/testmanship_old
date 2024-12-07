'use client';

import { motion } from 'framer-motion';
import { BookOpen, PenTool, RefreshCw } from 'lucide-react';

interface EmptyExerciseProps {
  exerciseType: string;
}

export default function EmptyExercise({ exerciseType }: EmptyExerciseProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center">

<motion.div
        initial={{ y: 0 }}
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-5xl mb-4"
      >
        👆
      </motion.div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 
        bg-gray-100 dark:bg-gray-800 
        px-3 py-1 
        rounded-full 
        inline-block 
        shadow-sm 
        hover:bg-gray-200 dark:hover:bg-gray-700 
        transition-all duration-300 
        cursor-default
        select-none"
      >
        Please select another exercise
      </p>
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <motion.div
          className="absolute -inset-1"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <RefreshCw className="w-12 h-12 text-blue-500/30" />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative bg-white dark:bg-gray-800 rounded-full p-2"
        >
          <BookOpen className="w-8 h-8 text-blue-500" />
        </motion.div>
      </motion.div>
          
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          No {exerciseType} Exercises Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          We're working on adding more exercises for this category. 
          Check back soon or try a different exercise type!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
      >
        <div className="flex items-center gap-1">
          <PenTool className="w-4 h-4" />
          <span>Coming Soon</span>
        </div>
      </motion.div>

      
    </div>
  );
}
