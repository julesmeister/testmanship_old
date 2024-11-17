'use client'
import { createClient } from '@/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { redirectToPath } from './server';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';

interface UserRecord {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  credits: number | null;
  trial_credits: number | null;
}

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  try {
    const formData = new FormData(e.currentTarget);
    const redirectUrl: string = await requestFunc(formData);

    // Check if the URL contains error or success parameters
    const url = new URL(redirectUrl, window.location.origin);
    const error = url.searchParams.get('error');
    const status = url.searchParams.get('status');
    const errorMessage = url.searchParams.get('error_description');
    const statusMessage = url.searchParams.get('status_description');

    if (error) {
      toast.error(error, {
        id: 'auth-error',
        description: errorMessage || 'Please try again.',
        duration: 4000
      });
    } else if (status) {
      // Show success toast and wait before redirecting
      toast.success(status, {
        id: 'auth-success',
        description: statusMessage || 'Authentication successful.',
        duration: 4000
      });
      
      // Wait for toast to be visible before redirecting
      await new Promise(resolve => setTimeout(resolve, 4000));
    }

    if (router) {
      // If client-side router is provided, use it to redirect
      return router.push(redirectUrl);
    } else {
      // Otherwise, redirect server-side
      return await redirectToPath(redirectUrl);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    toast.error('Authentication failed', {
      id: 'auth-error',
      description: 'An unexpected error occurred. Please try again.',
      duration: 4000
    });
    throw error; // Re-throw to be caught by the component
  }
}

export async function signInWithOAuth(
  e: React.FormEvent<HTMLFormElement>
) {
  // Prevent default form submission
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const provider = String(formData.get('provider')).toLowerCase() as Provider;
  console.log('Starting OAuth sign-in with provider:', provider);

  const supabase = createClient();

  try {
    toast.loading('Connecting to provider...', {
      id: 'oauth-signin',
      duration: 2000
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${getURL()}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    console.log('OAuth response:', { data, error });

    if (error) {
      console.error('OAuth sign-in error:', error);
      toast.error('Authentication failed', {
        id: 'auth-error',
        description: error.message || 'Failed to connect with provider.',
        duration: 4000
      });
      return;
    }

    // Create/update user record after successful OAuth
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);

      if (!user) {
        console.error('No user data available after OAuth');
        return;
      }

      // Wait for the database trigger with exponential backoff
      let attempts = 0;
      const maxAttempts = 3;
      let userRecord: UserRecord | null = null;

      while (attempts < maxAttempts) {
        const delay = Math.pow(2, attempts) * 1000; // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before checking user record (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));

        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, credits, trial_credits')
          .eq('id', user.id)
          .single();

        console.log(`Attempt ${attempts + 1} - User record check:`, { existingUser, fetchError });

        if (existingUser) {
          userRecord = existingUser;
          break;
        }

        attempts++;
      }

      // If no user record exists after waiting, create one
      if (!userRecord) {
        console.log('Creating new user record after waiting period');
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: user.id,
              full_name: user.user_metadata?.full_name || 
                        user.user_metadata?.name ||
                        (user.user_metadata?.given_name && user.user_metadata?.family_name 
                          ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
                          : 'Anonymous User'),
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              credits: 0,
              trial_credits: 3
            }
          ])
          .select()
          .single();

        if (insertError) {
          // If insert fails, try one more time to get the user record
          // (in case the trigger created it just now)
          const { data: finalCheck } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!finalCheck) {
            console.error('Failed to create or find user record:', insertError);
            toast.error('Profile initialization failed', {
              id: 'auth-error',
              description: 'Please try refreshing the page or contact support.',
              duration: 4000
            });
            return;
          }
        } else {
          console.log('User record created successfully:', newUser);
          toast.success('Account created successfully!', {
            id: 'auth-success',
            duration: 4000
          });
        }
      } else {
        // If user exists but profile data is incomplete, update it from OAuth
        const updates: { [key: string]: any } = {};
        
        if (!userRecord.full_name) {
          updates.full_name = user.user_metadata?.full_name || 
                            user.user_metadata?.name ||
                            (user.user_metadata?.given_name && user.user_metadata?.family_name 
                              ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
                              : null);
        }
        
        if (!userRecord.avatar_url) {
          updates.avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating user profile:', updateError);
          } else {
            console.log('User profile updated with OAuth data:', updates);
          }
        }
      }
    } catch (userError) {
      console.error('Error handling user record:', userError);
      toast.error('Profile initialization error', {
        id: 'auth-error',
        description: 'Your account was created but profile setup failed. Please try refreshing.',
        duration: 4000
      });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    toast.error('Authentication failed', {
      id: 'auth-error',
      description: 'An unexpected error occurred. Please try again.',
      duration: 4000
    });
  } finally {
    toast.dismiss('oauth-signin');
  }
}
