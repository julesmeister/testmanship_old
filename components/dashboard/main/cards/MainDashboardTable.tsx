import CardMenu from '@/components/card/CardMenu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { Loader2, ClipboardList } from "lucide-react";

type DifficultyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type Challenge = {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  performance: number;
  paragraphs: number;
  completedAt: Date;
  timeSpent: number;
  wordCount: number;
  feedback: string;
  format: string;
};

interface Props {
  user: User | null | undefined;
}

const MainDashboardTable = ({ user }: Props) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchChallengeAttempts = async () => {
      setIsLoading(true);
      try {
        // Get total count
        const { count } = await supabase
          .from('challenge_attempt_details')
          .select('*', { count: 'exact', head: true }).eq('user_id', user?.id);

        setTotalCount(count || 0);

        // Get paginated data
        const { data: attempts, error: attemptsError } = await supabase
          .from('challenge_attempt_details')
          .select(`
              attempt_id,
              challenge_id,
              content,
              difficulty_level,
              word_count,
              paragraph_count,
              time_spent,
              performance_score,
              completed_at,
              challenge_title,
              format_name
            `)
            .eq('user_id', user?.id)
          .order('completed_at', { ascending: false })
          .range((page - 1) * pageSize, (page * pageSize) - 1);

        if (attemptsError) throw attemptsError;

        const formattedChallenges = attempts.map(attempt => ({
          id: attempt.attempt_id,
          title: attempt.challenge_title,
          difficulty: attempt.difficulty_level,
          performance: attempt.performance_score,
          paragraphs: attempt.paragraph_count,
          completedAt: new Date(attempt.completed_at),
          timeSpent: attempt.time_spent,
          wordCount: attempt.word_count,
          format: attempt.format_name,
          feedback: ''
        }));

        setChallenges(formattedChallenges);
      } catch (error) {
        console.error('Error fetching challenge attempts:', error);
        toast.error('Failed to load challenge attempts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallengeAttempts();
  }, [page]);

  // Helper function to generate feedback based on score
  const generateFeedback = (score: number): string => {
    if (score >= 8.5) return "Excellent performance across all areas";
    if (score >= 7.5) return "Good performance, minor improvements needed";
    if (score >= 6.5) return "Satisfactory, areas for improvement identified";
    return "Needs improvement in key areas";
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} sec` : `${minutes} min`;
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">
          Recent Writing Challenges
        </h2>
        <Badge variant="outline" className="text-xs">
          Last 30 days
        </Badge>
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Challenge</TableHead>
              <TableHead className="text-right">Difficulty</TableHead>
              <TableHead className="text-right">Performance</TableHead>
              <TableHead className="text-right">Paragraphs</TableHead>
              <TableHead className="text-right">Words</TableHead>
              <TableHead className="text-right">Time Spent</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mb-4" />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Loading your challenges</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        Please wait while we fetch your challenge history and performance data...
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : challenges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="h-8 w-8 text-zinc-400 mb-4" />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">No challenges completed yet</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        Begin your learning journey by attempting your first writing challenge. Track your progress and improve your skills.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              challenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {challenge.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {challenge.format}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={getDifficultyColor(challenge.difficulty)}
                    >
                      {challenge.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${getPerformanceColor(challenge.performance)}`}>
                      {Math.round(challenge.performance)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {challenge.paragraphs}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {challenge.wordCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {formatTime(challenge.timeSpent)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-zinc-500 dark:text-zinc-400">
                    {format(challenge.completedAt, "MMM d, h:mm a")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
          <div className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{((page - 1) * pageSize) + 1}</span>{" "}
              to <span className="font-medium text-zinc-900 dark:text-zinc-100">{Math.min(page * pageSize, totalCount)}</span>{" "}
              of <span className="font-medium text-zinc-900 dark:text-zinc-100">{totalCount}</span> entries
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-4 text-sm"
            >
              Previous
            </Button>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Page {page}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= totalCount}
              className="h-8 px-4 text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Loading your challenges</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Please wait while we fetch your challenge history...</p>
              </div>
            </div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <ClipboardList className="h-8 w-8 text-zinc-400" />
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">No challenges completed yet</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Start your learning journey by attempting your first challenge.
                </p>
              </div>
            </div>
          </div>
        ) : (
          challenges.map((challenge) => (
            <div key={challenge.id} className="rounded-lg border p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {challenge.title}
                  </p>
                  <Badge
                    variant="secondary"
                    className={getDifficultyColor(challenge.difficulty)}
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {challenge.format}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Performance:</span>{" "}
                    <span className={`font-medium ${getPerformanceColor(challenge.performance)}`}>
                      {Math.round(challenge.performance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Paragraphs:</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {challenge.paragraphs}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Words:</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {challenge.wordCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Time:</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {formatTime(challenge.timeSpent)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {format(challenge.completedAt, "MMM d, h:mm a")}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

const getDifficultyColor = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case "A1":
    case "A2":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "B1":
    case "B2":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "C1":
    case "C2":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  }
};

const getPerformanceColor = (score: number) => {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  return "text-red-500";
};

export default MainDashboardTable;
