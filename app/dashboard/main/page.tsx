import Main from '@/components/dashboard/main';
import { redirect } from 'next/navigation';
import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

export default async function Account() {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (!authUser || authError) {
      console.error('Auth error or no user:', authError);
      return redirect('/dashboard/signin');
    }

    // Get user data
    const [user, userDetails] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase)
    ]);

    if (!userDetails) {
      console.error('Failed to get user details');
      // Instead of redirecting, we'll show the page with a warning
      // The getUserDetails function will already show a toast error
    }

    return <Main user={user} userDetails={userDetails} />;
  } catch (error) {
    console.error('Unexpected error in Account page:', error);
    return redirect('/dashboard/signin');
  }
}
