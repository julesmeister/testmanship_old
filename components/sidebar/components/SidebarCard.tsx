'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import SidebarImage from '@/public/SidebarBadge.png';
import { HiChevronLeft } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

export default function SidebarDocs() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <HiChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      </button>
      <div className={cn(
        "relative flex flex-col items-center rounded-lg border border-zinc-200 px-3 py-4 dark:border-white/10 transition-all duration-300",
        isCollapsed ? "w-[60px] overflow-hidden" : "w-full"
      )}>
        <div className={cn(
          "flex h-full w-full flex-col items-center justify-between rounded-[20px] bg-zinc-950 pb-4 pt-6 text-white dark:bg-white dark:!text-zinc-950",
          isCollapsed && "px-2"
        )}>
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center justify-center">
              <Image width={40} height={40} src={SidebarImage} alt="" className="min-w-[40px]" />
              {!isCollapsed && (
                <>
            <h4 className="mt-3 text-center text-2xl font-bold">Testmanship PRO!</h4>
          <p className="mb-3 mt-2 px-4 text-center text-sm font-medium">
            Unlock advanced writing features and unlimited AI feedback with Testmanship PRO
          </p>
                </>
              )}
            </div>
        </div>
          {!isCollapsed && (
        <a
          target="_blank"
          href="https://horizon-ui.com/boilerplate-shadcn#pricing"
        >
          <Button className="mt-auto flex h-full w-[200px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium">
            Get started with PRO
          </Button>
        </a>
          )}
        </div>
      </div>
    </div>
  );
}
