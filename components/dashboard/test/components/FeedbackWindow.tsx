import { useState } from 'react';
import { MessageSquare, XCircle, MousePointerClick } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { ParagraphFeedback } from './ParagraphFeedback';

interface FeedbackWindowProps {
  inputMessage: string;
  onClose: () => void;
  onGenerateFeedback: (paragraph: string, isFullEssay: boolean) => Promise<string>;
  children?: React.ReactNode;
}

export function FeedbackWindow({ inputMessage, onClose, onGenerateFeedback, children }: FeedbackWindowProps) {
  const [outputCodeState, setOutputCodeState] = useState<string | { feedback: string } | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {/* Feedback Controls */}
      {inputMessage?.trim() && (
        <div className="flex items-center justify-between gap-2 p-3 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-2 overflow-x-auto">
            {(inputMessage || '').split(/\n\s*\n/).map((paragraph, index) => 
              paragraph.trim() && (
                <TooltipProvider key={index}>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={async () => {
                          try {
                            const promise = onGenerateFeedback(paragraph, false); // Set to false for paragraph feedback
                            toast.promise(promise, {
                              loading: 'Analyzing paragraph...',
                              success: (data) => `Generated feedback for paragraph ${index + 1}`,
                              error: (err) => err.message || 'Failed to generate feedback'
                            });
                            const newFeedback = await promise;
                            setOutputCodeState(newFeedback);
                          } catch (error) {
                            console.error('Error updating feedback:', error);
                          }
                        }}
                        className="group flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/70 transition-all hover:shadow-sm active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400" />
                        <span>P{index + 1}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      sideOffset={5}
                      className="max-w-sm p-3 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg"
                    >
                      <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                        Paragraph {index + 1}
                        <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {paragraph.split(/\s+/).length} words
                        </span>
                      </p>
                      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3" />
                        Click to get AI feedback
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            )}
          </div>
          
          <button
            onClick={() => {
              setOutputCodeState(null);
              toast.success('Feedback cleared');
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Feedback Content */}
      <div className="p-3 max-h-[40vh] overflow-y-auto">
        <div className="space-y-2">
          {children || (
            outputCodeState ? (
              <div className="text-zinc-600 dark:text-zinc-400 text-md leading-relaxed">
                {typeof outputCodeState === 'string' ? (
                  <ParagraphFeedback feedback={JSON.parse(outputCodeState)} />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(outputCodeState, null, 2)}</pre>
                )}
              </div>
            ) : (
              <div className="text-zinc-500/80 dark:text-zinc-400/80 text-xs italic">
                Select a paragraph or start writing to receive real-time feedback on your essay.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
