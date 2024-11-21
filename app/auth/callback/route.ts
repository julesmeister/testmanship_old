import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    try {
      const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);

      if (authError) {
        console.error('Auth error:', authError);
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/dashboard/signin`,
            authError.name,
            "Sorry, we weren't able to log you in. Please try again."
          )
        );
      }

      if (!session?.user) {
        console.error('No user in session after exchange');
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/dashboard/signin`,
            'NoUserError',
            "Sorry, we couldn't complete the sign-in process. Please try again."
          )
        );
      }

      // Ensure auth.users record exists with retries
      let retries = 5;
      let authUser: { user: User } | null = null;
      while (retries > 0 && !authUser) {
        const { data: user, error: authError } = await supabase.auth.admin.getUserById(session.user.id);
        if (user && !authError) {
          authUser = user;
          break;
        }
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!authUser) {
        console.error('Failed to confirm auth.users record after multiple retries');
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/dashboard/signin`,
            'UserCreationError',
            "Failed to create user record. Please try again."
          )
        );
      }

      // Now safely create the public.users record
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!existingUser || fetchError) {
        console.log('Creating/updating user record after OAuth');
        
        // Create or update user record with retry
        let upsertRetries = 3;
        let upsertSuccess = false;
        
        while (upsertRetries > 0 && !upsertSuccess) {
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.name ||
                        (session.user.user_metadata?.given_name && session.user.user_metadata?.family_name 
                          ? `${session.user.user_metadata.given_name} ${session.user.user_metadata.family_name}`
                          : session.user.email?.split('@')[0] || 'Anonymous User'),
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
              credits: 0,
              trial_credits: 3
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            });

          if (!upsertError) {
            upsertSuccess = true;
            break;
          }

          console.error(`Retry ${4 - upsertRetries}/3 failed:`, upsertError);
          upsertRetries--;
          if (upsertRetries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!upsertSuccess) {
          console.error('Failed to create user record after multiple retries');
          return NextResponse.redirect(
            getErrorRedirect(
              `${requestUrl.origin}/dashboard/signin`,
              'UserCreationError',
              "Failed to create user record. Please try again."
            )
          );
        }
      }
    } catch (error) {
      console.error('Unexpected error in callback:', error);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/dashboard/signin`,
          'UnexpectedError',
          "An unexpected error occurred. Please try again."
        )
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/dashboard/main`,
      'Success!',
      'You are now signed in.'
    )
  );
}
