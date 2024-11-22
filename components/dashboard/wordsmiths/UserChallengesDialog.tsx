import { formatDistanceToNow } from 'date-fns';
import { Clock, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserProgress } from '@/types/wordsmith';
import { ChallengeAttempt } from '@/types/wordsmith';

interface UserChallengesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress | null;
  userChallenges: ChallengeAttempt[];
  isLoading: boolean;
  userName: string;
}

export function UserChallengesDialog({
  isOpen,
  onClose,
  userProgress,
  userChallenges,
  isLoading,
  userName,
}: UserChallengesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-sm border-none">
        <DialogHeader className="pr-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {userName}'s Journey
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track progress and view completed writing challenges
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <Badge variant="outline" className="px-3 py-1">
                  <Star className="h-3.5 w-3.5 text-primary mr-1" />
                  Wordsmith
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          {/* Progress Summary */}
          {userProgress && (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <div>
                <Label className="font-normal text-muted-foreground">Total Challenges</Label>
                <p className="mt-1 text-2xl font-semibold">{userProgress.total_challenges_completed}</p>
              </div>
              <div>
                <Label className="font-normal text-muted-foreground">Words Written</Label>
                <p className="mt-1 text-2xl font-semibold">{userProgress.total_words_written}</p>
              </div>
              <div>
                <Label className="font-normal text-muted-foreground">Time Spent</Label>
                <p className="mt-1 text-2xl font-semibold">{Math.round(userProgress.total_time_spent / 60)}h</p>
              </div>
              <div>
                <Label className="font-normal text-muted-foreground">Avg Performance</Label>
                <p className="mt-1 text-2xl font-semibold">
                  {(userProgress.average_performance * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Challenge History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Challenge History
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : userChallenges.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {userChallenges.map((attempt) => (
                  <Card key={attempt.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{attempt.challenge.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Completed {formatDistanceToNow(new Date(attempt.completed_at))} ago
                            </p>
                          </div>
                          <Badge variant={attempt.performance_score >= 0.8 ? "success" : "secondary"}>
                            {(attempt.performance_score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Words:</span>{' '}
                            {attempt.word_count}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>{' '}
                            {attempt.time_spent}m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Level:</span>{' '}
                            {attempt.challenge.difficulty_level}
                          </div>
                        </div>
                        {attempt.feedback && (
                          <p className="text-sm text-muted-foreground mt-2">{attempt.feedback}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-muted">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">No Challenges Yet</h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      This wordsmith hasn't completed any writing challenges. 
                      Check back later to see their progress and achievements.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
