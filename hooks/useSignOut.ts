import { createClient } from '@/utils/supabase/client';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

const supabase = createClient();

export function useSignOut() {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  const signOut = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    toast.loading('Signing out...', {
      id: 'signout',
      duration: 1000,
    });
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error('Sign out failed', {
        id: 'signout',
        description: 'Please try again.',
      });
      return false;
    }
    
    toast.success('Signed out successfully', {
      id: 'signout',
    });
    
    if (router) {
      router.push('/dashboard/signin');
    } else {
      window.location.href = '/dashboard/signin';
    }
    
    return true;
  };

  return signOut;
}
