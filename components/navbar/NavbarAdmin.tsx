'use client';

import NavLink from '@/components/link/NavLink';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';
import AdminNavbarLinks from './NavbarLinksAdmin';

export default function AdminNavbar({ brandText }: { brandText: string }) {
  const { isCollapsed, setIsCollapsed } = useSidebarStore();

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <PanelLeft className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <div className="flex flex-col gap-1">
            <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
              <span>Pages</span>
              <span className="text-muted-foreground/60">/</span>
              <NavLink href="#" className="text-foreground hover:text-foreground/80">
                {brandText}
              </NavLink>
            </div>
          </div>
        </div>

        <AdminNavbarLinks />
      </div>
    </nav>
  );
}
