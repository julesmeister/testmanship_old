'use server';

import { createClient } from '@/utils/supabase/server';
import { getURL, getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { getAuthTypes } from '@/utils/auth-helpers/settings';

function isValidEmail(email: string) {
  var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function redirectToPath(path: string) {
  return { redirect: path };
}

export async function SignOut(formData: FormData) {
  const pathName = String(formData.get('pathName')).trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return getErrorRedirect(
      pathName,
      'Error signing out',
      error.message
    );
  }

  return { redirect: '/' };
}

export async function signInWithEmail(formData: FormData) {
  // Get data from form
  const email = String(formData.get('email')).trim();
  const redirectTo = String(formData.get('redirectTo') || '').trim();

  const supabase = await createClient();

  if (!email || !isValidEmail(email)) {
    return getErrorRedirect(
      redirectTo,
      'Invalid email',
      'Please enter a valid email address'
    );
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getURL()}/auth/callback`,
    },
  });

  if (error) {
    return getErrorRedirect(
      redirectTo,
      'Error sending magic link',
      error.message
    );
  }

  return getStatusRedirect(
    redirectTo,
    'Magic link sent',
    'Check your email for a login link'
  );
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  const redirectTo = String(formData.get('redirectTo') || '/dashboard').trim();

  try {
    console.log('=== Starting Sign In Process ===');
    console.log('Email:', email);
    console.log('Redirect to:', redirectTo);

    // Input validation
    if (!email || !isValidEmail(email)) {
      console.error('Invalid email format');
      return {
        error: 'Please enter a valid email address'
      };
    }

    if (!password || password.length < 6) {
      console.error('Invalid password length');
      return {
        error: 'Password must be at least 6 characters'
      };
    }

    // Create client
    console.log('Creating Supabase client...');
    const supabase = await createClient();
    
    // Attempt sign in
    console.log('Attempting sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', {
        code: error.status,
        name: error.name,
        message: error.message
      });

      // Return specific error messages
      if (error.message.includes('Invalid login credentials')) {
        return {
          error: 'Invalid login credentials. Please check your email and password.'
        };
      }

      if (error.message.includes('Email not confirmed')) {
        return {
          error: 'Email not confirmed. Please check your email and click the verification link.'
        };
      }

      if (error.message.includes('Too many requests')) {
        return {
          error: 'Too many sign in attempts. Please wait a few minutes before trying again.'
        };
      }

      return {
        error: `Authentication failed: ${error.message}`
      };
    }

    if (!data?.user) {
      console.error('No user data returned');
      return {
        error: 'Authentication failed: No user data returned'
      };
    }

    // Update the user's updated_at timestamp
    console.log('Updating last active timestamp...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.user.id);

    if (updateError) {
      console.error('Error updating timestamp:', updateError);
      // Don't return error, still allow sign in
    }

    console.log('Sign in successful:', data.user.id);
    console.log('Redirecting to:', redirectTo);
    
    // Force a hard redirect instead of using Next.js redirect
    return { redirect: redirectTo };
  } catch (error) {
    console.error('=== Unexpected Error ===');
    console.error('Error:', error);
    
    return {
      error: 'An unexpected error occurred. Please try again later.'
    };
  }
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  const redirectTo = String(formData.get('redirectTo') || '').trim();

  try {
    console.log('=== Starting Signup Process ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Redirect to:', redirectTo);
    
    // 1. Validate input
    if (!email || !isValidEmail(email)) {
      console.error('Invalid email:', email);
      return {
        error: 'Please enter a valid email address'
      };
    }

    if (!password) {
      console.error('Password is empty');
      return {
        error: 'Password is required'
      };
    }

    if (password.length < 6) {
      console.error('Password too short:', password.length);
      return {
        error: 'Password must be at least 6 characters'
      };
    }

    // 2. Create admin client
    console.log('Creating Supabase admin client...');
    const adminClient = await createClient(true);

    // 3. Check if user exists in auth system
    console.log('Checking if user exists in auth system...');
    const { data: authData } = await adminClient.auth.admin.listUsers();
    const authUserExists = authData.users.some((user: { email?: string }) => user.email === email);
    
    if (authUserExists) {
      console.error('User already exists in auth system:', email);
      return {
        error: 'An account with this email already exists'
      };
    }

    // 4. Create auth user
    console.log('Creating auth user...');
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        signup_date: new Date().toISOString()
      }
    });

    if (createError) {
      console.error('User creation failed:', {
        code: createError.status,
        name: createError.name,
        message: createError.message
      });
      
      if (createError.message.includes('already exists')) {
        return {
          error: 'An account with this email already exists'
        };
      }
      
      return {
        error: `Failed to create account: ${createError.message}`
      };
    }

    if (!userData?.user) {
      console.error('No user data returned');
      return {
        error: 'Failed to create user account'
      };
    }

    console.log('Auth user created successfully:', {
      id: userData.user.id,
      email: userData.user.email,
      created_at: userData.user.created_at
    });

    // 5. Check if user record already exists and delete if necessary
    console.log('Checking for existing user record...');
    const { data: existingRecord } = await adminClient
      .from('users')
      .select('id')
      .eq('id', userData.user.id)
      .single();

    if (existingRecord) {
      console.log('Deleting existing user record...');
      await adminClient
        .from('users')
        .delete()
        .eq('id', userData.user.id);
    }

    // 6. Create user profile
    console.log('Creating user profile...');
    const initialFullName = email.split('@')[0]; // Extract name from email
    const { error: insertError } = await adminClient
      .from('users')
      .insert([{ 
        id: userData.user.id,
        full_name: initialFullName,
        avatar_url: '',
        updated_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Profile creation failed:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details
      });
      
      // Clean up: delete the auth user if profile creation fails
      console.log('Rolling back: deleting auth user...');
      await adminClient.auth.admin.deleteUser(userData.user.id);
      
      return {
        error: 'Failed to create user profile'
      };
    }

    // 7. Sign in the user immediately
    console.log('Signing in the new user...');
    const { error: signInError } = await adminClient.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Auto sign-in failed:', signInError);
      // Don't return error here, account was still created successfully
    }

    console.log('=== Signup Completed Successfully ===');
    console.log('Redirecting to:', redirectTo || '/dashboard');
    return { redirect: redirectTo || '/dashboard' };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      // This is an expected redirect, rethrow it
      throw error;
    }
    
    console.error('=== Unexpected Error ===');
    console.error('Error:', error);
    return {
      error: 'An unexpected error occurred during signup'
    };
  }
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password')).trim();
  const passwordConfirm = String(formData.get('passwordConfirm')).trim();
  const redirectTo = String(formData.get('redirectTo') || '').trim();

  const supabase = await createClient();

  if (!password) {
    return getErrorRedirect(
      redirectTo,
      'Invalid password',
      'Please enter a password'
    );
  }

  if (password !== passwordConfirm) {
    return getErrorRedirect(
      redirectTo,
      'Passwords do not match',
      'Please make sure your passwords match'
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return getErrorRedirect(
      redirectTo,
      'Error updating password',
      error.message
    );
  }

  return getStatusRedirect(
    redirectTo,
    'Password updated',
    'Your password has been updated'
  );
}

export async function updateEmail(formData: FormData) {
  const email = String(formData.get('email')).trim();
  const redirectTo = String(formData.get('redirectTo') || '').trim();

  const supabase = await createClient();

  if (!email || !isValidEmail(email)) {
    return getErrorRedirect(
      redirectTo,
      'Invalid email',
      'Please enter a valid email address'
    );
  }

  const { error } = await supabase.auth.updateUser({
    email,
  });

  if (error) {
    return getErrorRedirect(
      redirectTo,
      'Error updating email',
      error.message
    );
  }

  return getStatusRedirect(
    redirectTo,
    'Email updated',
    'Please check your email to confirm the update'
  );
}

export async function updateName(formData: FormData) {
  const fullName = String(formData.get('fullName')).trim();
  const redirectTo = String(formData.get('redirectTo') || '').trim();

  const supabase = await createClient();

  if (!fullName) {
    return getErrorRedirect(
      redirectTo,
      'Invalid name',
      'Please enter your name'
    );
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) {
    return getErrorRedirect(
      redirectTo,
      'Error updating name',
      error.message
    );
  }

  return getStatusRedirect(
    redirectTo,
    'Name updated',
    'Your name has been updated'
  );
}
