"use client";

import { create } from "zustand";
import type { Lang } from "@/lib/i18n";

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  lang: (typeof window !== "undefined"
    ? (localStorage.getItem("madrasa-lang") as Lang) ?? "en"
    : "en") as Lang,
  setLang: (lang: Lang) => {
    if (typeof window !== "undefined") localStorage.setItem("madrasa-lang", lang);
    set({ lang });
  },
  toggleLang: () =>
    set((state) => {
      const next: Lang = state.lang === "en" ? "ml" : "en";
      if (typeof window !== "undefined") localStorage.setItem("madrasa-lang", next);
      return { lang: next };
    }),
}));
