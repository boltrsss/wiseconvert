// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import ToolPageClient from "./ToolPageClient";

//export const runtime = "edge";

// ✅ 強制 SSR（避免 CF/adapter 把動態頁落到 404/error HTML，導致自動 noindex）
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  let tool: ToolSchema | null = null;
  let isMissingTool = false;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/tools/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );

    if (res.status === 404) isMissingTool = true;
    else if (res.ok) tool = (await res.json()) as ToolSchema;
  } catch {}

  const robots: Metadata["robots"] = isMissingTool
    ? { index: false, follow: false }
    : { index: true, follow: true };

  if (isMissingTool) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "Tool Not Found | WiseConvertHub",
      description: "This tool page does not exist.",
      alternates: { canonical: canonicalUrl },
      robots,
    };
  }

  if (!tool) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "WiseConvertHub Tool | WiseConvertHub",
      description:
        "Convert files online with WiseConvertHub — fast, simple, and secure.",
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
