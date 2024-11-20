import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoCard, InstructionsCard, MetricsCard, FocusCard } from "@/components/card";
import {
  HiChartBar,
  HiCheckCircle,
  HiClock,
  HiDocument,
  HiDocumentText,
  HiExclamationTriangle,
  HiLightBulb,
  HiMiniArrowLeftOnRectangle,
} from "react-icons/hi2";
import { Challenge} from "@/types/challenge";

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

interface Insights {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

interface EvaluationAccordionProps {
  challenge: Challenge | null;
  performanceMetrics: PerformanceMetrics;
  skillMetrics: SkillMetrics;
  insights: Insights;
  showChallenges: boolean;
  onBackToChallenges: () => void;
  accordionValue?: string;
  onAccordionValueChange: (value: string) => void;
}

export default function EvaluationAccordion({
  challenge,
  performanceMetrics,
  skillMetrics,
  insights,
  showChallenges,
  onBackToChallenges,
  onAccordionValueChange,
  accordionValue,
}: EvaluationAccordionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Evaluation Results</h2>

      <Accordion
        type="single"
        className="w-full"
        defaultValue="evaluation"
        value="evaluation"
      >
        <AccordionItem value="evaluation" className="border-none">
          <div className="flex justify-between items-center pr-4">
            <AccordionTrigger className="px-4 flex-grow text-left text-base sm:text-sm [&>svg]:hidden">
              <div className="flex items-center gap-2">
                <HiChartBar className="h-5 w-5 text-blue-500" />
                <span>Performance Analysis</span>
              </div>
            </AccordionTrigger>
           
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
            
          </div>
          <AccordionContent className="py-4">
            <div className="space-y-4">
                <InstructionsCard
                  title="Improved Essay"
                  instructions={performanceMetrics.improvedEssay || "We've carefully reviewed your essay and found that it demonstrates strong writing skills across all evaluated dimensions. The current version effectively communicates your ideas with clear structure, appropriate vocabulary, and sound grammar. At this time, no specific improvements have been identified that would significantly enhance the quality of your writing. Keep up the excellent work!"}
                />

              <div className="grid grid-cols-2 gap-4">
                <MetricsCard
                  title="Performance Metrics"
                  items={[
                    { label: "Grammar", value: performanceMetrics.metrics.grammar },
                    { label: "Vocabulary", value: performanceMetrics.metrics.vocabulary },
                    { label: "Fluency", value: performanceMetrics.metrics.fluency },
                    { label: "Overall", value: performanceMetrics.metrics.overall },
                  ]}
                />

                <MetricsCard
                  title="Writing Skills"
                  items={[
                    { label: "Complexity", value: skillMetrics.writingComplexity },
                    { label: "Accuracy", value: skillMetrics.accuracy },
                    { label: "Coherence", value: skillMetrics.coherence },
                    { label: "Style", value: skillMetrics.style },
                  ]}
                />
              </div>

             
                <FocusCard
                  title="Strengths"
                  items={insights.strengths}
                  icon={HiCheckCircle}
                  colorScheme="emerald"
                />
                <FocusCard
                  title="Areas for Improvement"
                  items={insights.weaknesses}
                  icon={HiExclamationTriangle}
                  colorScheme="red"
                />
                <FocusCard
                  title="Writing Tips"
                  items={insights.tips}
                  icon={HiLightBulb}
                  colorScheme="amber"
                />

              <div className="grid grid-cols-3 gap-4">
                <InfoCard
                  title="Word Count"
                  value={performanceMetrics.wordCount.toString()}
                  icon={HiDocument}
                  colorScheme="blue"
                />
                <InfoCard
                  title="Paragraphs"
                  value={performanceMetrics.paragraphCount.toString()}
                  icon={HiDocumentText}
                  colorScheme="purple"
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
