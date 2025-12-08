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

// 👇 讓 JSON 可以是巢狀結構
type Messages = Record<string, any>;

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
          // 👇 這裡就不會再被 TS 嫌棄
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

  // 👇 支援 "navbar.convert" 這種 key
  const t = (key: string, fallback?: string) => {
    const parts = key.split(".");
    let cur: any = messages;

    for (const p of parts) {
      if (cur == null || typeof cur !== "object") {
        return fallback ?? key;
      }
      cur = cur[p];
    }

    if (typeof cur === "string") return cur;
    return fallback ?? key;
  };

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

// ✅ 若之後想用更語意化的名字也可以
export const useLanguageContext = useLanguage;
