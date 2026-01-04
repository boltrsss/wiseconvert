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

  // ✅ 不再依賴 CF_PAGES_ENVIRONMENT / VERCEL_ENV
  // ✅ 只用 Host 判斷：正式網域才 index
  const h = headers();
  const reqHost = (h.get("x-forwarded-host") || h.get("host") || "").toLowerCase();
  const isProdHost =
    reqHost === "www.wiseconverthub.com" || reqHost === "wiseconverthub.com";
  const nonProd = !isProdHost;

  let tool: ToolSchema | null = null;

  try {
    const res = await fetch(
      `${API_BASE_URL}/tools/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      tool = (await res.json()) as ToolSchema;
    }
  } catch {
    tool = null;
  }

  // ✅ Robots：非正式 host 一律 noindex；正式 host：存在 tool 才 index
  const robots: Metadata["robots"] = nonProd
    ? { index: false, follow: false }
    : tool
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
