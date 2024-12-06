import AdminSettings from '@/components/dashboard/admin';
import { redirect } from 'next/navigation';
import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);


  if (!user) {
    console.log('Redirecting to dashboard - Not authorized');
    return redirect('/dashboard');
  }

  return <AdminSettings user={user} userDetails={userDetails} />;
}
