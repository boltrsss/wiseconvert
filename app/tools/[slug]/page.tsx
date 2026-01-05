// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const runtime = "edge";

// ✅ 超大 UI 一律 client-only，避免 Edge SSR 500
const ToolPageClient = dynamic(() => import("./ToolPageClient"), {
  ssr: false,
});

const PROD_SITE_URL = "https://www.wiseconverthub.com";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

type ToolSchema = {
  slug: string;
  name: string;
  description: string;
  input_formats: string[];
  output_formats?: string[];
};

function prettyFormats(arr: string[] | undefined) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return arr
    .filter(Boolean)
    .slice(0, 3)
    .map((f) => String(f).toUpperCase())
    .join(", ");
}

function isNonProdEnvironment(): boolean {
  // ⚠️ 這個版本只用「最穩」的判斷，避免誤判 production 為 preview
  const nodeEnv = process.env.NODE_ENV;
  const cfBranch = process.env.CF_PAGES_BRANCH;

  if (nodeEnv !== "production") return true;

  // 沒 branch 就當 prod（避免誤判 noindex）
  if (!cfBranch) return false;

  return !["main", "production"].includes(cfBranch);
}

async function fetchToolSchema(slug: string): Promise<ToolSchema | null> {
  try {
    // ✅ 注意：ToolPageClient 用的是 /api/tools/:slug
    const res = await fetch(`${API_BASE_URL}/api/tools/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as ToolSchema;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  const nonProd = isNonProdEnvironment();

  // ✅ non-prod 一律 noindex（避免 preview duplicate）
  if (nonProd) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "WiseConvertHub Tools",
      description: "Tools preview environment.",
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: false },
    };
  }

  // ✅ prod：嘗試拿 schema 判斷是否存在
  const tool = await fetchToolSchema(slug);

  // ✅ 不存在：noindex,nofollow（但頁面仍可開，避免全站 404）
  if (!tool) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "Tool Not Found | WiseConvertHub",
      description: "This tool page does not exist.",
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: false },
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
    robots: { index: true, follow: true },
  };
}

export default function Page() {
  return <ToolPageClient />;
}
