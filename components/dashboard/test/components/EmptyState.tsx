import { HiSparkles, HiMiniClock, HiMiniChartBar, HiMiniClipboardDocument, HiMiniMagnifyingGlass, HiMiniLanguage, HiMiniBookOpen, HiMiniSparkles } from 'react-icons/hi2';
import { StateWrapper } from './StateWrapper';
import { Shimmer } from './Shimmer';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = "No challenges found",
  description = "Looking for the perfect writing challenge? Try adjusting your search filters or exploring different difficulty levels. Our challenges range from beginner-friendly exercises to advanced writing tasks, each designed to help you improve your skills.\n\nYou can also try:\n• Broadening your search terms\n• Selecting a different language focus\n• Exploring various writing formats\n• Checking out our recommended challenges"
}: EmptyStateProps) {
  return (
    <StateWrapper>
      <div className="flex flex-col items-center space-y-6">
        {/* Icon and Main Text */}
        <div className="space-y-3">
          <div className="relative">
            <HiSparkles className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600" />
            <div className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-zinc-400/20 dark:bg-zinc-600/20" />
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 text-center">{title}</h3>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4">
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-left">
                  {description.split('\n\n')[0]}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {description.split('\n\n')[1].split(':')[0] + ':'}
                  </p>
                  <ul className="space-y-2.5 pl-3">
                    {[
                      { icon: HiMiniMagnifyingGlass, text: "Broadening your search terms" },
                      { icon: HiMiniLanguage, text: "Selecting a different language focus" },
                      { icon: HiMiniBookOpen, text: "Exploring various writing formats" },
                      { icon: HiMiniSparkles, text: "Checking out our recommended challenges" }
                    ].map((item, i) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-300 flex items-center space-x-3">
                        <span className="flex-shrink-0 text-zinc-400 dark:text-zinc-500">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        

        
      </div>
    </StateWrapper>
  );
}
