import { defineRouting } from 'next-intl/routing';

export const locales = ["en", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  // A list of all locales that aFre supported
  locales,

  // Used when no locale matches
  defaultLocale
});