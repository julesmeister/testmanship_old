import { Clock, PenLine, Pencil, ArrowRight } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DifficultyBadge } from './DifficultyBadge';

interface ChallengeDialogProps {
  challenge: Challenge | null;
  creatorName: string;
  isCurrentUser: boolean;
  onClose: () => void;
}

export function ChallengeDialog({
  challenge,
  creatorName,
  isCurrentUser,
  onClose,
}: ChallengeDialogProps) {
  const router = useRouter();

  if (!challenge) return null;

  return (
    <Dialog open={!!challenge} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-sm border-none">
        <DialogHeader className="pr-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <DifficultyBadge 
                  level={challenge.difficulty_level} 
                  className="px-2.5 py-1"
                />
                {isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/challenge-generator?mode=edit&id=${challenge.id}`);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Clock className="h-4 w-4" />
                {challenge.time_allocation} minutes
              </span>
            </div>
            <DialogTitle className="text-2xl font-semibold pr-6">
              {challenge.title}
              {creatorName ? (
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  Created by {creatorName}
                </div>
              ) : (
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  Loading creator...
                </div>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-1 space-y-6">
          {/* Main Challenge Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 space-y-2 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">Time Allocation</h4>
              </div>
              <p className="text-2xl font-semibold text-blue-900 dark:text-blue-50">{challenge.time_allocation} min</p>
            </div>
            {challenge.word_count && (
              <div className="p-4 rounded-lg bg-emerald-500/10 space-y-2 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-medium text-sm text-emerald-700 dark:text-emerald-300">Target Word Count</h4>
                </div>
                <p className="text-2xl font-semibold text-emerald-900 dark:text-emerald-50">{challenge.word_count} words</p>
              </div>
            )}
          </div>

          {/* Instructions Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Instructions</h4>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-foreground leading-relaxed">
                {challenge.instructions}
              </p>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenge.grammar_focus && challenge.grammar_focus.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">Grammar Focus</h4>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {challenge.grammar_focus.map((item, index) => (
                    <div key={index} className="px-2.5 py-1 rounded-md bg-blue-500/10 text-sm border border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {challenge.vocabulary_themes && challenge.vocabulary_themes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">Vocabulary Themes</h4>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {challenge.vocabulary_themes.map((theme, index) => (
                    <div key={index} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-sm border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                      {theme}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Start Challenge Button */}
          <div className="pt-4">
            <Link href={`/dashboard/test?challenge=${challenge.id}`}>
              <Button className="w-full gap-2 h-12 text-base">
                Start Challenge
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
