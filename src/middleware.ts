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
  if (
    request.nextUrl.pathname.includes('/sign-in') ||
    request.nextUrl.pathname.includes('/sign-up') ||
    isProtectedRoute(request)
  ) {
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

      return intlMiddleware(req);
    })(request, event);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
};

// Force Node.js runtime for Clerk middleware
export const runtime = 'nodejs';
