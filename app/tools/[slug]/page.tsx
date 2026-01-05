// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import ToolPageClient from "./ToolPageClient";
import { TOOLS, type ToolDefinition } from "@/lib/toolsConfig";

export const runtime = "edge";

// canonical 永遠指向正式站，避免 preview/staging duplicate
const PROD_SITE_URL = "https://www.wiseconverthub.com";

function prettyFormats(arr: string[] | undefined) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return arr
    .filter(Boolean)
    .slice(0, 3)
    .map((f) => String(f).toUpperCase())
    .join(", ");
}

function getToolFromConfig(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  // ✅ 不再 fetch 後端（避免 edge 500 → error page → noindex）
  const tool = getToolFromConfig(slug);

  // ✅ C-4 robots（存在的 tool 才 index）
  const robots: Metadata["robots"] = tool
    ? { index: true, follow: true }
    : { index: false, follow: false };

  if (!tool) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "Tool Not Found | WiseConvertHub",
      description: "This tool page does not exist.",
      alternates: { canonical: canonicalUrl },
      robots,
    };
  }

  // ✅ 先用英文當 SSR 預設（你原本 SEO client 會依語言顯示內容層）
  const seoTitle = tool.seoTitle?.en ?? tool.title?.en ?? tool.slug;
  const seoDescription =
    tool.seoDescription?.en ??
    tool.shortDescription?.en ??
    "Convert files online with WiseConvertHub — fast, simple, and secure.";

  const inFmt = prettyFormats(tool.inputFormats);
  const outFmt = prettyFormats(tool.outputFormats);

  const formatHint =
    inFmt && outFmt
      ? ` Convert ${inFmt} to ${outFmt}.`
      : inFmt
      ? ` Supports ${inFmt}.`
      : "";

  return {
    metadataBase: new URL(PROD_SITE_URL),
    title: `${seoTitle} | WiseConvertHub`,
    description: `${seoDescription}${formatHint}`.trim(),
    alternates: { canonical: canonicalUrl },
    robots,
  };
}

export default function Page() {
  return <ToolPageClient />;
}
