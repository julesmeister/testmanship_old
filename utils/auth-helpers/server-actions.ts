'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getURL, getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { getAuthTypes } from '@/utils/auth-helpers/settings';

function isValidEmail(email: string) {
  var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function redirectToPath(path: string) {
  return redirect(path);
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

  return redirect('/');
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
  const redirectTo = String(formData.get('redirectTo') || '').trim();

  const supabase = await createClient();

  if (!email || !isValidEmail(email)) {
    return getErrorRedirect(
      redirectTo,
      'Invalid email',
      'Please enter a valid email address'
    );
  }

  if (!password) {
    return getErrorRedirect(
      redirectTo,
      'Invalid password',
      'Please enter a password'
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return getErrorRedirect(
      redirectTo,
      'Invalid login credentials',
      'Please check your email and password'
    );
  }

  return redirect(redirectTo || '/');
}

export async function signUp(formData: FormData) {
  const authTypes = await getAuthTypes();
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  const redirectTo = String(formData.get('redirectTo') || '').trim();

  const supabase = await createClient();

  if (!email || !isValidEmail(email)) {
    return getErrorRedirect(
      redirectTo,
      'Invalid email',
      'Please enter a valid email address'
    );
  }

  if (!password) {
    return getErrorRedirect(
      redirectTo,
      'Invalid password',
      'Please enter a password'
    );
  }

  if (authTypes?.passwordless) {
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getURL()}/auth/callback`,
    },
  });

  if (error) {
    return getErrorRedirect(
      redirectTo,
      'Error signing up',
      error.message
    );
  }

  return getStatusRedirect(
    redirectTo,
    'Account created',
    'Please check your email for a confirmation link'
  );
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
