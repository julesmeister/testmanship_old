'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/supabase-provider';
import RecordingEvaluation from '@/components/dashboard/recording-evaluation';
import { useEvaluationState } from '@/hooks/useEvaluationState';
import { createClient } from '@/utils/supabase/server';
import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';


export default async function RecordingEvaluationPage() {
  const router = useRouter();
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <RecordingEvaluation
      user={user}
      userDetails={userDetails}
      insights={insights}
      isLoading={evaluationLoading}
      error={evaluationError}
      performanceMetrics={evaluatedPerformanceMetrics}
      skillMetrics={evaluatedSkillMetrics}i
    />
  );
}
