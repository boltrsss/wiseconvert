// lib/tools.ts

const LANGS = ["en", "zh"] as const;
export type LangCode = (typeof LANGS)[number];

export type ToolMeta = {
  slug: string;
  // 工具標題（多語系）
  title: Record<LangCode, string>;
  // 工具副標 / 說明（多語系）
  desc: Record<LangCode, string>;
  // FileUpload 上方說明用：輸入格式 label（多語系）
  inputLabel?: Record<LangCode, string>;
  // 給 FileUpload 的 inputFormat / outputFormat（純字串）
  inputFormat?: string;
  outputFormat?: string;
};

// 先放幾個 demo 工具，之後可以再慢慢加
const TOOL_LIST: ToolMeta[] = [
  {
    slug: "image-to-jpg",
    title: {
      en: "Convert Image to JPG",
      zh: "圖片轉 JPG",
    },
    desc: {
      en: "Easily convert PNG, WEBP, HEIC and more into JPG format.",
      zh: "輕鬆將 PNG、WEBP、HEIC 等圖片轉成 JPG 格式。",
    },
    inputLabel: {
      en: "Image files (PNG, WEBP, HEIC…)",
      zh: "圖片檔（PNG、WEBP、HEIC…）",
    },
    inputFormat: "IMAGE",
    outputFormat: "jpg",
  },
  {
    slug: "jpg-to-png",
    title: {
      en: "JPG to PNG Converter",
      zh: "JPG 轉 PNG",
    },
    desc: {
      en: "Convert your JPG photos into transparent-ready PNG files.",
      zh: "將 JPG 照片轉成可支援透明背景的 PNG 檔。",
    },
    inputLabel: {
      en: "JPG images",
      zh: "JPG 圖片",
    },
    inputFormat: "JPG",
    outputFormat: "png",
  },
];

const TOOL_MAP: Record<string, ToolMeta> = TOOL_LIST.reduce(
  (acc, tool) => {
    acc[tool.slug] = tool;
    return acc;
  },
  {} as Record<string, ToolMeta>
);

export function getToolMeta(slug: string): ToolMeta | null {
  return TOOL_MAP[slug] ?? null;
}

// 之後如果要做工具列表頁可以用這個
export function getAllTools(): ToolMeta[] {
  return TOOL_LIST;
}