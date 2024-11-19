'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HiClock, HiDocumentText, HiPlay } from 'react-icons/hi2';
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  instructions: string;
  difficulty_level: string;
  time_allocation: number;
  word_count?: number;
  grammar_focus?: string[];
  vocabulary_themes?: string[];
}

interface ChallengeCardProps {
  challenge: Challenge;
  onStart: (challenge: Challenge) => void;
}

export const ChallengeCard = ({ challenge, onStart }: ChallengeCardProps) => (
  <div className="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-emerald-50/20 dark:from-blue-950/20 dark:via-purple-950/15 dark:to-emerald-950/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{challenge.title}</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {challenge.instructions.split('\n')[0]}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <HiClock className="h-3.5 w-3.5" />
              {challenge.time_allocation} minutes
            </div>
            {challenge.word_count && (
              <>
                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <div className="flex items-center gap-1">
                  <HiDocumentText className="h-3.5 w-3.5" />
                  {challenge.word_count} words
                </div>
              </>
            )}
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => onStart(challenge)} 
                size="sm"
                className="relative overflow-hidden group/button"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover/button:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-1.5">
                  <HiPlay className="w-4 h-4" />
                  Start
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black border-black">
              <p className="text-white">Timer will start when this button is clicked</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </div>
);
