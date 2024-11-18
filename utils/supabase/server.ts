'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async (isAdmin: boolean = false) => {
  try {
    console.log('=== Creating Supabase Client ===');
    
    const cookieStore = await cookies();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = isAdmin 
      ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Validate environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        isAdmin
      });
      throw new Error('Missing required Supabase configuration');
    }

    console.log('Creating client with config:', {
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      isAdmin
    });

    const client = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          async get(name: string) {
            try {
              const cookie = await cookieStore.get(name);
              return cookie?.value;
            } catch (error) {
              console.error('Error getting cookie:', error);
              return undefined;
            }
          },
          async set(name: string, value: string, options: CookieOptions) {
            try {
              await cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.error('Error setting cookie:', error);
            }
          },
          async remove(name: string, options: CookieOptions) {
            try {
              await cookieStore.delete({ name, ...options });
            } catch (error) {
              console.error('Error removing cookie:', error);
            }
          },
        },
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true
        }
      }
    );

    // Skip user verification for admin client
    if (!isAdmin) {
      try {
        // First check session
        const { data: { session } } = await client.auth.getSession();
        
        // Only verify user if we have a session
        if (session) {
          const { data: { user }, error: userError } = await client.auth.getUser();
          
          if (userError) {
            console.error('User verification failed:', userError);
            await client.auth.signOut();
          } else if (user) {
            // Verify user exists in database
            const { data: dbUser, error: dbError } = await client
              .from('users')
              .select('id')
              .eq('id', user.id)
              .single();

            if (dbError || !dbUser) {
              console.error('User not found in database');
              await client.auth.signOut();
            }
          }
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        // Don't throw here, just log the error
      }
    }

    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
};
