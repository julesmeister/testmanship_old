'use client';

import { Button } from "@/components/ui/button";
import { signInWithOAuth } from "@/utils/auth-helpers/client";
import { type Provider } from "@supabase/supabase-js";
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';
import { Input } from "@/components/ui/input";

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: JSX.Element;
};

export default function OauthSignIn() {
  const oAuthProviders: OAuthProviders[] = [
    {
      name: 'google',
      displayName: 'Google',
      icon: <FcGoogle className="h-5 w-5" />
    }
    /* Add desired OAuth providers here */
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    try {
      console.log('Starting OAuth sign-in process...');
      await signInWithOAuth(e);
      console.log('OAuth sign-in process completed');
    } catch (error) {
      console.error('OAuth sign-in error in component:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {oAuthProviders.map((provider) => (
        <form
          key={provider.name}
          className="w-full"
          onSubmit={(e) => handleSubmit(e)}
        >
          <Input type="hidden" name="provider" value={provider.name} />
          <Button
            variant="outline"
            type="submit"
            disabled={isSubmitting}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
          >
            {provider.icon}
            <span>Continue with {provider.displayName}</span>
          </Button>
        </form>
      ))}
    </div>
  );
}
