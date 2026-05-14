import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'en',
});

// ✅ Next.js 16 : fichier proxy.ts avec export default
export default function proxy(req: NextRequest) {
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};