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

// 目前只用到這兩種語系
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

  // 初始可以用瀏覽器語系，之後用者切換時就用選單的值
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

// ✅ 提供 useLanguage 給 Header / ConversionQueue / 未來元件使用
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

// 🔁 如果你之前不小心用過這個名字，也一併支援
export const useLanguageContext = useLanguage;
