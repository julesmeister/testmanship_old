import { getUserDetails, getUser } from '@/utils/supabase/queries';
import Chat from '@/components/dashboard/test';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AiChat() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return <Chat user={user} userDetails={userDetails} />;
}
