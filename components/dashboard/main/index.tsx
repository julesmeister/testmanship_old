/*eslint-disable*/
'use client';

import MainChart from '@/components/dashboard/main/cards/MainChart';
import MainDashboardTable from '@/components/dashboard/main/cards/MainDashboardTable';
import DashboardLayout from '@/components/layout';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useSupabase } from '@/app/supabase-provider';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

export default function Main({user, userDetails}) {
  const { supabase } = useSupabase();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function checkSession() {
      
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!currentSession?.user) {
          console.error('No session user found');
          toast.error('Please sign in to delete attempt');
        } else {
          setSession(currentSession);
        }
    }

    checkSession();
  }, [supabase]);

  useAuthCheck({ user: user, userDetails: userDetails, supabase });

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Writing Dashboard"
      description="Track your writing progress and feedback"
    >
      <div className="min-h-screen w-full">
        <div className="mb-5 flex gap-5 flex-col xl:flex-row w-full">
          <MainChart user={user} userDetails={userDetails} session={session} />
        </div>
        <div className="w-full rounded-lg">
          <MainDashboardTable user={user} userDetails={userDetails} session={session} />
        </div>
      </div>
    </DashboardLayout>
  );
}
