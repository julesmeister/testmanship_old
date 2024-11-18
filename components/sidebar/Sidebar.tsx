'use client';

import React, { PropsWithChildren, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { IRoute } from '@/types/types';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { UserContext, UserDetailsContext, OpenContext } from '@/contexts/layout';
import { createClient } from '@/utils/supabase/client';
import { HiChevronLeft, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { useSidebarStore } from '@/stores/sidebar';
import { toast } from 'sonner';

const supabase = createClient();

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

export default function Sidebar(props: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { routes } = props;
  const { isCollapsed } = useSidebarStore();
  const { open, setOpen } = useContext(OpenContext);

  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);

  const handleSignOut = async (e) => {
    e.preventDefault();
    const redirectMethod = getRedirectMethod();
    
    toast.loading('Signing out...', {
      id: 'signout',
      duration: 1000,
    });
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error('Sign out failed', {
        id: 'signout',
        description: 'Please try again.',
      });
    } else {
      toast.success('Signed out successfully', {
        id: 'signout',
      });
      
      if (redirectMethod === 'client' && router) {
        router.push('/dashboard/signin');
      } else {
        window.location.href = '/dashboard/signin';
      }
    }
  };

  return (
    <div
      className={cn(
        // Base styles
        "fixed inset-y-0 z-50 flex flex-col transition-all duration-300",
        // Mobile/tablet: use open state for visibility
        "xl:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        // Desktop: use collapsed state for width
        {
          "xl:w-[80px]": isCollapsed,
          "xl:w-[300px]": !isCollapsed,
          // Default width for mobile/tablet (always expanded)
          "w-[300px]": true
        }
      )}
    >
      <div className="flex h-full flex-col gap-2 border-r border-zinc-200 bg-white px-2 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-[60px] items-center justify-between px-2">
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed ? "w-full justify-center" : "px-2"
          )}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <span className="text-sm font-bold">T</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-tight">Testmanship</span>
                <span className="text-xs text-muted-foreground">Writing Platform</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setOpen(false)}
          >
            <HiChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 px-1">
          <div className="space-y-2 py-2">
            {routes.map((route) => (
              <Button
                key={route.name}
                variant={route.path === pathname ? "secondary" : "ghost"}
                className={cn(
                  "w-full flex items-center justify-start gap-2 dark:hover:text-current min-h-[40px]",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => router?.push(route.path)}
              >
                <span className="inline-flex shrink-0 self-center pt-1">{route.icon}</span>
                {!isCollapsed && <span className="inline-flex self-center">{route.name}</span>}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              isCollapsed && "justify-center px-2"
            )}
            onClick={handleSignOut}
          >
            <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
            {!isCollapsed && <span>Sign out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
