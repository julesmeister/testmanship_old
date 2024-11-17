import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ChallengeGeneratorView from '@/components/dashboard/challenge-generator/ChallengeGeneratorView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Challenge Generator',
  description: 'Generate writing challenges based on difficulty levels'
};

export default async function ChallengeGeneratorPage() {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return <ChallengeGeneratorView user={user} userDetails={userDetails} />;
}
