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
    toast.loading(`Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`, {
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

    if (!data.url) {
      console.error('No redirect URL provided by OAuth provider');
      toast.error('Authentication failed', {
        id: 'auth-error',
        description: 'No redirect URL provided.',
        duration: 4000
      });
      return;
    }

    console.log('Redirecting to OAuth provider URL:', data.url);
    window.location.href = data.url;

  } catch (error) {
    console.error('Unexpected error during OAuth:', error);
    toast.error('Authentication failed', {
      id: 'auth-error',
      description: 'An unexpected error occurred.',
      duration: 4000
    });
  }
}
