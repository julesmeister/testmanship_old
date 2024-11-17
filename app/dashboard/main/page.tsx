import Main from '@/components/dashboard/main';
import { redirect } from 'next/navigation';
import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

async function ensureUserRecord(supabase: any, authUser: any) {
  try {
    // Check if user record exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!existingUser || fetchError?.code === 'PGRST116') {
      // Create user record if it doesn't exist
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
            avatar_url: authUser.user_metadata?.avatar_url || '',
            credits: 0,
            trial_credits: 3
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user record:', insertError);
        throw insertError;
      }
    }

    return existingUser || true;
  } catch (error) {
    console.error('Error ensuring user record:', error);
    return false;
  }
}

export default async function Account() {
  const supabase = createClient();

  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return redirect('/dashboard/signin');
  }

  // Ensure user record exists in public.users table
  const userRecord = await ensureUserRecord(supabase, authUser);

  if (!userRecord) {
    console.error('Failed to create or retrieve user record');
    // You might want to handle this error differently
  }

  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  return <Main user={user} userDetails={userDetails} />;
}
