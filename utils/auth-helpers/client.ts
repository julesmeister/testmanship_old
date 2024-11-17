'use client'
import { createClient } from '@/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { redirectToPath } from './server';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';

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
        id: 'signin',
        description: errorMessage || 'Please try again.',
        duration: 2000
      });
    } else if (status) {
      // Show success toast and wait before redirecting
      toast.success(status, {
        id: 'signin',
        description: statusMessage || 'Authentication successful.',
        duration: 2000
      });
      
      // Wait for toast to be visible before redirecting
      await new Promise(resolve => setTimeout(resolve, 2000));
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
      id: 'signin',
      description: 'An unexpected error occurred. Please try again.',
      duration: 2000
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
        description: error.message || 'Failed to connect with provider.',
        duration: 2000
      });
    } else {
      // Create user record after successful OAuth
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);

        if (user) {
          // Check if user record exists
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          console.log('Existing user check:', { existingUser, fetchError });

          if (!existingUser || fetchError?.code === 'PGRST116') {
            console.log('Creating new user record for:', user.id);
            
            // User record doesn't exist, create it
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                { 
                  id: user.id,
                  full_name: user.user_metadata?.full_name || user.user_metadata?.name,
                  avatar_url: user.user_metadata?.avatar_url,
                  credits: 0,
                  trial_credits: 3
                }
              ])
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user record:', insertError);
              toast.error('Failed to initialize user profile', {
                description: 'Please try refreshing the page.',
                duration: 2000
              });
            } else {
              console.log('User record created successfully');
              toast.success('Account created successfully!', {
                duration: 2000
              });
            }
          } else {
            console.log('User record already exists');
          }
        } else {
          console.error('No user data available after OAuth');
        }
      } catch (userError) {
        console.error('Error handling user record:', userError);
      }
    }
  } catch (error) {
    console.error('OAuth error:', error);
    toast.error('Authentication failed', {
      description: 'An unexpected error occurred. Please try again.',
      duration: 2000
    });
  } finally {
    toast.dismiss('oauth-signin');
  }
}
