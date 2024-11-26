'use client';

import { useSupabase } from '@/app/supabase-provider';
import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import { UserDetails } from '@/types/types';
import React, { useEffect } from 'react';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useEvaluationSubmission } from '@/hooks/useEvaluationSubmission';
import { toast } from 'sonner';
import { startProgress } from '@/components/ui/progress-bar';

interface RecordingEvaluationProps {
  user: User;
  userDetails: UserDetails;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  insights?: any;
  isLoading?: boolean;
  error?: any;
  performanceMetrics?: any;
  skillMetrics?: any;
  challengeId?: string;
  content?: string;
  difficulty_level?: string;
}

export default function RecordingEvaluation({ 
  user, 
  userDetails, 
  title, 
  description, 
  children,
  insights,
  isLoading = true,
  error,
  performanceMetrics,
  skillMetrics,
  challengeId,
  content,
  difficulty_level
}: RecordingEvaluationProps) {
  const { supabase } = useSupabase();
  useAuthCheck({ user, userDetails, supabase });
  const { submitEvaluation, isSubmitting } = useEvaluationSubmission();

  useEffect(() => {
    const submitAndRedirect = async () => {
      if (!insights || !performanceMetrics || !skillMetrics) {
        console.error('Missing required evaluation data:', { insights, performanceMetrics, skillMetrics });
        toast.error('Missing required evaluation data');
        return;
      }

      try {
        const submissionData = {
          challengeId: challengeId || '00000000-0000-0000-0000-000000000001',
          content: content || '',
          timeSpent: performanceMetrics.timeSpent || 0,
          evaluation: {
            metrics: {
              grammar: performanceMetrics.metrics.grammar,
              vocabulary: performanceMetrics.metrics.vocabulary,
              fluency: performanceMetrics.metrics.fluency,
              overall: performanceMetrics.metrics.overall
            },
            skills: {
              writingComplexity: skillMetrics.writingComplexity,
              accuracy: skillMetrics.accuracy,
              coherence: skillMetrics.coherence,
              style: skillMetrics.style
            },
            improvedEssay: performanceMetrics.improvedEssay
          },
          performanceMetrics: {
            wordCount: performanceMetrics.wordCount,
            paragraphCount: performanceMetrics.paragraphCount
          },
          insights: insights,
          difficulty_level: difficulty_level || 'A1'
        };

        console.log('Preparing to submit evaluation with data:', JSON.stringify(submissionData, null, 2));

        const result = await submitEvaluation({
          supabase,
          data: submissionData
        });

        if (result.success) {
          toast.success('Evaluation submitted successfully');
          startProgress();
          window.location.href = '/dashboard';
        } else {
          const errorMessage = result.error instanceof Error 
            ? result.error.message 
            : 'Failed to submit evaluation';
          
          console.error('Submission failed:', result.error);
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error in handleSubmitEvaluation:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred';
        
        toast.error(errorMessage);
      }
    };

    // Start submission process immediately
    submitAndRedirect();
  }, []); // Run once on mount

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title={title || 'Recording Evaluation'}
      description={description || 'Your performance is being recorded.'}
    >
      <div className="container mx-auto py-6">
          <div className="space-y-6 animate-pulse">
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-4 w-4 bg-blue-400 rounded-full animate-bounce"></div>
                <p className="text-blue-600 font-semibold">Recording in Progress...</p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We're carefully analyzing your test approach and methodology. This evaluation will help us identify:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-600">
                  <li>Key areas where your testing strategy could be enhanced</li>
                  <li>Potential blind spots in your test coverage</li>
                  <li>Opportunities to improve test efficiency and effectiveness</li>
                  <li>Specific aspects of your testing methodology that need attention</li>
                </ul>
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    Based on the identified areas for improvement, we'll create personalized writing exercises 
                    to help strengthen your testing skills. These exercises will be specifically tailored to address 
                    any weaknesses found in your current approach.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
               
              </div>
            </div>
        </div>
        {children}
      </div>
    </DashboardLayout>
  );
}
