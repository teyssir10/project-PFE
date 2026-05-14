import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'en',
});

// ✅ Le middleware gère UNIQUEMENT les locales
// La protection admin est gérée côté client par AuthGuard et AdminRedirect
async function proxy(req: NextRequest) {
  return intlMiddleware(req);
}

export default proxy;

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};