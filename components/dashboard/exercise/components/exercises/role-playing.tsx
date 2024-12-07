"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RolePlayingProps } from '@/types/exercises';

export default function RolePlaying({ exercise, onComplete }: RolePlayingProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState<{ [key: string]: boolean }>({});

  const handleResponseChange = (promptId: string, value: string) => {
    setResponses(prev => ({ ...prev, [promptId]: value }));
  };

  const toggleHint = (promptId: string) => {
    setShowHints(prev => ({ ...prev, [promptId]: !prev[promptId] }));
  };

  const isResponseCorrect = (response: string, expectedResponse: string, alternatives?: string[]) => {
    const normalizedResponse = response.toLowerCase().trim();
    const normalizedExpected = expectedResponse.toLowerCase().trim();
    const normalizedAlternatives = alternatives?.map(alt => alt.toLowerCase().trim()) || [];

    return normalizedResponse === normalizedExpected || 
           normalizedAlternatives.includes(normalizedResponse);
  };

  const checkAnswers = () => {
    setShowResults(true);
    let correctCount = 0;
    let totalPrompts = 0;

    const role = exercise.roles.find(r => r.id === selectedRole);
    if (role) {
      role.prompts.forEach(prompt => {
        if (responses[prompt.id] && isResponseCorrect(
          responses[prompt.id],
          prompt.expectedResponse,
          prompt.alternatives
        )) {
          correctCount++;
        }
        totalPrompts++;
      });
    }

    const score = Math.round((correctCount / totalPrompts) * 100);
    onComplete(score, totalPrompts);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        {/* Scenario Description */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {exercise.scenario}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {exercise.context}
          </p>
        </div>

        {/* Role Selection */}
        {!selectedRole && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercise.roles.map((role) => (
              <motion.button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                         border border-gray-200 dark:border-gray-700
                         hover:border-violet-300 dark:hover:border-violet-700
                         text-left transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {role.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {role.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Role Playing Interface */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {exercise.roles.find(r => r.id === selectedRole)?.prompts.map((prompt) => (
              <div key={prompt.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-gray-900 dark:text-gray-100">{prompt.text}</p>
                    <div className="space-y-2">
                      <Textarea
                        value={responses[prompt.id] || ''}
                        onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
                        placeholder="Type your response..."
                        className={cn(
                          "resize-none",
                          showResults && (
                            isResponseCorrect(responses[prompt.id], prompt.expectedResponse, prompt.alternatives)
                              ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                              : "border-red-500 bg-red-50 dark:bg-red-950/50"
                          )
                        )}
                        disabled={showResults}
                        rows={3}
                      />
                      {prompt.hint && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHint(prompt.id)}
                          className="text-violet-600 dark:text-violet-400"
                        >
                          {showHints[prompt.id] ? "Hide Hint" : "Show Hint"}
                        </Button>
                      )}
                      {showHints[prompt.id] && prompt.hint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm rounded"
                        >
                          💡 {prompt.hint}
                        </motion.div>
                      )}
                      {showResults && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                        >
                          {isResponseCorrect(responses[prompt.id], prompt.expectedResponse, prompt.alternatives) ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">
                                Great response!
                              </span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Expected: <span className="font-medium text-gray-900 dark:text-gray-200">
                                  {prompt.expectedResponse}
                                </span>
                                {prompt.alternatives && prompt.alternatives.length > 0 && (
                                  <span className="text-gray-500 dark:text-gray-500">
                                    {" "}(or: {prompt.alternatives.join(", ")})
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!showResults && (
              <Button
                onClick={checkAnswers}
                className="w-full sm:w-auto"
                disabled={!selectedRole || Object.keys(responses).length === 0}
              >
                Check Responses
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
