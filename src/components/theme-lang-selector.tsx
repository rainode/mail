"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Locale, locales } from "@/i18n/routing";

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function ThemeLangSelector() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const currentTheme = theme ?? "system";

  const search = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `?${qs}` : "";
  }, [searchParams]);

  const changeLocale = (nextLocale: string) => {
    if (!isLocale(nextLocale)) return;
    const re = new RegExp(`^/${locale}(?=/|$)`);
    const nextPath = pathname.replace(re, `/${nextLocale}`);
    router.replace(`${nextPath}${search}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background/80 p-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="sr-only">{t("language")}</span>
        <Select value={locale} onValueChange={changeLocale}>
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder={t("language")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("languageEnglish")}</SelectItem>
            <SelectItem value="ja">{t("languageJapanese")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="sr-only">{t("theme")}</span>
        <Select value={currentTheme} onValueChange={(v) => setTheme(v)}>
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder={t("theme")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">{t("themeSystem")}</SelectItem>
            <SelectItem value="light">{t("themeLight")}</SelectItem>
            <SelectItem value="dark">{t("themeDark")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
