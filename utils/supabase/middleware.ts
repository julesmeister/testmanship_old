import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    console.log('=== Middleware Start ===');
    console.log('Request URL:', request.url);
    console.log('Request pathname:', request.nextUrl.pathname);

    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            try {
              const cookie = request.cookies.get(name);
              return cookie?.value;
            } catch (error) {
              console.error('Error getting cookie:', error);
              return undefined;
            }
          },
          async set(name: string, value: string, options: any) {
            try {
              request.cookies.set({
                name,
                value,
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.set({
                name,
                value,
                ...options,
              });
            } catch (error) {
              console.error('Error setting cookie:', error);
            }
          },
          async remove(name: string, options: any) {
            try {
              request.cookies.delete({
                name,
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.delete({
                name,
                ...options,
              });
            } catch (error) {
              console.error('Error removing cookie:', error);
            }
          },
        },
      }
    );

    // Get current pathname
    const pathname = request.nextUrl.pathname;
    console.log('Processing pathname:', pathname);

    // Check if this is a sign-in related path
    const isAuthPath = pathname.includes('/signin') || pathname.includes('/signup');
    console.log('Is auth path:', isAuthPath);

    try {
      // First check session
      const { data: { session } } = await supabase.auth.getSession();
      let user = null;

      if (session) {
        // Only try to get user if we have a session
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && authUser) {
          // Verify user exists in database
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('id')
            .eq('id', authUser.id)
            .single();

          if (!dbError && dbUser) {
            user = authUser;
          } else {
            console.log('User not found in database, signing out');
            await supabase.auth.signOut();
          }
        }
      }

      // Define protected paths
      const isProtectedPath = pathname.startsWith('/dashboard') && 
                            !pathname.includes('/signin') && 
                            !pathname.includes('/signup');
      
      console.log('Path protection status:', {
        pathname,
        isProtectedPath,
        hasUser: !!user
      });

      // Handle protected routes
      if (isProtectedPath && !user) {
        console.log('Redirecting to signin - No user for protected path');
        return NextResponse.redirect(new URL('/dashboard/signin', request.url));
      }

      // Handle auth routes when already signed in
      if (isAuthPath && user) {
        console.log('Redirecting to dashboard - Already authenticated');
        return NextResponse.redirect(new URL('/dashboard/main', request.url));
      }

      console.log('=== Middleware End ===');
      return response;

    } catch (error) {
      console.error('Error in auth check:', error);
      // On critical error, clear session and redirect to signin if not already on auth path
      if (!isAuthPath) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error('Error signing out:', e);
        }
        return NextResponse.redirect(new URL('/dashboard/signin', request.url));
      }
      return response;
    }
  } catch (e) {
    console.error('Middleware error:', e);
    // On critical error, redirect to signin if not on auth path
    const isAuthPath = request.nextUrl.pathname.includes('/signin') || 
                      request.nextUrl.pathname.includes('/signup');
    if (!isAuthPath) {
      return NextResponse.redirect(new URL('/dashboard/signin', request.url));
    }
    return NextResponse.next();
  }
};