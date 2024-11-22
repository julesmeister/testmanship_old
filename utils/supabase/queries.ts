import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { toast } from 'sonner';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Error getting auth user:', authError);
    return null;
  }

  return user;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  try {
    // Get the authenticated user first
    const {
      data: { user: authUser },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      console.error('Auth error or no user:', authError);
      return null;
    }

    // Get user details with the correct ID
    const { data: userDetails, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (fetchError) {
      console.error('Error fetching user details:', fetchError);
      if (fetchError.code === 'PGRST116') {
        // Get name from metadata or email
        const fullName = authUser.user_metadata?.full_name || 
                        authUser.user_metadata?.name || 
                        (authUser.email ? authUser.email.split('@')[0] : 'Anonymous User');
        
        // Get avatar from metadata or auth user
        const avatarUrl = authUser.user_metadata?.avatar_url || 
                         authUser.user_metadata?.picture || 
                         authUser.identities?.[0]?.identity_data?.avatar_url || 
                         '';

        // Record not found, try to create it
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: authUser.id,
              full_name: fullName,
              avatar_url: avatarUrl,
              credits: 0,
              trial_credits: 3
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user record:', insertError);
          toast.error('Failed to initialize user data', {
            description: 'Please try refreshing the page.',
            duration: 3000
          });
          return null;
        }

        return newUser;
      }
      return null;
    }

    return userDetails;
  } catch (error) {
    console.error('Unexpected error in getUserDetails:', error);
    return null;
  }
});
