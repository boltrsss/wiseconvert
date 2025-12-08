// components/LanguageSwitcher.tsx
'use client';

import { useLang } from '@/context/LanguageContext';

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 hidden sm:inline">
        {t('navbar.language')}
      </span>
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs">
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-2 py-1 rounded-full transition ${
            lang === 'en'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
         
          {t("navbar.language_label", "Language")}
        </button>
        <button
          type="button"
          onClick={() => setLang('zh')}
          className={`px-2 py-1 rounded-full transition ${
            lang === 'zh'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('navbar.language_zh')}
        </button>
      </div>
    </div>
  );
}
