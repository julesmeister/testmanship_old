import { Loader2Icon } from 'lucide-react';
import { HiMiniClock, HiMiniChartBar, HiMiniClipboardDocument } from 'react-icons/hi2';
import { StateWrapper } from './StateWrapper';
import { Shimmer } from './Shimmer';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({ 
  title = "Loading challenges",
  description = "Please wait while we fetch your challenges. This should only take a moment."
}: LoadingStateProps) {
  return (
    <StateWrapper>
      <div className="flex flex-col items-center space-y-6">
        {/* Icon and Main Text */}
        <div className="space-y-3">
          <div className="relative">
            <Loader2Icon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 animate-spin" />
            <div className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-zinc-400/20 dark:bg-zinc-600/20" />
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 text-center">{title}</h3>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4">
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-left">
                  {description}
                </p>
                
                {/* Loading Stats */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center space-x-1">
                    <HiMiniClock className="h-3.5 w-3.5" />
                    <Shimmer className="h-2.5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <HiMiniChartBar className="h-3.5 w-3.5" />
                    <Shimmer className="h-2.5 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <HiMiniClipboardDocument className="h-3.5 w-3.5" />
                    <Shimmer className="h-2.5 w-14 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Challenge Cards */}
        <div className="w-full max-w-sm space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white/50 dark:bg-zinc-900/50">
              <div className="space-y-3">
                <Shimmer className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <Shimmer className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <HiMiniClock className="h-3.5 w-3.5" />
                    <Shimmer className="h-2.5 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <HiMiniChartBar className="h-3.5 w-3.5" />
                    <Shimmer className="h-2.5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <HiMiniClipboardDocument className="h-3.5 w-3.5" />
                    <Shimmer className="h-2.5 w-14 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StateWrapper>
  );
}
