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

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(request);

  // Check if this is a protected route or auth route
  if (
    request.nextUrl.pathname.includes('/sign-in') ||
    request.nextUrl.pathname.includes('/sign-up') ||
    isProtectedRoute(request)
  ) {
    // Use Clerk middleware for protected routes
    return clerkMiddleware(async (auth, req) => {
      const authObj = await auth();
      const { userId } = authObj;

      // If user is authenticated and trying to access sign-up, redirect to dashboard
      if (userId && req.nextUrl.pathname.includes('/sign-up')) {
        const locale =
          req.nextUrl.pathname.match(/(\/.*)\/sign-up/)?.at(1) ?? '';
        const dashboardUrl = new URL(`${locale}/dashboard`, req.url);
        return Response.redirect(dashboardUrl);
      }

      // If trying to access protected route without auth, redirect to sign-in
      if (!userId && isProtectedRoute(req)) {
        const locale =
          req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';
        const signInUrl = new URL(`${locale}/sign-in`, req.url);
        return Response.redirect(signInUrl);
      }

      // Return the internationalized response for protected routes
      return intlResponse;
    })(request, event);
  }

  // Return internationalized response for non-protected routes
  return intlResponse;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
