'use server';

import { redirect } from 'next/navigation';

export default async function SigninRedirect() {
  redirect('/dashboard/signin');
}
