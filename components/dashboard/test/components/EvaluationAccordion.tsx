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
import { InfoCard } from "@/components/card/InfoCard";
import { InstructionsCard } from "@/components/card/InstructionsCard";
import { MetricsCard } from "@/components/card/MetricsCard";
import {
  HiChartBar,
  HiClock,
  HiDocumentText,
  HiMiniArrowLeftOnRectangle,
} from "react-icons/hi2";
import { Challenge } from "@/types/challenge";

interface PerformanceMetrics {
  wordCount: number;
  paragraphCount: number;
  timeSpent: number;
  performanceScore: number;
  improvedEssay?: string;
  metrics: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    overall: number;
  };
}

interface SkillMetrics {
  writingComplexity: number;
  accuracy: number;
  coherence: number;
  style: number;
}

interface EvaluationAccordionProps {
  challenge: Challenge;
  showChallenges?: boolean;
  performanceMetrics: PerformanceMetrics;
  skillMetrics: SkillMetrics;
  accordionValue?: string;
  onAccordionValueChange: (value: string) => void;
  onBackToChallenges: () => void;
}

export function EvaluationAccordion({
  challenge,
  performanceMetrics,
  skillMetrics,
  showChallenges,
  accordionValue = "evaluation",
  onAccordionValueChange,
  onBackToChallenges,
}: EvaluationAccordionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Evaluation Results</h2>
        {showChallenges && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onBackToChallenges}
                >
                  <HiMiniArrowLeftOnRectangle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exit Challenge</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={accordionValue}
        onValueChange={onAccordionValueChange}
      >
        <AccordionItem value="evaluation" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 px-4">
            <div className="flex items-center gap-2">
              <HiChartBar className="h-5 w-5 text-blue-500" />
              <span>Performance Analysis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <div className="space-y-4">
            {performanceMetrics.improvedEssay && (
                <InstructionsCard
                  title="Improved Essay"
                  instructions={performanceMetrics.improvedEssay || "No improvements suggested."}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
             
                <MetricsCard
                  title="Performance Metrics"
                  items={[
                    { label: "Grammar", value: performanceMetrics.metrics.grammar },
                    { label: "Vocabulary", value: performanceMetrics.metrics.vocabulary },
                    { label: "Fluency", value: performanceMetrics.metrics.fluency },
                    { label: "Overall", value: performanceMetrics.metrics.overall }
                  ]}
                />
                <MetricsCard
                  title="Writing Skills"
                  items={[
                    { label: "Complexity", value: skillMetrics.writingComplexity },
                    { label: "Accuracy", value: skillMetrics.accuracy },
                    { label: "Coherence", value: skillMetrics.coherence },
                    { label: "Style", value: skillMetrics.style }
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  title="Performance Score"
                  value={`${performanceMetrics.performanceScore}%`}
                  icon={HiChartBar}
                  colorScheme="blue"
                />
                <InfoCard
                  title="Time Spent"
                  value={`${Math.round(performanceMetrics.timeSpent / 60)} min`}
                  icon={HiClock}
                  colorScheme="purple"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
