import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

interface AuthCheckProps {
  user: User | null;
  userDetails: any;
  supabase: SupabaseClient;
}

export function useAuthCheck({ user, userDetails, supabase }: AuthCheckProps) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Current auth session:', session);
        console.log('User prop:', user);
        console.log('User details:', userDetails);
        if (error) {
          console.error('Auth check error:', error);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    checkAuth();
  }, [user, userDetails, supabase]);
}
