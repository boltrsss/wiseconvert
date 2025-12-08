// /context/LanguageContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loadLocale } from "@/lib/i18n";

export type Language = "en" | "zh";

type Messages = Record<string, string>;

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await loadLocale(lang);
        if (!cancelled) {
          setMessages(data as Messages);
        }
      } catch (err) {
        console.error("[i18n] loadLocale error", err);
        if (!cancelled) {
          setMessages({});
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const t = (key: string, fallback?: string) =>
    messages[key] ?? fallback ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ✅ 正式 hook 名稱
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

// ✅ 舊程式有用到的別名（useLang）
export const useLang = useLanguage;

// ✅ 如果你之後想用這個名字也可以
export const useLanguageContext = useLanguage;
