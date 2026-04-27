import { getRequestConfig } from 'next-intl/server';

type Locale = 'fr' | 'en' | 'ar';
const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Si la locale est undefined ou invalide, on utilise le français par défaut
  if (!locale || !['fr', 'en', 'ar'].includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});