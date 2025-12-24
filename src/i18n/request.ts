import { getRequestConfig } from "next-intl/server";
import { defaultLocale, type Locale, locales } from "@/i18n/routing";

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const localeFromRequest = await requestLocale;
  const locale: Locale =
    localeFromRequest && isLocale(localeFromRequest)
      ? localeFromRequest
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
