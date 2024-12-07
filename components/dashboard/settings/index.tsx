/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { getURL, getStatusRedirect } from '@/utils/helpers';
import Notifications from './components/notification-settings';
import { Input } from '@/components/ui/input';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const supabase = createClient();
export default function Settings(props: Props) {
  // Input States
  const [nameError, setNameError] = useState<{
    status: boolean;
    message: string;
  }>();
  console.log('User:', props.user);
  console.log('User Metadata:', props.user?.user_metadata);
  console.log('User Email:', props.user?.user_metadata?.email);
  console.log(props.user);
  console.log(props.userDetails);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!props.user) {
      setIsSubmitting(false);
      return;
    }

    // Check if the new email is the same as the old email
    if (e.currentTarget.newEmail.value === props.user.email) {
      setIsSubmitting(false);
      return;
    }
    // Get form data
    const newEmail = e.currentTarget.newEmail.value.trim();
    const callbackUrl = getURL(
      getStatusRedirect(
        '/dashboard/settings',
        'Success!',
        `Your email has been updated.`
      )
    );
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo: callbackUrl
      }
    );
    router.push('/dashboard/settings');
    setIsSubmitting(false);
  };

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!props.user || !props.user.user_metadata) {
      setIsSubmitting(false);
      return;
    }

    // Check if the new name is the same as the old name
    if (e.currentTarget.fullName.value === props.user.user_metadata.full_name) {
      setIsSubmitting(false);
      return;
    }
    // Get form data
    const fullName = e.currentTarget.fullName.value.trim();

    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', props.user?.id);
    if (error) {
      console.log(error);
    }
    e.preventDefault();
    supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    router.push('/dashboard/settings');
    setIsSubmitting(false);
  };

  const notifications = [
    { message: 'Your call has been confirmed.', time: '1 hour ago' },
    { message: 'You have a new message!', time: '1 hour ago' },
    { message: 'Your subscription is expiring soon!', time: '2 hours ago' }
  ];

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Account Settings"
      description="Profile settings."
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - Profile & Notifications */}
          <div className="lg:col-span-4">
            {/* Profile Header */}
            <Card className="mb-8 overflow-hidden bg-gradient-to-br from-zinc-50 to-white p-6 dark:from-zinc-900 dark:to-zinc-800">
              <div className="flex flex-col items-center text-center">
                <Avatar className="mb-4 h-24 w-24 ring-2 ring-white dark:ring-zinc-700">
                  <AvatarImage src={props.user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-3xl font-bold text-zinc-950 dark:text-white">
                    {props.user?.user_metadata?.email && typeof props.user.user_metadata.email === 'string' 
                      ? props.user.user_metadata.email[0]?.toUpperCase()
                      : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                    {props.userDetails?.full_name}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Language Enthusiast
                  </p>
                </div>
              </div>
            </Card>

            {/* Notifications Section */}
            <Card className="overflow-hidden">
              <div className="border-b border-zinc-200 p-6 dark:border-zinc-700">
                <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">
                  Notification Settings
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Manage your notification preferences
                </p>
              </div>
              <div className="p-6">
                <Notifications notifications={notifications} />
              </div>
            </Card>
          </div>

          {/* Right Column - Account Details */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              <div className="border-b border-zinc-200 p-6 dark:border-zinc-700">
                <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">
                  Account Details
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Update your account information
                </p>
              </div>
              
              <div className="space-y-6 p-6">
                {/* Name Form */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-zinc-950 dark:text-white"
                    htmlFor="fullName"
                  >
                    Full Name
                    <span className="ml-1 text-sm text-zinc-500 dark:text-zinc-400">
                      (30 characters maximum)
                    </span>
                  </label>
                  <form
                    id="nameForm"
                    onSubmit={(e) => handleSubmitName(e)}
                    className="flex flex-col gap-4 sm:flex-row"
                  >
                    <Input
                      type="text"
                      name="fullName"
                      defaultValue={props.userDetails?.full_name ?? ''}
                      placeholder="Enter your full name"
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="whitespace-nowrap"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Name'}
                    </Button>
                  </form>
                  {nameError?.status && (
                    <p className="mt-2 text-sm text-red-500">{nameError.message}</p>
                  )}
                </div>

                {/* Email Form */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-zinc-950 dark:text-white"
                    htmlFor="newEmail"
                  >
                    Email Address
                    <span className="ml-1 text-sm text-zinc-500 dark:text-zinc-400">
                      (Verification required)
                    </span>
                  </label>
                  <form
                    id="emailForm"
                    onSubmit={(e) => handleSubmitEmail(e)}
                    className="flex flex-col gap-4 sm:flex-row"
                  >
                    <Input
                      type="email"
                      name="newEmail"
                      defaultValue={props.user?.email ?? ''}
                      placeholder="Enter your email address"
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="whitespace-nowrap"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Email'}
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
