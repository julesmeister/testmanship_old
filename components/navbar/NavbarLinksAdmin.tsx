'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { OpenContext, UserContext, UserDetailsContext } from '@/contexts/layout';
import { useTheme } from 'next-themes';
import React, { useContext, useEffect, useState } from 'react';
import { FiAlignJustify } from 'react-icons/fi';
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineInformationCircle,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import LanguageSelector from '@/components/language/LanguageSelector';
import { useSignOut } from '@/hooks/useSignOut';

export default function HeaderLinks(props: { [x: string]: any }) {
  const { open, setOpen } = useContext(OpenContext);
  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const signOut = useSignOut();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onOpen = () => {
    setOpen(!open);
  };

  return (
    <div className="relative flex min-w-max max-w-max flex-grow items-center justify-around gap-1 rounded-lg md:px-2 md:py-2 md:pl-3 xl:gap-2">
      <div className="flex items-center gap-2">
        <LanguageSelector 
          userId={user?.id}
          className="w-[180px] h-9 md:h-10"
          forceDialog={!userDetails?.target_language_id}
          initialLanguageId={userDetails?.target_language_id}
        />
        <Button
          variant="outline"
          className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-zinc-950 dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10 xl:hidden"
          onClick={onOpen}
        >
          <FiAlignJustify className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-zinc-950 dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        {mounted ? (
          theme === 'light' ? (
            <HiOutlineMoon className="h-4 w-4 stroke-2" />
          ) : (
            <HiOutlineSun className="h-4 w-4 stroke-2" />
          )
        ) : null}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-zinc-200 p-0 text-xl text-zinc-950 hover:bg-accent hover:text-accent-foreground dark:border-zinc-800 dark:text-white md:h-10 md:w-10"
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
              <AvatarFallback className="rounded-full bg-primary text-primary-foreground font-medium">
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[14rem] max-w-[20rem] w-auto">
          <div className="flex items-center gap-3 border-b border-border/40 p-4">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex flex-col">
            <Button
              variant="ghost"
              className="flex w-full items-center justify-start gap-2 hover:text-foreground dark:hover:text-foreground"
              onClick={() => window.open('https://docs.codeium.com/cascade/cascade-overview', '_blank')}
            >
              <HiOutlineInformationCircle className="h-4 w-4" />
              <span>Documentation</span>
            </Button>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-start gap-2 hover:text-foreground dark:hover:text-foreground"
              onClick={signOut}
            >
              <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
