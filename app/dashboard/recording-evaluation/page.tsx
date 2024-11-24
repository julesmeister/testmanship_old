import { getUserDetails, getUser } from '@/utils/supabase/queries';
import RecordingEvaluation from '@/components/dashboard/recording-evaluation';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function RecordingEvaluationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  // Parse the URL parameters safely
  let insights: any = undefined;
  let performanceMetrics: any = undefined;
  let skillMetrics: any = undefined;
  let challengeId: string | undefined = undefined;
  let content: string | undefined = undefined;

  const params = await Promise.resolve(searchParams);

  try {
    if (typeof params.insights === 'string') {
      insights = JSON.parse(decodeURIComponent(params.insights)) || undefined;
    }
    if (typeof params.performanceMetrics === 'string') {
      performanceMetrics = JSON.parse(decodeURIComponent(params.performanceMetrics)) || undefined;
    }
    if (typeof params.skillMetrics === 'string') {
      skillMetrics = JSON.parse(decodeURIComponent(params.skillMetrics)) || undefined;
    }
    if (typeof params.challengeId === 'string') {
      challengeId = params.challengeId || undefined;
    }
    if (typeof params.content === 'string') {
      content = params.content || undefined;
    }
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
  }

  return (
    <RecordingEvaluation 
      user={user}
      userDetails={userDetails}
      insights={insights}
      performanceMetrics={performanceMetrics}
      skillMetrics={skillMetrics}
      content={content}
      challengeId={challengeId || undefined}
    />
  );
}
