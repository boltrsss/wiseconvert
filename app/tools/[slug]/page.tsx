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

function isNonProdEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV; // production / development
  const vercelEnv = process.env.VERCEL_ENV; // production / preview / development
  const cfBranch = process.env.CF_PAGES_BRANCH; // main / production / others
  const cfUrl = process.env.CF_PAGES_URL; // preview url
  const nextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // dev 一律 non-prod
  if (nodeEnv !== "production") return true;

  // Vercel preview/dev
  if (vercelEnv && vercelEnv !== "production") return true;

  // Cloudflare Pages preview（保守：不是正式網域就 non-prod）
  if (cfUrl && !cfUrl.includes("wiseconverthub.com")) return true;

  // 若你的 production 分支是 main/production，其他分支視為 non-prod
  if (cfBranch && !["main", "production"].includes(cfBranch)) return true;

  // 你若有設定 NEXT_PUBLIC_SITE_URL 且不是正式網域，也視為 non-prod
  if (
    nextPublicSiteUrl &&
    ![PROD_SITE_URL, "https://wiseconverthub.com"].includes(nextPublicSiteUrl)
  ) {
    return true;
  }

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
  // ✅ 不傳 slug，避免 TS error；ToolPageClient 自己用 useParams() 取 slug
  return <ToolPageClient />;
}
