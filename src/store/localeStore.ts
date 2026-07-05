/**
 * Locale store — toggles the platform between Arabic (RTL, native locale)
 * and English (LTR) without a page reload. Persisted to localStorage so the
 * user's choice survives a refresh. This is UI-chrome/labels only; the
 * underlying financial figures are locale-independent numbers.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "ar" | "en";

interface LocaleState {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleState>()(
    persist(
          (set, get) => ({
                  locale: "ar",
                  setLocale: (locale) => set({ locale }),
                  toggleLocale: () => set({ locale: get().locale === "ar" ? "en" : "ar" }),
          }),
      { name: "asl-burger-locale" },
        ),
  );
