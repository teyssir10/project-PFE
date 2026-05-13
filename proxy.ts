// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'fr'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};