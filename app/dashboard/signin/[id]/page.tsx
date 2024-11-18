import DefaultAuth from '@/components/auth';
import AuthUI from '@/components/auth/AuthUI';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/auth-helpers/settings';

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SignIn(props: PageProps) {
  // Await and destructure params
  const params = await Promise.resolve(props.params);
  const id = params.id;
  
  const searchParamsData = await Promise.resolve(props.searchParams);
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Check if the id is valid
  if (viewTypes.includes(id)) {
    viewProp = id;
  } else {
    const cookieStore = await cookies();
    const preferredSignInView = cookieStore.get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/dashboard/signin/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect('/dashboard/main');
  } else if (!user && viewProp === 'update_password') {
    return redirect('/dashboard/signin');
  }

  // Parse the disable_button param safely
  const disableButton = searchParamsData.disable_button === 'true';

  return (
    <DefaultAuth viewProp={viewProp}>
      <div>
        <AuthUI
          viewProp={viewProp}
          user={user}
          allowPassword={allowPassword}
          allowEmail={allowEmail}
          redirectMethod={redirectMethod}
          disableButton={disableButton}
          allowOauth={allowOauth}
        />
      </div>
    </DefaultAuth>
  );
}
