'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
}

export default function NavLink({ href, children, className, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80',
        isActive
          ? 'bg-muted text-foreground'
          : 'text-foreground/60 hover:bg-muted',
        className
      )}
    >
      {children}
    </Link>
  );
}
