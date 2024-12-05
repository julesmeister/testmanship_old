'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ListChecks } from 'lucide-react';

export default function SelectExercise() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center p-12 space-y-6 mt-4"
    >

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ 
          scale: [0.95, 1.05, 0.95],
          backgroundColor: [
            "rgba(59, 130, 246, 0.4)",
            "rgba(59, 130, 246, 0)",
            "rgba(59, 130, 246, 0.4)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative rounded-full p-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r -full blur-xl" />
        <div className="relative bg-white dark:bg-gray-800 rounded-full p-4">
          <ListChecks className="w-12 h-12 text-blue-500" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2 max-w-md"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Select an Exercise
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Choose an exercise from the list on the left to get started with your language learning journey.
        </p>
      </motion.div>
    </motion.div>
  );
}
