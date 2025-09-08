import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
  '/api(.*)',
]);

const isAuthRoute = (pathname: string) =>
  pathname.includes('/sign-in') || pathname.includes('/sign-up');

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const { pathname } = request.nextUrl;

  // For auth routes and protected routes, use Clerk middleware directly
  if (isAuthRoute(pathname) || isProtectedRoute(request)) {
    return clerkMiddleware()(request, event);
  }

  // For non-protected routes, use internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
