// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import ToolPageClient from "./ToolPageClient";

export const runtime = "edge";

type ToolSchema = {
  slug: string;
  name: string;
  description: string;
  input_formats: string[];
  output_formats?: string[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

const PROD_SITE_URL = "https://www.wiseconverthub.com";

function prettyFormats(arr: string[] | undefined) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return arr
    .filter(Boolean)
    .slice(0, 3)
    .map((f) => String(f).toUpperCase())
    .join(", ");
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  // ✅ 用 Host 判斷是否正式網域（不依賴 CF/Vercel env）
  const h = headers();
  const reqHost = (h.get("x-forwarded-host") || h.get("host") || "").toLowerCase();
  const isProdHost =
    reqHost === "www.wiseconverthub.com" || reqHost === "wiseconverthub.com";
  const nonProd = !isProdHost;

  let tool: ToolSchema | null = null;
  let isMissingTool = false; // ✅ 只在「明確 404」時才視為不存在

  try {
    // ✅ 這裡必須跟你 ToolPageClient 一致：/api/tools/:slug
    const res = await fetch(
      `${API_BASE_URL}/api/tools/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );

    if (res.status === 404) {
      isMissingTool = true;
    } else if (res.ok) {
      tool = (await res.json()) as ToolSchema;
    } else {
      // 其他錯誤（500/timeout 等）：不要當成 tool 不存在
      isMissingTool = false;
    }
  } catch {
    // fetch 失敗：不要當成 tool 不存在
    isMissingTool = false;
  }

  // ✅ Robots 規則（最安全）
  // - 非正式網域：一律 noindex
  // - 正式網域：只有明確 404 才 noindex；其餘一律 index（避免 API 抖動害你被 noindex）
  const robots: Metadata["robots"] = nonProd
    ? { index: false, follow: false }
    : isMissingTool
    ? { index: false, follow: false }
    : { index: true, follow: true };

  // ✅ tool 不存在（明確 404）才回 not found metadata
  if (isMissingTool) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "Tool Not Found | WiseConvertHub",
      description: "This tool page does not exist.",
      alternates: { canonical: canonicalUrl },
      robots,
    };
  }

  // ✅ tool 取不到（但不是 404）：給安全 fallback（仍 index）
  if (!tool) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "WiseConvertHub Tool | WiseConvertHub",
      description: "Convert files online with WiseConvertHub — fast, simple, and secure.",
      alternates: { canonical: canonicalUrl },
      robots,
    };
  }

  const inFmt = prettyFormats(tool.input_formats);
  const outFmt = prettyFormats(tool.output_formats);
  const formatHint =
    inFmt && outFmt
      ? ` Convert ${inFmt} to ${outFmt}.`
      : inFmt
      ? ` Supports ${inFmt}.`
      : "";

  return {
    metadataBase: new URL(PROD_SITE_URL),
    title: `${tool.name} | WiseConvertHub`,
    description: `${tool.description ?? ""}${formatHint}`.trim(),
    alternates: { canonical: canonicalUrl },
    robots,
  };
}

export default function Page() {
  return <ToolPageClient />;
}
