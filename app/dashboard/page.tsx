import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Main from '@/components/dashboard/main';
import { getUserDetails } from '@/utils/supabase/queries';

async function ensureUserRecord(supabase: any, authUser: any) {
  try {
    console.log('Ensuring user record for:', authUser.id);
    
    // Check if user record exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user record:', fetchError);
      throw fetchError;
    }

    if (!existingUser) {
      console.log('Creating new user record');
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

    return true;
  } catch (error) {
    console.error('Error ensuring user record:', error);
    return false;
  }
}

export default async function Dashboard() {
  try {
    console.log('=== Dashboard Page Start ===');
    
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return redirect('/dashboard/signin');
    }

    if (!authUser) {
      console.log('No authenticated user found');
      return redirect('/dashboard/signin');
    }

    console.log('Authenticated user:', authUser.id);

    // Ensure user record exists in public.users table
    const recordCreated = await ensureUserRecord(supabase, authUser);
    
    if (!recordCreated) {
      console.error('Failed to create user record');
      // Sign out the user if we can't create their record
      await supabase.auth.signOut();
      return redirect('/dashboard/signin?error=user_creation_failed');
    }

    // Get user details
    const userDetails = await getUserDetails(supabase);
    
    console.log('=== Dashboard Page End ===');
    
    // Render the main component directly instead of redirecting
    return <Main user={authUser} userDetails={userDetails} />;
  } catch (error) {
    console.error('Dashboard page error:', error);
    return redirect('/dashboard/signin?error=unexpected_error');
  }
}
