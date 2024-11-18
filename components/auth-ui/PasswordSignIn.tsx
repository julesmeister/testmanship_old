'use client';

import { Button } from "@/components/ui/button";
import { signInWithPassword } from "@/utils/auth-helpers/server-actions";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod
}: PasswordSignInProps) {
  const router = useRouter();
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
      
      // Show loading toast
      toast.loading('Signing in...', {
        id: 'signin',
        duration: 10000, // 10 seconds timeout
      });

      const formData = new FormData(e.currentTarget);
      const response = await signInWithPassword(formData);
      
      if (response?.error) {
        toast.dismiss('signin');
        toast.error('Sign in failed', {
          description: response.error,
          duration: 6000
        });
        return;
      }

      // Success case
      if (response?.redirect) {
        toast.dismiss('signin');
        toast.success('Signed in successfully', {
          duration: 3000
        });
        
        // Small delay to allow the success message to show
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Perform the redirect
        router.push(response.redirect);
        router.refresh();
        return;
      }

      // Unexpected case
      toast.dismiss('signin');
      toast.error('Sign in error', {
        description: 'An unexpected error occurred during sign in.',
        duration: 6000
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.dismiss('signin');
      
      // Handle specific error cases
      if (error?.message?.includes('session')) {
        toast.error('Session error', {
          description: 'There was a problem with your session. Please try again.',
          duration: 6000
        });
      } else {
        toast.error('Sign in error', {
          description: 'An unexpected error occurred. Please try again later.',
          duration: 6000
        });
      }
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
              id="email"
              name="email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-zinc-950 dark:text-white" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button disabled={isSubmitting} type="submit" className="mt-2">
            {isSubmitting ? <Spinner /> : 'Sign In'}
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
