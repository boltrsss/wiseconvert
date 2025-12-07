// lib/errorMessages.ts

export const errorMessages = {
  unsupportedFormat: {
    en: "This file format is not supported. Please convert to PNG or JPG instead.",
  
  },
  conversionFailed: {
    en: "Conversion failed. Please try again.",

  },
  uploadFailed: {
    en: "Upload failed. Please check your connection and try again.",
 
  },
  networkError: {
    en: "Network error. Please refresh the page and try again.",
   
  },
} as const;

export type ErrorMessageKey = keyof typeof errorMessages;

export function detectLang(): "en" {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  return lang.includes("zh") ? "zh" : "en";
}
