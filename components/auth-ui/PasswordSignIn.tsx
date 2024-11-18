'use client';

import { Button } from "@/components/ui/button";
import { signInWithPassword } from "@/utils/auth-helpers/server-actions";
import { handleRequest } from "@/utils/auth-helpers/client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod
}: PasswordSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Basic client-side validation
      if (!email.trim()) {
        toast.error('Email required', {
          description: 'Please enter your email address.',
          duration: 4000
        });
        return;
      }

      if (!password.trim()) {
        toast.error('Password required', {
          description: 'Please enter your password.',
          duration: 4000
        });
        return;
      }

      setIsSubmitting(true);
      toast.loading('Signing in...', {
        id: 'signin',
      });

      const formData = new FormData(e.currentTarget);
      const response = await signInWithPassword(formData);
      
      if (response?.error) {
        toast.dismiss('signin');
        
        // Handle specific error cases
        if (response.error.includes('Invalid login credentials')) {
          toast.error('Sign in failed', {
            id: 'signin-error',
            description: 'The email or password you entered is incorrect. Please check your credentials and try again.',
            duration: 6000
          });
        } else if (response.error.includes('Email not confirmed')) {
          toast.error('Email not verified', {
            id: 'signin-error',
            description: 'Please check your email and click the verification link before signing in.',
            duration: 6000
          });
        } else if (response.error.includes('Too many requests')) {
          toast.error('Too many attempts', {
            id: 'signin-error',
            description: 'Too many sign in attempts. Please wait a few minutes before trying again.',
            duration: 6000
          });
        } else {
          toast.error('Sign in error', {
            id: 'signin-error',
            description: response.error,
            duration: 6000
          });
        }
        return;
      }

      // Only dismiss the loading toast on success
      toast.dismiss('signin');
      if (redirectMethod === 'client' && router) {
        router.push('/dashboard');
      }
    } catch (error) {
      // Dismiss the loading toast before showing the error
      toast.dismiss('signin');
      toast.error('Sign in error', {
        id: 'signin-error',
        description: 'An unexpected error occurred. Please try again later.',
        duration: 6000
      });
      console.error('Sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form
        noValidate={true}
        className="mb-4"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <label className="text-zinc-950 dark:text-white" htmlFor="email">
              Email
            </label>
            <Input
              className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 px-4 py-3 transition-all hover:border-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-emerald-500 dark:placeholder:text-zinc-400"
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
              disabled={isSubmitting}
            />
            <label
              className="text-zinc-950 mt-2 dark:text-white"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 px-4 py-3 transition-all hover:border-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-emerald-500 dark:placeholder:text-zinc-400"
              required
              disabled={isSubmitting}
            />
          </div>
          <Button
            variant="emerald"
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-[unset] w-full items-center justify-center rounded-lg px-4 py-4 text-sm font-medium"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </div>
      </form>
      <div className="space-y-2 text-center">
        <Button
          variant="link"
          asChild
          className="text-sm font-medium text-zinc-950 dark:text-white"
        >
          <a href="/dashboard/signin/forgot_password">
            Forgot your password?
          </a>
        </Button>
        
        {allowEmail && (
          <Button
            variant="link"
            asChild
            className="text-sm font-medium text-zinc-950 dark:text-white"
          >
            <a href="/dashboard/signin/email_signin">
              Sign in via magic link
            </a>
          </Button>
        )}
        
        <Button
          variant="link"
          asChild
          className="text-sm font-medium text-zinc-950 dark:text-white"
        >
          <a href="/dashboard/signin/signup">
            Don't have an account? Sign up
          </a>
        </Button>
      </div>
    </div>
  );
}
