import { motion } from 'framer-motion';
import { BookOpen, Brain, Target } from 'lucide-react';

const ExercisePlaceholder = () => {
  return (
    <div className="relative p-1">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col items-center justify-center p-12 space-y-8 text-center bg-gray-50 rounded-lg min-h-[400px] border-2 border-dashed border-blue-200 dark:bg-gray-900 dark:border-blue-700"
      >
        <div className="flex space-x-6">
          <BookOpen className="w-12 h-12 text-blue-500/70 dark:text-blue-400/70" />
          <Brain className="w-12 h-12 text-purple-500/70 dark:text-purple-400/70" />
          <Target className="w-12 h-12 text-green-500/70 dark:text-green-400/70" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Ready to Start Learning?
          </h3>
          <p className="text-gray-600 max-w-md dark:text-gray-300">
            Select an exercise from the list above to begin your language learning journey.
            Each exercise is tailored to help you improve your skills.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ExercisePlaceholder;
