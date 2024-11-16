import { IRoute } from '@/types/types'
// NextJS Requirement
export const isWindowAvailable = () => typeof window !== 'undefined'

export const findCurrentRoute = (
  routes: IRoute[],
  pathname: string | null,
): IRoute | undefined => {
  if (!pathname) return undefined
  for (let route of routes) {
    if (route.items) {
      const found = findCurrentRoute(route.items, pathname)
      if (found) return found
    }
    if (pathname?.match(route.path) && route) {
      return route
    }
  }
}

export const getActiveRoute = (routes: IRoute[], pathname: string | null): string => {
  if (!pathname) return 'Dashboard'
  const route = findCurrentRoute(routes, pathname)
  return route?.name || 'Dashboard'
}

export const getActiveNavbar = (
  routes: IRoute[],
  pathname: string | null,
): boolean => {
  const route = findCurrentRoute(routes, pathname)
  if (route?.secondary) return route?.secondary
  else return false
}

export const getActiveNavbarText = (
  routes: IRoute[],
  pathname: string | null,
): string | boolean => {
  return getActiveRoute(routes, pathname) || false
}
