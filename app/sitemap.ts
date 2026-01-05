// app/sitemap.ts
import type { MetadataRoute } from "next";

const PROD_SITE_URL = "https://www.wiseconverthub.com";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

type ToolItem = {
  slug: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 你目前工具 schema 是從 /api/tools/:slug 拿
  // 這裡列表端點優先嘗試 /api/tools（若你的後端是 /tools 就自動 fallback）
  const endpoints = [`${API_BASE_URL}/api/tools`, `${API_BASE_URL}/tools`];

  let tools: ToolItem[] = [];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.json();

      // 兼容：後端可能回 array 或 { tools: [] }
      const list = Array.isArray(data) ? data : Array.isArray(data?.tools) ? data.tools : [];
      tools = (list || []).filter((t: any) => t?.slug).map((t: any) => ({ slug: String(t.slug) }));
      if (tools.length > 0) break;
    } catch {
      // try next endpoint
    }
  }

  const now = new Date();

  // 靜態頁（可自行增減）
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${PROD_SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${PROD_SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const toolUrls: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${PROD_SITE_URL}/tools/${encodeURIComponent(t.slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticUrls, ...toolUrls];
}
