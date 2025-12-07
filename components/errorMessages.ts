// lib/errorMessages.ts

export const detectLang = (): "en" | "zh" => {
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.toLowerCase();
    if (lang.includes("zh")) return "zh";
  }
  return "en";
};

export const errorMessages = {
  unsupportedFormat: {
    en: "This file format is not supported for conversion. Please try PNG or JPG.",
    zh: "目前不支援此檔案格式轉檔，請改用 PNG 或 JPG。",
  },
  uploadFailed: {
    en: "Upload failed. Please try again.",
    zh: "上傳失敗，請再試一次。",
  },
  conversionFailed: {
    en: "Conversion failed. Please try again.",
    zh: "轉檔失敗，請再試一次。
