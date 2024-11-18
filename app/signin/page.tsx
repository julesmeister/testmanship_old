'use server';

import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
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

    return true;
  } catch (error) {
    console.error('Error ensuring user record:', error);
    return false;
  }
}

export default async function Signin() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return redirect('/dashboard/signin');
  }

  // Ensure user record exists in public.users table
  const recordCreated = await ensureUserRecord(supabase, authUser);
  
  if (!recordCreated) {
    console.error('Failed to create user record');
  }

  // Redirect to main dashboard
  redirect('/dashboard/main');
}
