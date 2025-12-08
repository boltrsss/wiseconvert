'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { detectLang, getDictionary, Lang } from '@/lib/i18n';

type LanguageContextValue = {
  lang: Lang;
  t: (path: string) => string;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // load initial lang (localStorage > browser detect)
  useEffect(() => {
    const stored =
      typeof window !== 'undefined'
        ? (localStorage.getItem('wise_lang') as Lang | null)
        : null;

    setLangState(stored || detectLang());
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wise_lang', newLang);
    }
  };

  const dict = getDictionary(lang);

  // reading nested keys: t("upload.status_done")
  const t = (path: string): string => {
    return (
      path.split('.').reduce<any>((acc, key) => {
        return acc?.[key];
      }, dict) ?? path
    );
  };

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}