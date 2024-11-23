import { getUserDetails, getUser } from '@/utils/supabase/queries';
import RecordingEvaluation from '@/components/dashboard/recording-evaluation';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function RecordingEvaluationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  // Parse the URL parameters
  const insights = searchParams.insights ? JSON.parse(decodeURIComponent(searchParams.insights as string)) : null;
  const performanceMetrics = searchParams.performanceMetrics ? JSON.parse(decodeURIComponent(searchParams.performanceMetrics as string)) : null;
  const skillMetrics = searchParams.skillMetrics ? JSON.parse(decodeURIComponent(searchParams.skillMetrics as string)) : null;

  // Log the parsed metrics
  console.log('Recording Evaluation Metrics:', {
    insights,
    performanceMetrics,
    skillMetrics
  });

  return (
    <RecordingEvaluation 
      user={user}
      userDetails={userDetails}
      insights={insights}
      performanceMetrics={performanceMetrics}
      skillMetrics={skillMetrics}
    />
  );
}
