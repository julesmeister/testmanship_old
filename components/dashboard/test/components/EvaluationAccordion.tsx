import { useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GradientCard } from "@/components/card/GradientCard";
import { InfoCard } from "@/components/card/InfoCard";
import { FocusCard } from "@/components/card/FocusCard";
import { FooterStats } from "@/components/card/FooterStats";
import {
  HiChartBar,
  HiClock,
  HiDocumentText,
  HiSparkles,
  HiArrowTrendingUp,
  HiMiniArrowUpRight,
  HiMiniArrowDownRight,
} from "react-icons/hi2";
import { Challenge } from "@/types/challenge";

interface PerformanceMetrics {
  wordCount: number;
  paragraphCount: number;
  timeSpent: number;
  performanceScore: number;
  feedback?: string;
}

interface SkillMetrics {
  category: string;
  skillName: string;
  proficiencyLevel: number;
  improvementRate?: number;
}

interface UserProgress {
  totalChallengesCompleted: number;
  totalWordsWritten: number;
  totalTimeSpent: number;
  averagePerformance: number;
  strongestSkills: string[];
  weakestSkills: string[];
  preferredTopics: string[];
  lastActiveLevel: string;
}

interface EvaluationAccordionProps {
  challenge: Challenge;
  performanceMetrics: PerformanceMetrics;
  skillMetrics: SkillMetrics[];
  userProgress: UserProgress;
  accordionValue?: string;
  onAccordionValueChange: (value: string) => void;
}

export function EvaluationAccordion({
  challenge,
  performanceMetrics,
  skillMetrics,
  userProgress,
  accordionValue = "evaluation",
  onAccordionValueChange,
}: EvaluationAccordionProps) {
  const accordionRef = useRef<HTMLDivElement>(null);

  const handleAccordionChange = (value: string) => {
    onAccordionValueChange(value);
    
    // Add a small delay to let the accordion animation complete
    setTimeout(() => {
      const accordionEl = accordionRef.current;
      const footerEl = document.querySelector('.footer-admin') as HTMLElement;
      if (accordionEl && footerEl) {
        const accordionRect = accordionEl.getBoundingClientRect();
        const footerRect = footerEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (accordionRect.bottom > footerRect.top || accordionRect.bottom > viewportHeight) {
          const overlap = Math.max(
            accordionRect.bottom - footerRect.top,
            accordionRect.bottom - viewportHeight
          );
          footerEl.style.marginTop = `${overlap + 40}px`;
        } else {
          footerEl.style.marginTop = '';
        }
      }
    }, 300);
  };

  // Format time spent
  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Calculate performance grade
  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="w-full" ref={accordionRef}>
      <Accordion 
        type="single"
        value={accordionValue}
        defaultValue="evaluation"
        className="w-full"
        onValueChange={handleAccordionChange}
      >
        <AccordionItem value="evaluation" className="w-full border rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
          <AccordionTrigger className="px-4 flex-grow text-left text-base sm:text-sm [&>svg]:hidden">
            Writing Performance Evaluation
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <GradientCard 
                title={`${getPerformanceGrade(performanceMetrics.performanceScore)} (${performanceMetrics.performanceScore}%)`}
                subtitle="Overall Performance"
              />

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoCard
                  title="Performance Score"
                  value={`${performanceMetrics.performanceScore}%`}
                  icon={HiChartBar}
                  colorScheme="purple"
                />
                <InfoCard
                  title="Time Spent"
                  value={`${Math.round(performanceMetrics.timeSpent / 60)} min`}
                  icon={HiClock}
                  colorScheme="purple"
                />
              </div>

              {/* Skill Analysis */}
              <div className="space-y-6">
                <FocusCard
                  title="Strongest Skills"
                  items={userProgress.strongestSkills}
                  icon={HiSparkles}
                  colorScheme="emerald"
                />

                <FocusCard
                  title="Areas for Improvement"
                  items={userProgress.weakestSkills}
                  icon={HiArrowTrendingUp}
                  colorScheme="amber"
                />
              </div>

              {/* Progress Summary */}
              <div className="mt-6">
                <FocusCard
                  title="Overall Progress"
                  items={[
                    `Total Challenges: ${userProgress.totalChallengesCompleted}`,
                    `Total Words Written: ${userProgress.totalWordsWritten}`,
                    `Average Score: ${userProgress.averagePerformance}%`
                  ]}
                  icon={HiDocumentText}
                  colorScheme="emerald"
                />
              </div>

              {/* Feedback Section */}
              {performanceMetrics.feedback && (
                <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <h3 className="font-semibold mb-2">Feedback</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {performanceMetrics.feedback}
                  </p>
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
