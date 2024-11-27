import { Card } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserDetails, User } from '@/types/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useExerciseSuggestions } from '@/hooks/useExerciseSuggestions';
import { useGradeTheExercise } from '@/hooks/useGradeTheExercise';
import { MdArrowUpward } from 'react-icons/md';
import { Loader2, AlertCircle, RefreshCw, Pencil } from 'lucide-react';

export default function MainChart({ user, userDetails, session }: User) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week");
  const [weakestSkills, setWeakestSkills] = useState<string[]>([]);
  const [exerciseInput, setExerciseInput] = useState('');
  const [exerciseGrades, setExerciseGrades] = useState<Array<{ grade: number; improvedSentence: string }>>([]);
  const supabase = createClientComponentClient();

  const { exercise, isLoading, error, generateExercise } = useExerciseSuggestions({ weak_skills: weakestSkills });
  const { gradeExercise } = useGradeTheExercise();

  useEffect(() => {
    const fetchWeakestSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('weakest_skills')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data && data.weakest_skills) {
          setWeakestSkills(data.weakest_skills);
        }
      } catch (error) {
        console.error('Error fetching weakest skills:', error);
        toast.error('Failed to load skills data');
      }
    };

    fetchWeakestSkills();
  }, [supabase]);

  const handleExerciseSubmit = async () => {
    if (!exercise?.exercise_prompt || !exerciseInput.trim()) return;
    // show toast loading for 1 second
    toast.loading('Grading exercise...', { duration: 1000 });

    const result = await gradeExercise({
      exercise: exercise.exercise_prompt,
      answer: exerciseInput.trim()
    });

    if (result) {
      setExerciseGrades(prev => {
        const newGrades = [...prev, result];
        // Keep only the last 5 grades
        const latestGrades = newGrades.slice(-5);
        
        // If we just reached 5 grades, schedule the next exercise
        if (latestGrades.length === 5) {
          setTimeout(() => {
            setExerciseGrades([]);
            generateExercise();
          }, 10000);
        }
        
        return latestGrades;
      });

      // Clear input for next exercise
      setExerciseInput('');

      toast.success('Exercise submitted!', {
        description: `Grade: ${result.grade}. ${result.improvedSentence}`
      });
    }
  };

  const writingMetrics = {
    paragraphsWritten: {
      value: 157,
      change: 23,
      period: "Last 7 days"
    },
    challengesTaken: {
      value: 42,
      change: 8,
      period: "Last 7 days"
    },
    daysStreak: {
      value: 15,
      change: 5,
      period: "Current streak"
    }
  };

  const data = [
    { name: 'Mon', paragraphs: 20 },
    { name: 'Tue', paragraphs: 15 },
    { name: 'Wed', paragraphs: 25 },
    { name: 'Thu', paragraphs: 30 },
    { name: 'Fri', paragraphs: 18 },
    { name: 'Sat', paragraphs: 28 },
    { name: 'Sun', paragraphs: 22 },
  ];

  return (
    <Card className="w-full h-full pb-12 p-[20px]">
      <style jsx global>{`
        .custom-textarea {
          font-size: 2.5rem;
          line-height: 1.75;
          caret-color: #10b981;
          text-shadow: 0 0 0 #1f2937;
          -webkit-text-fill-color: #1f2937;
        }
        .custom-textarea::placeholder {
          color: #34d399;
          opacity: 0.5;
        }
        .dark .custom-textarea::placeholder {
          color: #6ee7b7;
          opacity: 0.3;
        }
        .custom-textarea::selection {
          background-color: #10b98120;
        }
        .dark .custom-textarea {
          text-shadow: 0 0 0 #f3f4f6;
          -webkit-text-fill-color: #f3f4f6;
        }
      `}</style>
      <div className="space-y-6">
        {weakestSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Focus Area</h3>
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
              {isLoading ? (
                <div className="flex flex-col space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center justify-center h-4 w-4 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                    <span className="font-medium">Generating your personalized exercise...</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-2 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
                    <div className="h-2 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse delay-100"></div>
                    <div className="h-2 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse delay-200"></div>
                    <div className="h-2 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 animate-pulse" />
                    <span className="font-medium">Exercise Generation Failed</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 ml-7">
                    We couldn't generate your exercise at this moment. This might be due to temporary issues.
                  </p>
                  <div className="ml-7">
                    <button
                      onClick={() => generateExercise()}
                      className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 animate-[spin_4s_linear_infinite]" />
                      <span>Try generating again</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <Pencil className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">Your Writing Exercise</span>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Personalized practice based on your challenge evaluations
                      </p>
                    </div>
                    <button
                      onClick={() => generateExercise()}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between ml-7 mr-7">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 flex-1">
                      {exercise?.exercise_prompt}
                    </p>
                    <div className="flex items-center gap-1 ml-4">
                      {exerciseGrades.map((grade, index) => (
                        <div
                          key={index}
                          className="h-1.5 w-6 rounded-full"
                          style={{
                            backgroundColor: `rgb(${Math.max(0, Math.min(255, 255 - ((index + 1) * 51)))}, ${Math.max(0, Math.min(255, (index + 1) * 51))}, 0)`
                          }}
                          title={`Grade: ${grade.grade}%`}
                        />
                      ))}
                      {Array(5 - exerciseGrades.length).fill(0).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="h-1.5 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700"
                        />
                      ))}
                    </div>
                  </div>
                  {exerciseGrades.length > 0 && exerciseGrades[exerciseGrades.length - 1].improvedSentence && (
                    <div className="mt-4 ml-7 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                        Improved Version:
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {exerciseGrades[exerciseGrades.length - 1].improvedSentence}
                      </p>
                    </div>
                  )}
                  <textarea
                    value={exerciseInput}
                    spellCheck="false"
                    onChange={(e) => setExerciseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleExerciseSubmit();
                      }
                    }}
                    placeholder="Type your sentence here..."
                    className="custom-textarea w-full min-h-[100px] p-4 bg-transparent text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-100 dark:placeholder:text-zinc-600 resize-none focus:outline-none font-medium"
                  />
                  <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500 dark:text-zinc-400 justify-end">
                    <span>Press</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-zinc-800 bg-zinc-100 border border-zinc-300 rounded-md dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
                      enter
                    </kbd>
                    <span>to submit your answer</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-7 mt-3">
                    {Object.entries(exercise?.vocabulary || {}).map(([word, translation], index) => {
                      const isUsed = exerciseInput.toLowerCase().includes(word.toLowerCase());
                      return (
                        <div
                          key={word}
                          className="relative group"
                        >
                          <div
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-200 ${isUsed
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-transparent text-zinc-400 border-zinc-200 dark:text-zinc-500 dark:border-zinc-800'
                              }`}
                          >
                            {word}
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-zinc-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            {translation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="space-y-4 w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Writing Progress</h2>


          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Challenges Taken
              </p>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {writingMetrics.challengesTaken.value}
              </span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-500 bg-green-500/10 rounded-full">
                <MdArrowUpward className="h-3 w-3" />
                <span>+{writingMetrics.challengesTaken.change}</span>
              </div>
            </div>
            <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              vs previous {timeframe}
            </span>
          </div>

          <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Days Streak
              </p>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {writingMetrics.daysStreak.value} days
              </span>

            </div>
            <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              current streak
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
