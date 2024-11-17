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
      });
    } else if (status) {
      // Show success toast and wait before redirecting
      toast.success(status, {
        id: 'signin',
        description: statusMessage || 'Authentication successful.',
        duration: 2000, // Show for 2 seconds
      });
      
      // Wait for toast to be visible before redirecting
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    });
    throw error; // Re-throw to be caught by the component
  }
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
  // Prevent default form submission refresh
  e.preventDefault();
  
  try {
    const formData = new FormData(e.currentTarget);
    const provider = String(formData.get('provider')).trim() as Provider;

    toast.loading('Connecting to provider...', {
      duration: 2000,
    });

    // Create client-side supabase client and call signInWithOAuth
    const supabase = createClient();
    const redirectURL = getURL('/auth/callback');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectURL
      }
    });

    if (error) {
      toast.error('Authentication failed', {
        description: error.message || 'Failed to connect with provider.',
      });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    toast.error('Authentication failed', {
      description: 'Failed to connect with provider. Please try again.',
    });
  }
}
