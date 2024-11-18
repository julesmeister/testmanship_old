import { createClient as createSbClient } from '@supabase/supabase-js';

export const createClient = async (useServiceRole: boolean = false) => {
  console.log('=== Creating Supabase Client ===');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = useServiceRole 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
    throw new Error('Missing required Supabase configuration');
  }

  console.log('Creating client with config:', {
    url: supabaseUrl,
    hasKey: !!supabaseKey,
    isServiceRole: useServiceRole
  });

  return createSbClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
};
