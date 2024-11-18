'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import Link from 'next/link';
import { signUp } from '@/utils/auth-helpers/server-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function SignUp({ allowEmail, redirectMethod }: SignUpProps) {
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
          description: 'Please enter a password.',
          duration: 4000
        });
        return;
      }

      if (password.length < 6) {
        toast.error('Password too short', {
          description: 'Password must be at least 6 characters long.',
          duration: 4000
        });
        return;
      }

      setIsSubmitting(true);
      toast.loading('Creating your account...', {
        id: 'signup',
      });

      const formData = new FormData(e.currentTarget);
      const response = await signUp(formData);
      
      if (response?.error) {
        toast.dismiss('signup');
        toast.error('Sign up failed', {
          description: response.error,
          duration: 6000
        });
        return;
      }

      // Success - the user will be automatically redirected
      toast.dismiss('signup');
      toast.success('Account created', {
        description: 'Your account has been created successfully!',
        duration: 4000
      });

      if (redirectMethod === 'client' && router) {
        router.push('/dashboard');
      }
    } catch (error) {
      toast.dismiss('signup');
      console.error('Sign up error:', error);
      toast.error('Sign up failed', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 6000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
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
              placeholder="Password (min. 6 characters)"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
                <svg
                  aria-hidden="true"
                  role="status"
                  className="mr-2 inline h-4 w-4 animate-spin text-zinc-200 duration-500 dark:text-zinc-950"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="white"
                  ></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Sign up'
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
          <Link href="/dashboard/signin/forgot_password">
            Forgot your password?
          </Link>
        </Button>

        <Button
          variant="link"
          asChild
          className="text-sm font-medium text-zinc-950 dark:text-white"
        >
          <Link href="/dashboard/signin/password_signin">
            Already have an account?
          </Link>
        </Button>

        {allowEmail && (
          <Button
            variant="link"
            asChild
            className="text-sm font-medium text-zinc-950 dark:text-white"
          >
            <Link href="/dashboard/signin/email_signin">
              Sign in via magic link
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
