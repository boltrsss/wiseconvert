// data/tools.ts

export interface ToolDefinition {
  slug: string;          // 網址，如 jpg-to-png
  input: string;         // 輸入格式 JPG
  output: string;        // 輸出格式 PNG
  title: string;         // SEO + H1
  description: string;   // SEO meta description
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
  }
];