"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/store/localeStore";

/** Keeps <html lang>/<html dir> in sync with the persisted locale choice.
 *  Runs as a DOM side-effect only (never changes what React renders), so it
 *  cannot cause a hydration mismatch. */
export function LocaleHtmlSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
