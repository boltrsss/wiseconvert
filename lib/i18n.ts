import en from '@/locales/en/common.json';
import zh from '@/locales/zh/common.json';

export type Lang = 'en' | 'zh';

const dictionary = {
  en,
  zh,
};

export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.toLowerCase();
  return lang.includes('zh') ? 'zh' : 'en';
}

export function getDictionary(lang: Lang) {
  return dictionary[lang] || dictionary.en;
}