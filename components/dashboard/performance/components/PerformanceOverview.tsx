import { Clock, PenTool, Target, Trophy, Gauge, Flame } from "lucide-react";
import { StatsCard } from '@/components/card/StatsCard';

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
      <StatsCard
        icon={<Gauge className="h-5 w-5" />}
        iconBgColor="bg-amber-500/10"
        iconTextColor="text-amber-500"
        title="Last Active Level"
        value={progress.last_active_level || 'N/A'}
        subtitle="Difficulty"
      />
      
      <StatsCard
        icon={<Trophy className="h-5 w-5" />}
        iconBgColor="bg-orange-500/10"
        iconTextColor="text-orange-500"
        title="Total Challenges"
        value={progress.total_challenges_completed || 0}
        subtitle="completed challenges"
      />

      <StatsCard
        icon={<PenTool className="h-5 w-5" />}
        iconBgColor="bg-blue-500/10"
        iconTextColor="text-blue-500"
        title="Words Written"
        value={progress.total_words_written?.toLocaleString() || 0}
        subtitle="total words"
      />

      <StatsCard
        icon={<Clock className="h-5 w-5" />}
        iconBgColor="bg-green-500/10"
        iconTextColor="text-green-500"
        title="Time Spent"
        value={`${Math.round(progress.total_time_spent / 60 || 0)}h`}
        subtitle="total writing time"
      />

      <StatsCard
        icon={<Target className="h-5 w-5" />}
        iconBgColor="bg-purple-500/10"
        iconTextColor="text-purple-500"
        title="Average Score"
        value={progress.average_performance?.toFixed(1) || '0.0'}
        subtitle="overall performance"
      />

      <StatsCard
        icon={<Flame className="h-5 w-5" />}
        iconBgColor="bg-red-500/10"
        iconTextColor="text-red-500"
        title="Longest Streak"
        value={progress.longest_streak || 0}
        subtitle="days in a row"
      />
    </div>
  );
}
