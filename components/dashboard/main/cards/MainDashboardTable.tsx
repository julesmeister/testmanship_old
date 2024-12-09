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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { diffWords } from 'diff';

import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from 'sonner';
import { Loader2, ClipboardList, Eye, Trash2, AlertTriangle, AlertCircle, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Sparkles, PenSquare } from "lucide-react";
import { useChallengeAttempts } from '@/hooks/useChallengeAttempts';
import { ChallengeAttempt, DifficultyLevel } from '@/types/challenge';

const MainDashboardTable = ({ 
  user, 
  userDetails, 
  session, 
  supabase 
}: { 
  user: any, 
  userDetails: any, 
  session: any, 
  supabase: any 
}) => {
  const { 
    challengesAttempts, 
    totalCount, 
    isLoading, 
    fetchChallengeAttempts,
    setChallengesAttempts,
    setTotalCount
  } = useChallengeAttempts();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (user) {
      fetchChallengeAttempts({
        supabase, 
        userId: user.id, 
        page, 
        pageSize
      });
    }
  }, [user, page, fetchChallengeAttempts, supabase]);

  const [selectedChallengeAttempt, setSelectedChallengeAttempt] = useState<ChallengeAttempt | null>(null);
  const [diffResult, setDiffResult] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedChallengeAttempt) {
      const diff = diffWords(selectedChallengeAttempt.content, selectedChallengeAttempt.feedback);
      setDiffResult(diff);
    }
  }, [selectedChallengeAttempt]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} sec` : `${minutes} min`;
  };

  const getPerformanceEmoji = (score: number): string => {
    if (score >= 85) return "🤩"; // Star-struck face for excellent
    if (score >= 75) return "😊"; // Smiling face for good
    if (score >= 65) return "🙂"; // Slightly smiling face for satisfactory
    if (score >= 55) return "😐"; // Neutral face for needs improvement
    return "😟"; // Worried face for poor performance
  };

  const handleDeleteClick = (challengeId: string) => {
    setChallengeToDelete(challengeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!challengeToDelete || !user) return;

    try {
      const { error } = await supabase
        .from('challenge_attempts')
        .delete()
        .eq('id', challengeToDelete)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove the deleted challenge from the local state
      const updatedChallengeAttempts = challengesAttempts.filter(
        (challenge: ChallengeAttempt) => challenge.id !== challengeToDelete
      );

      // Update the challenges state and total count
      setChallengesAttempts(updatedChallengeAttempts);
      setTotalCount(prevCount => prevCount - 1);

      toast.success('Challenge attempt deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge attempt', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleViewChallenge = (challenge: ChallengeAttempt) => {
    setSelectedChallengeAttempt(challenge);
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">
          Recent Writing Challenges
        </h2>
        <Badge variant="outline" className="text-xs">
          Last 5 entries
        </Badge>
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] text-zinc-900 dark:text-zinc-100">Challenge</TableHead>
              <TableHead className="text-right text-zinc-900 dark:text-zinc-100">Difficulty</TableHead>
              <TableHead className="text-right text-zinc-900 dark:text-zinc-100">Performance</TableHead>
              <TableHead className="text-right text-zinc-900 dark:text-zinc-100">Paragraphs</TableHead>
              <TableHead className="text-right text-zinc-900 dark:text-zinc-100">Words</TableHead>
              <TableHead className="text-right text-zinc-900 dark:text-zinc-100">Time Spent</TableHead>
              <TableHead className="text-right text-zinc-900 dark:text-zinc-100">Date</TableHead>
              <TableHead className="text-center text-zinc-900 dark:text-zinc-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
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
            ) : challengesAttempts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="h-8 w-8 text-zinc-400 mb-4" />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-8">No challenges completed yet</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <div className="flex flex-col items-center p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                          <Sparkles className="w-8 h-8 text-indigo-500 mb-4" />
                          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">Generate a Challenge</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                            Create a personalized writing challenge using our AI-powered Challenge Generator. Customize the topic, difficulty, and format to match your learning goals.
                          </p>
                        </div>
                        <div className="flex flex-col items-center p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                          <PenSquare className="w-8 h-8 text-indigo-500 mb-4" />
                          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">Take a Challenge</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                            Visit the Test section to start your writing journey. Choose from your generated challenges or explore challenges created by other learners in the community.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              challengesAttempts.map((challenge) => (
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
                      className={getDifficultyColor(challenge.difficulty as DifficultyLevel)}
                    >
                      {challenge.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${getPerformanceColor(challenge.performance)}`}>
                      {Math.round(challenge.performance)} | {getPerformanceEmoji(challenge.performance)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {challenge.paragraphs}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {challenge.word_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {formatTime(challenge.time_spent)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-zinc-500 dark:text-zinc-400">
                    {format(challenge.completed_at, "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:inline-flex"
                        onClick={() => handleViewChallenge(challenge)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:inline-flex"
                        onClick={() => handleDeleteClick(challenge.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
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
        ) : challengesAttempts.length === 0 ? (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <ClipboardList className="h-8 w-8 text-zinc-400" />
              <div className="space-y-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-8">No challenges completed yet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="flex flex-col items-center p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <Sparkles className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">Generate a Challenge</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      Create a personalized writing challenge using our AI-powered Challenge Generator. Customize the topic, difficulty, and format to match your learning goals.
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <PenSquare className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">Take a Challenge</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      Visit the Test section to start your writing journey. Choose from your generated challenges or explore challenges created by other learners in the community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          challengesAttempts.map((challenge) => (
            <div key={challenge.id} className="rounded-lg border p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {challenge.title}
                  </p>
                  <Badge
                    variant="secondary"
                    className={getDifficultyColor(challenge.difficulty as DifficultyLevel)}
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
                    <div className="flex items-center gap-1">
                      <span className={`font-medium ${getPerformanceColor(challenge.performance)}`}>
                        {Math.round(challenge.performance)} {getPerformanceEmoji(challenge.performance)}
                      </span>
                    </div>
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
                      {challenge.word_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Time:</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {formatTime(challenge.time_spent)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {format(challenge.completed_at, "MMM d, h:mm a")}
              </div>
              <div className="flex flex-row gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 [&>svg]:group-hover:text-foreground dark:[&>svg]:group-hover:text-white group"
                  onClick={() => handleViewChallenge(challenge)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDeleteClick(challenge.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Challenge Details Dialog */}
      <Dialog open={!!selectedChallengeAttempt} onOpenChange={() => setSelectedChallengeAttempt(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <span>{selectedChallengeAttempt?.title}</span>
              <Badge variant="outline">{selectedChallengeAttempt?.difficulty}</Badge>
            </DialogTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
              <div className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                <span>{selectedChallengeAttempt?.paragraphs} paragraphs</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`font-medium ${getPerformanceColor(selectedChallengeAttempt?.performance || 0)}`}>
                  Score: {selectedChallengeAttempt?.performance} {getPerformanceEmoji(selectedChallengeAttempt?.performance || 0)}
                </span>
              </div>
              <div>
                {format(selectedChallengeAttempt?.completed_at || new Date(), "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Original Version</span>
                  <Badge variant="secondary" className="text-xs">Before</Badge>
                </h3>
              </div>
              <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 min-h-[400px] overflow-y-auto whitespace-pre-wrap border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {diffResult.map((part, index) => (
                  <span
                    key={index}
                    className={
                      part.removed ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
                      !part.added ? 'text-zinc-900 dark:text-zinc-100' : ''
                    }
                  >
                    {!part.added ? part.value : ''}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Enhanced Version</span>
                  <Badge variant="secondary" className="text-xs">After</Badge>
                </h3>
              </div>
              <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 min-h-[400px] overflow-y-auto whitespace-pre-wrap border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {diffResult.map((part, index) => (
                  <span
                    key={index}
                    className={
                      part.added ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                      !part.removed ? 'text-zinc-900 dark:text-zinc-100' : ''
                    }
                  >
                    {!part.removed ? part.value : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Evaluation
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the evaluation and all associated data.
            </p>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              <div className="space-y-1">
                <p className="font-medium">Are you absolutely sure?</p>
                <p className="text-sm text-muted-foreground">
                  All evaluation data including performance metrics and feedback will be permanently removed.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Evaluation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
