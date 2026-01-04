// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
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

/**
 * ✅ 判斷是否非正式環境（避免 staging/preview 被收錄）
 * - Cloudflare Pages：CF_PAGES_ENVIRONMENT = "production" | "preview"
 * - Vercel：VERCEL_ENV = "production" | "preview" | "development"
 * - 本機：NODE_ENV !== "production"
 *
 * ⚠️ 不使用 CF_PAGES_URL（production 也常是 *.pages.dev，會誤判全站 noindex）
 */
function isNonProdEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV; // production / development
  const vercelEnv = process.env.VERCEL_ENV; // production / preview / development
  const cfEnv = process.env.CF_PAGES_ENVIRONMENT; // production / preview
  const cfBranch = process.env.CF_PAGES_BRANCH; // main / production / others

  // dev 一律 non-prod
  if (nodeEnv !== "production") return true;

  // Vercel preview/dev
  if (vercelEnv && vercelEnv !== "production") return true;

  // ✅ Cloudflare Pages：用 CF_PAGES_ENVIRONMENT 最準
  if (cfEnv) {
    return cfEnv !== "production";
  }

  // 若沒有 cfEnv（理論上不該），保守用 branch 判斷
  if (cfBranch && !["main", "production"].includes(cfBranch)) return true;

  return false;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  const nonProd = isNonProdEnvironment();

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

  // ✅ C-4 robots（含：non-prod 一律 noindex）
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
  // ✅ 不傳 slug，ToolPageClient 自己用 useParams() 取 slug
  return <ToolPageClient />;
}
