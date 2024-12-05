'use client';

/* eslint-disable */
import NavLink from '@/components/link/navlink';
import { IRoute } from '@/types/types';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useCallback } from 'react';

interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

export function SidebarLinks(props: SidebarLinksProps) {
  const pathname = usePathname();

  const { routes } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname]
  );


  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, key) => {
      if (route.disabled) {
        return (
          <div
            key={key}
            className={`flex w-full max-w-full cursor-not-allowed items-center rounded-lg py-3 pl-8 font-medium`}
          >
            <span className="flex items-center text-zinc-950 opacity-30 dark:text-white">
              {route.icon}
            </span>
            <span className="ml-3 text-sm text-zinc-950 opacity-30 dark:text-white">
              {route.name}
            </span>
          </div>
        );
      } else {
        return (
          <div key={key}>
            <div
              className={`flex w-full max-w-full items-center justify-between rounded-lg py-3 pl-8 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                activeRoute(route.path.toLowerCase())
                  ? 'bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950'
                  : 'font-medium text-zinc-950 dark:text-zinc-400'
              }`}
            >
              <NavLink
                href={route.layout ? route.layout + route.path : route.path}
                key={key}
                className="w-full"
              >
                <span className="flex items-center">
                  <span
                    className={`mr-3 ${
                      activeRoute(route.path.toLowerCase())
                        ? 'font-semibold text-white dark:text-zinc-950'
                        : 'text-zinc-950 dark:text-white hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {route.icon}
                  </span>
                  <span
                    className={`text-sm ${
                      activeRoute(route.path.toLowerCase())
                        ? 'font-semibold text-white dark:text-zinc-950'
                        : 'font-medium text-zinc-950 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {route.name}
                  </span>
                </span>
              </NavLink>
            </div>
          </div>
        );
      }
    });
  };
  //  BRAND
  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;
