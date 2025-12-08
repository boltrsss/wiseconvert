// /lib/i18n.ts
export type Language = "en" | "zh";

export async function loadLocale(lang: Language) {
  switch (lang) {
    case "zh":
      return (await import("@/locales/zh/common.json")).default;
    case "en":
    default:
      return (await import("@/locales/en/common.json")).default;
  }
}
