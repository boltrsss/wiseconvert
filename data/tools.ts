// data/tools.ts

export interface ToolDefinition {
  slug: string;       // URL: /convert/[slug]
  input: string;      // 顯示用
  output: string;     // 真正輸出格式
  title: string;
  description: string;
}

export const tools: ToolDefinition[] = [
  {
    slug: "jpg-to-png",
    input: "JPG",
    output: "PNG",
    title: "JPG to PNG Converter",
    description: "Convert JPG images to PNG format fast, free, and online.",
  },
  {
    slug: "png-to-jpg",
    input: "PNG",
    output: "JPG",
    title: "PNG to JPG Converter",
    description: "Turn PNG images into JPG instantly with high quality.",
  },
  // 之後要加 500 個，就繼續在這裡加
];
