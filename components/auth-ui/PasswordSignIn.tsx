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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsSubmitting(true);
      toast.loading('Signing in...', {
        id: 'signin',
      });

      await handleRequest(e, signInWithPassword, router);
      
      // Only dismiss the loading toast on success
      toast.dismiss('signin');
    } catch (error) {
      // Dismiss the loading toast before showing the error
      toast.dismiss('signin');
      if (error instanceof Error) {
        toast.error('Invalid login credentials', {
          id: 'signin-error',
          description: 'Please check your email and password and try again.',
          duration: 4000
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
        onSubmit={(e) => handleSubmit(e)}
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
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
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
              autoComplete="current-password"
              className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 px-4 py-3 transition-all hover:border-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-emerald-500 dark:placeholder:text-zinc-400"
            />
          </div>
          <Button
            variant="emerald"
            type="submit"
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
