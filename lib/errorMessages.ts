// lib/errorMessages.ts

export const errorMessages = {
  unsupportedFormat: {
    en: "This file format is not supported. Please convert to PNG or JPG instead.",
    zh: "目前不支援此檔案格式，請改用 PNG 或 JPG。",
  },
  conversionFailed: {
    en: "Conversion failed. Please try again.",
    zh: "轉檔失敗，請再試一次。",
  },
  uploadFailed: {
    en: "Upload failed. Please check your connection and try again.",
    zh: "上傳失敗，請檢查網路連線後再試一次。",
  },
  networkError: {
    en: "Network error. Please refresh the page and try again.",
    zh: "網路發生錯誤，請重新整理頁面後再試一次。",
  },
} as const;

export type ErrorMessageKey = keyof typeof errorMessages;

export function detectLang(): "en" | "zh" {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  return lang.includes("zh") ? "zh" : "en";
}
