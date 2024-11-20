import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ChallengeGeneratorView } from '@/components/dashboard/challenge-generator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Challenge Generator',
  description: 'Generate writing challenges based on difficulty levels'
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ChallengeGeneratorPage({ searchParams }: Props) {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  // Handle edit mode
  const mode = String(searchParams?.mode || '');
  const challengeId = String(searchParams?.id || '');
  
  let challengeToEdit = null;
  if (mode === 'edit' && challengeId) {
    const { data: challenge, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();
    
    if (error) {
      console.error('Error fetching challenge:', error);
      return redirect('/dashboard/challenges');
    }

    // Verify ownership
    if (challenge.created_by !== user.id) {
      return redirect('/dashboard/challenges');
    }

    challengeToEdit = challenge;
  }

  return (
    <ChallengeGeneratorView 
      user={user} 
      userDetails={userDetails} 
      challengeToEdit={challengeToEdit}
    />
  );
}
