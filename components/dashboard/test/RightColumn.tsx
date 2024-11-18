'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HiSparkles, HiPlay, HiStop, HiArrowPath, HiMiniArrowLeftOnRectangle } from 'react-icons/hi2';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface RightColumnProps {
  selectedChallenge: any;
  hasStartedWriting: boolean;
  outputCode: string | null;
  onStartChallenge: (challenge: Challenge) => void;
  onStopChallenge: () => void;
  onGenerateFeedback: () => void;
  isTimeUp: boolean;
  isGeneratingFeedback: boolean;
}

export default function RightColumn({ 
  selectedChallenge, 
  hasStartedWriting, 
  outputCode,
  onStartChallenge,
  onStopChallenge,
  onGenerateFeedback,
  isTimeUp,
  isGeneratingFeedback
}: RightColumnProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('a1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChallenges, setShowChallenges] = useState(true);
  const [accordionValue, setAccordionValue] = useState<string>('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchChallenges = async () => {
      let query = supabase
        .from('challenges')
        .select('*')
        .eq('difficulty_level', selectedLevel.toUpperCase());
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching challenges:', error);
        return;
      }

      setChallenges(data || []);
    };

    fetchChallenges();
  }, [selectedLevel, searchQuery, supabase]);

  const handleStartChallenge = (challenge: Challenge) => {
    setShowChallenges(false);
    setAccordionValue('instructions');
    onStartChallenge(challenge);
  };

  const handleBackToChallenges = () => {
    setShowChallenges(true);
    setAccordionValue('');
    onStopChallenge();
  };

  const handleFinishChallenge = () => {
    onGenerateFeedback();
  };

  return (
    <div className="w-1/3 flex flex-col">
      {/* Challenge Selection */}
      <div className={hasStartedWriting ? "" : "space-y-4"}>
        {showChallenges && (
          <>
            <Tabs defaultValue="a1" className="w-full" onValueChange={setSelectedLevel}>
              <TabsList className="grid w-full grid-cols-6 bg-gray-50 dark:bg-gray-900 p-1">
                <TabsTrigger 
                  value="a1" 
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-500
                            data-[state=inactive]:text-emerald-600 dark:data-[state=inactive]:text-emerald-400
                            hover:text-emerald-800 dark:hover:text-emerald-300"
                >A1</TabsTrigger>
                <TabsTrigger 
                  value="a2" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500
                            data-[state=inactive]:text-green-600 dark:data-[state=inactive]:text-green-400
                            hover:text-green-800 dark:hover:text-green-300"
                >A2</TabsTrigger>
                <TabsTrigger 
                  value="b1" 
                  className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white dark:data-[state=active]:bg-yellow-500
                            data-[state=inactive]:text-yellow-600 dark:data-[state=inactive]:text-yellow-400
                            hover:text-yellow-800 dark:hover:text-yellow-300"
                >B1</TabsTrigger>
                <TabsTrigger 
                  value="b2" 
                  className="data-[state=active]:bg-orange-600 data-[state=active]:text-white dark:data-[state=active]:bg-orange-500
                            data-[state=inactive]:text-orange-600 dark:data-[state=inactive]:text-orange-400
                            hover:text-orange-800 dark:hover:text-orange-300"
                >B2</TabsTrigger>
                <TabsTrigger 
                  value="c1" 
                  className="data-[state=active]:bg-rose-600 data-[state=active]:text-white dark:data-[state=active]:bg-rose-500
                            data-[state=inactive]:text-rose-600 dark:data-[state=inactive]:text-rose-400
                            hover:text-rose-800 dark:hover:text-rose-300"
                >C1</TabsTrigger>
                <TabsTrigger 
                  value="c2" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white dark:data-[state=active]:bg-red-500
                            data-[state=inactive]:text-red-600 dark:data-[state=inactive]:text-red-400
                            hover:text-red-800 dark:hover:text-red-300"
                >C2</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Search writing challenges..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline">Search</Button>
              </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {challenge.instructions.split('\n')[0]}
                      </p>
                      <div className="mt-2 text-sm text-zinc-500">
                        Time: {challenge.time_allocation} minutes
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleStartChallenge(challenge)}
                            className="shrink-0 flex items-center gap-2"
                            variant="emerald"
                          >
                            <HiPlay className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-black border-black">
                          <p className="text-white">Timer will start when this button is clicked</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Instructions & Criteria */}
      {selectedChallenge && !showChallenges && (
        <div>
          {/* Finish Challenge Button */}
          <Button
            className="w-full mb-4"
            variant="default"
            onClick={handleFinishChallenge}
            disabled={!isTimeUp || isGeneratingFeedback}
          >
            {isGeneratingFeedback ? (
              <>
                <span className="mr-2">Generating Feedback</span>
                <HiSparkles className="h-4 w-4 animate-spin" />
              </>
            ) : (
              'Finish Challenge'
            )}
          </Button>

          <Accordion 
            type="single" 
            collapsible 
            className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <AccordionItem value="instructions">
              <div className="flex justify-between items-center pr-4">
                <AccordionTrigger className="px-4 flex-grow">Writing Instructions & Criteria</AccordionTrigger>
                {!showChallenges && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={handleBackToChallenges}
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
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Topic</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {selectedChallenge.title}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <div className="text-zinc-600 dark:text-zinc-400 space-y-2">
                      {selectedChallenge.instructions.split('\n').map((instruction: string, index: number) => (
                        <p key={index}>{instruction}</p>
                      ))}
                    </div>
                  </div>

                  {selectedChallenge.word_count && (
                    <div>
                      <h3 className="font-semibold mb-2">Word Count Requirement</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {selectedChallenge.word_count}
                      </p>
                    </div>
                  )}

                  {selectedChallenge.grammar_focus && selectedChallenge.grammar_focus.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Grammar Focus</h3>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                        {selectedChallenge.grammar_focus.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedChallenge.vocabulary_themes && selectedChallenge.vocabulary_themes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Vocabulary Themes</h3>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                        {selectedChallenge.vocabulary_themes.map((theme: string, index: number) => (
                          <li key={index}>{theme}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <HiArrowPath className="h-4 w-4" />
                      <span>{selectedChallenge.time_allocation} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiStop className="h-4 w-4" />
                      <span>{selectedChallenge.difficulty_level}</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* AI Feedback */}
      {selectedChallenge && hasStartedWriting && (
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 overflow-y-auto">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <HiSparkles className="w-5 h-5" />
            AI Feedback
          </h2>
          <div className="space-y-4">
            {outputCode ? (
              <div className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {outputCode}
              </div>
            ) : (
              <div className="text-zinc-500 dark:text-zinc-400 italic">
                Start writing to receive real-time feedback on your essay.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
