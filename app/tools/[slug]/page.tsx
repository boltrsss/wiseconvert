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

// 你的正式站基準（canonical 一律指向這裡，避免 preview domain 造成 duplicate）
const PROD_SITE_URL = "https://www.wiseconverthub.com";

function prettyFormats(arr: string[] | undefined) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return arr
    .filter(Boolean)
    .slice(0, 3)
    .map((f) => String(f).toUpperCase())
    .join(", ");
}

// 用環境變數判斷是否「非正式環境」：Cloudflare Pages / Vercel / 一般 preview
function isNonProdEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV; // production / development
  const vercelEnv = process.env.VERCEL_ENV; // production / preview / development
  const cfBranch = process.env.CF_PAGES_BRANCH; // main / production / preview branches
  const cfUrl = process.env.CF_PAGES_URL; // preview url
  const nextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL; // 你若有設定，可用來判斷

  // 明確：dev 一律 non-prod
  if (nodeEnv !== "production") return true;

  // Vercel preview/dev 一律 non-prod
  if (vercelEnv && vercelEnv !== "production") return true;

  // Cloudflare Pages：如果有 preview URL 或 branch 不是 production/main，也視為 non-prod（保守）
  // 你若使用 main 當 production，可把條件改成只允許 main/production
  if (cfUrl && !cfUrl.includes("wiseconverthub.com")) return true;
  if (cfBranch && !["main", "production"].includes(cfBranch)) return true;

  // 若你有設定 NEXT_PUBLIC_SITE_URL 且不是正式網域，也視為 non-prod
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

  // canonical 一律指向正式網域，避免 preview/staging 收錄與重複內容
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  // 非正式環境：全部 noindex（避免 staging/preview 被收錄）
  const nonProd = isNonProdEnvironment();

  let tool: ToolSchema | null = null;

  try {
    const res = await fetch(
      `${API_BASE_URL}/tools/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );

    if (res.ok) {
      tool = (await res.json()) as ToolSchema;
    }
  } catch {
    tool = null;
  }

  // Robots 規則：
  // - 非正式環境：一律 noindex
  // - 正式環境：存在 tool => index；不存在 tool => noindex
  const robots: Metadata["robots"] = nonProd
    ? { index: false, follow: false }
    : tool
    ? { index: true, follow: true }
    : { index: false, follow: false };

  // tool 不存在：給安全 fallback metadata（不動 UI，不 throw）
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
    inFmt && outFmt ? ` Convert ${inFmt} to ${outFmt}.` : inFmt ? ` Supports ${inFmt}.` : "";

  return {
    metadataBase: new URL(PROD_SITE_URL),
    title: `${tool.name} | WiseConvertHub`,
    description: `${tool.description ?? ""}${formatHint}`.trim(),
    alternates: { canonical: canonicalUrl },
    robots,
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ToolPageClient slug={params.slug} />;
}
