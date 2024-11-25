import { useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiMiniArrowLeftOnRectangle, HiClock, HiDocumentText, HiCheckCircle, HiBookOpen, HiClipboardDocumentCheck } from "react-icons/hi2";
import { GradientCard } from "@/components/card/GradientCard";
import { InstructionsCard } from "@/components/card/InstructionsCard";
import { InfoCard } from "@/components/card/InfoCard";
import { FocusCard } from "@/components/card/FocusCard";
import { FooterStats } from "@/components/card/FooterStats";
import { Challenge } from "@/types/challenge";

interface InstructionsAccordionProps {
  challenge: Challenge;
  format: string;
  showChallenges: boolean;
  accordionValue?: string;
  onAccordionValueChange: (value: string) => void;
  onBackToChallenges: () => void;
}

export function InstructionsAccordion({
  challenge,
  format,
  showChallenges,
  accordionValue = "instructions",
  onAccordionValueChange,
  onBackToChallenges,
}: InstructionsAccordionProps) {
  const accordionRef = useRef<HTMLDivElement>(null);

  const handleAccordionChange = (value: string) => {
    // Always keep instructions expanded
    if (value === "") {
      onAccordionValueChange("instructions");
      return;
    }
    
    onAccordionValueChange(value);
    
    // Add a small delay to let the accordion animation complete
    setTimeout(() => {
      const accordionEl = accordionRef.current;
      const footerEl = document.querySelector('.footer-admin') as HTMLElement;
      if (accordionEl && footerEl) {
        const accordionRect = accordionEl.getBoundingClientRect();
        const footerRect = footerEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Check if accordion extends beyond viewport or overlaps footer
        if (accordionRect.bottom > footerRect.top || accordionRect.bottom > viewportHeight) {
          const overlap = Math.max(
            accordionRect.bottom - footerRect.top,
            accordionRect.bottom - viewportHeight
          );
          footerEl.style.marginTop = `${overlap + 40}px`; // Add extra padding
        } else {
          footerEl.style.marginTop = ''; // Reset if no overlap
        }
      }
    }, 300); // Wait for accordion animation
  };

  return (
    <div className="w-full" ref={accordionRef}>
      <Accordion 
        type="single"
        value={accordionValue}
        defaultValue="instructions"
        className="w-full"
        onValueChange={handleAccordionChange}
        collapsible={false}
      >
        <AccordionItem value="instructions" className="w-full border rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-between items-center pr-4">
            <AccordionTrigger className="px-4 flex-grow text-left text-base sm:text-sm [&>svg]:hidden">
              Writing Instructions & Criteria
            </AccordionTrigger>
            {!showChallenges && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={onBackToChallenges}
                    >
                      <HiMiniArrowLeftOnRectangle className="w-4 h-4" />
                      Exit Challenge
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-black border-black">
                    <p className="text-white">Stop timer and return to challenges</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <GradientCard title={challenge.title} subtitle={format} />
              <InstructionsCard instructions={challenge.instructions} />

              <div className="grid grid-cols-2 gap-3">
                <InfoCard 
                  title="Time Allocation" 
                  value={`${challenge.time_allocation} minute${challenge.time_allocation === 1 ? '' : 's'}`}
                  icon={HiClock}
                  colorScheme="blue"
                />
                {challenge.word_count && (
                  <InfoCard 
                    title="Word Count" 
                    value={challenge.word_count}
                    icon={HiDocumentText}
                    colorScheme="purple"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.isArray(challenge.grammar_focus) && challenge.grammar_focus.length > 0 && (
                  <FocusCard 
                    title="Grammar Focus"
                    items={challenge.grammar_focus}
                    icon={HiCheckCircle}
                    colorScheme="emerald"
                  />
                )}
                {Array.isArray(challenge.vocabulary_themes) && challenge.vocabulary_themes.length > 0 && (
                  <FocusCard 
                    title="Vocabulary Themes"
                    items={challenge.vocabulary_themes}
                    icon={HiBookOpen}
                    colorScheme="amber"
                  />
                )}
              </div>
              {Array.isArray(challenge.checklist) && challenge.checklist.length > 0 && (
                <div className="mt-3">
                  <FocusCard 
                    title="Submission Checklist"
                    items={challenge.checklist}
                    icon={HiClipboardDocumentCheck}
                    colorScheme="amber"
                  />
                </div>
              )}

              <FooterStats 
                timeAllocation={challenge.time_allocation}
                difficultyLevel={challenge.difficulty_level}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
