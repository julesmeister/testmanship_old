'use client';

import { Button } from '@/components/ui/button';
import SidebarImage from '@/public/SidebarBadge.png';
import Image from 'next/image';

export default function SidebarDocs() {
  return (
    <div className="relative flex flex-col items-center rounded-lg border border-zinc-200 px-3 py-4 dark:border-white/10">
      <div className="flex h-full w-full flex-col items-center justify-between rounded-[20px] bg-zinc-950 pb-4 pt-6 text-white dark:bg-white dark:!text-zinc-950">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center justify-center">
            <Image width={40} height={40} src={SidebarImage} alt="" />
            <h4 className="mt-3 text-center text-2xl font-bold">Testmanship PRO!</h4>
          </div>
          <p className="mb-3 mt-2 px-4 text-center text-sm font-medium">
            Unlock advanced writing features and unlimited AI feedback with Testmanship PRO
          </p>
        </div>
        <a
          target="_blank"
          href="https://horizon-ui.com/boilerplate-shadcn#pricing"
        >
          <Button className="mt-auto flex h-full w-[200px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium">
            Get started with PRO
          </Button>
        </a>
      </div>
    </div>
  );
}
