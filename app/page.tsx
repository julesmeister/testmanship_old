'use server';

import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient();
  const [user] = await Promise.all([getUser(supabase)]);

  if (!user) {
    return redirect('/landing/shadcn-landing-page-main/src');
  }

  // Redirect to dashboard directly
  redirect('/dashboard/main');
}
