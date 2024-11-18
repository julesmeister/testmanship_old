'use client';

import PasswordSignIn from '@/components/auth-ui/PasswordSignIn';
import EmailSignIn from '@/components/auth-ui/EmailSignIn';
import Separator from '@/components/auth-ui/Separator';
import OauthSignIn from '@/components/auth-ui/OauthSignIn';
import ForgotPassword from '@/components/auth-ui/ForgotPassword';
import UpdatePassword from '@/components/auth-ui/UpdatePassword';
import SignUp from '@/components/auth-ui/Signup';
import { FiUser, FiLock, FiMail, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export default function AuthUI(props: any) {
  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);

  const getIcon = () => {
    switch (props.viewProp) {
      case 'signup':
        return <FiUser className="mb-4 h-8 w-8 text-emerald-500" />;
      case 'forgot_password':
        return <FiRefreshCw className="mb-4 h-8 w-8 text-emerald-500" />;
      case 'update_password':
        return <FiLock className="mb-4 h-8 w-8 text-emerald-500" />;
      case 'email_signin':
        return <FiMail className="mb-4 h-8 w-8 text-emerald-500" />;
      default:
        return <FiUser className="mb-4 h-8 w-8 text-emerald-500" />;
    }
  };

  return (
    <div className="mx-auto my-auto mb-auto mt-8 flex w-full flex-col items-center justify-center md:mt-[70px] md:max-w-full lg:max-w-[420px]">
      {getIcon()}
      <p className="text-[32px] font-bold text-zinc-950 dark:text-white">
        {props.viewProp === 'signup'
          ? 'Sign Up'
          : props.viewProp === 'forgot_password'
          ? 'Forgot Password'
          : props.viewProp === 'update_password'
          ? 'Update Password'
          : props.viewProp === 'email_signin'
          ? 'Email Sign In'
          : 'Sign In'}
      </p>
      <p className="mt-2 mb-8 text-center text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {props.viewProp === 'signup'
          ? "Join our community and unlock your potential. Let's get started!"
          : props.viewProp === 'forgot_password'
          ? "No worries! Enter your email and we'll send you a reset link"
          : props.viewProp === 'update_password'
          ? 'Please choose a secure password to protect your account'
          : props.viewProp === 'email_signin'
          ? "We'll send you a secure magic link to sign in instantly"
          : 'Welcome back! Enter your credentials to access your account'}
      </p>
      {props.viewProp !== 'update_password' &&
        props.viewProp !== 'signup' &&
        props.allowOauth && (
          <>
            <div className="mt-4 w-full space-y-4">
              <OauthSignIn />
              <Separator text="or" />
              {props.viewProp !== 'forgot_password' && (
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  onClick={() => setShowPasswordSignIn(!showPasswordSignIn)}
                >
                  {showPasswordSignIn ? (
                    <>
                      Hide password sign in
                      <FiChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show password sign in
                      <FiChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      <div className={cn("w-full transition-all duration-200", {
        "max-h-0 opacity-0 overflow-hidden": !showPasswordSignIn && props.viewProp === 'password_signin',
        "max-h-[500px] opacity-100": showPasswordSignIn || props.viewProp !== 'password_signin'
      })}>
        {props.viewProp === 'password_signin' && (
          <PasswordSignIn
            allowEmail={props.allowEmail}
            redirectMethod={props.redirectMethod}
          />
        )}
        {props.viewProp === 'email_signin' && (
          <EmailSignIn
            allowPassword={props.allowPassword}
            redirectMethod={props.redirectMethod}
            disableButton={props.disableButton}
          />
        )}
        {props.viewProp === 'forgot_password' && (
          <ForgotPassword
            allowEmail={props.allowEmail}
            redirectMethod={props.redirectMethod}
            disableButton={props.disableButton}
          />
        )}
        {props.viewProp === 'update_password' && (
          <UpdatePassword redirectMethod={props.redirectMethod} />
        )}
        {props.viewProp === 'signup' && (
          <SignUp
            allowEmail={props.allowEmail}
            redirectMethod={props.redirectMethod}
          />
        )}
      </div>
    </div>
  );
}
