import { Clock, PenTool, Target, Trophy, Gauge, Flame } from "lucide-react";

interface ProgressData {
  total_challenges_completed: number;
  total_words_written: number;
  total_time_spent: number;
  average_performance: number;
  last_active_level: string;
  longest_streak: number;
}

interface PerformanceOverviewProps {
  progress: ProgressData;
}

export function PerformanceOverview({ progress }: PerformanceOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
      <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Gauge className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Last Active Level
          </p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {progress.last_active_level || 'N/A'}
          </span>
        </div>
        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Difficulty
        </span>
      </div>
      
      <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
            <Trophy className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Challenges
          </p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {progress.total_challenges_completed || 0}
          </span>
        </div>
        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          completed challenges
        </span>
      </div>

      <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <PenTool className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Words Written
          </p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {progress.total_words_written?.toLocaleString() || 0}
          </span>
        </div>
        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          total words
        </span>
      </div>

      <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Time Spent
          </p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {Math.round(progress.total_time_spent / 60 || 0)}h
          </span>
        </div>
        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          total writing time
        </span>
      </div>

      <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Target className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Average Score
          </p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {progress.average_performance?.toFixed(1) || '0.0'}
          </span>
        </div>
        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          overall performance
        </span>
      </div>

      <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
            <Flame className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Longest Streak
          </p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {progress.longest_streak || 0}
          </span>
        </div>
        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          days in a row
        </span>
      </div>
    </div>
  );
}
