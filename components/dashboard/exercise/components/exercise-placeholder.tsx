import { motion } from 'framer-motion';
import { BookOpen, Brain, Target } from 'lucide-react';

const ExercisePlaceholder = () => {
  return (
    <div className="relative p-1">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          background: [
            "linear-gradient(90deg, #3b82f6 50%, transparent 50%) top/8px 1px repeat-x, linear-gradient(90deg, #3b82f6 50%, transparent 50%) bottom/8px 1px repeat-x, linear-gradient(0deg, #3b82f6 50%, transparent 50%) left/1px 8px repeat-y, linear-gradient(0deg, #3b82f6 50%, transparent 50%) right/1px 8px repeat-y"
          ],
          backgroundPosition: [
            "0 0, 0 100%, 0 0, 100% 0",
            "-8px 0, 8px 100%, 0 -8px, 100% 8px"
          ],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative flex flex-col items-center justify-center p-12 space-y-8 text-center bg-gray-50 rounded-lg min-h-[400px]"
      >
        <motion.div 
          className="flex space-x-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <BookOpen className="w-12 h-12 text-blue-500" />
          <Brain className="w-12 h-12 text-purple-500" />
          <Target className="w-12 h-12 text-green-500" />
        </motion.div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800">
            Ready to Start Learning?
          </h3>
          <p className="text-gray-600 max-w-md">
            Select an exercise from the list above to begin your language learning journey.
            Each exercise is tailored to help you improve your skills.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ExercisePlaceholder;
