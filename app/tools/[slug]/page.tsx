// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { TOOLS, type ToolDefinition } from "@/lib/toolsConfig";

export const runtime = "edge";

// ✅ client-only: 避免 Edge SSR 評估 ToolPageClient 造成 500
const ToolPageClient = dynamic(() => import("./ToolPageClient"), {
  ssr: false,
});

const PROD_SITE_URL = "https://www.wiseconverthub.com";

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

  // Cloudflare Pages preview（不是正式網域就 non-prod）
  if (cfUrl && !cfUrl.includes("wiseconverthub.com")) return true;

  // 你的 production 分支（通常是 main）
  if (cfBranch && !["main", "production"].includes(cfBranch)) return true;

  // 若有設定 NEXT_PUBLIC_SITE_URL 且不是正式站
  if (
    nextPublicSiteUrl &&
    ![PROD_SITE_URL, "https://wiseconverthub.com"].includes(nextPublicSiteUrl)
  ) {
    return true;
  }

  return false;
}

function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  const nonProd = isNonProdEnvironment();
  const tool = getTool(slug);

  // ✅ Robots 規則：
  // - non-prod: 一律 noindex,nofollow（避免 preview duplicate）
  // - prod + tool exists: index,follow
  // - prod + tool missing: noindex,nofollow
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

  // ✅ 先用 en 作 SSR（語言切換的內容層交給 ToolSeoClient / 內容區塊）
  const title = tool.seoTitle?.en || tool.title?.en || `${tool.slug} | WiseConvertHub`;
  const description =
    tool.seoDescription?.en ||
    tool.shortDescription?.en ||
    "Convert files online with WiseConvertHub — fast, simple, and secure.";

  return {
    metadataBase: new URL(PROD_SITE_URL),
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots,
  };
}

export default function Page() {
  return <ToolPageClient />;
}
