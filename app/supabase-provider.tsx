'use client';

import type { Database } from '@/types/types_db';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserClient<Database>>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            if (typeof document === 'undefined') return '';
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`));
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
          },
          set(name: string, value: string, options: { maxAge?: number; path?: string }) {
            if (typeof document === 'undefined') return;
            document.cookie = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'}; max-age=${options.maxAge || 31536000}`;
          },
          remove(name: string, options: { path?: string }) {
            if (typeof document === 'undefined') return;
            document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          },
        },
      }
    )
  );

  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('Auth state changed: SIGNED_IN', session);
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        console.log('Auth state changed: SIGNED_OUT');
        router.push('/signin');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Auth state changed: TOKEN_REFRESHED', session);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', { session, error });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
};
