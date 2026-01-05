// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { TOOLS, type ToolDefinition } from "@/lib/toolsConfig";

export const runtime = "edge";

// ✅ 關鍵：避免 Edge SSR 評估 ToolPageClient 造成 500
const ToolPageClient = dynamic(() => import("./ToolPageClient"), {
  ssr: false,
});

const PROD_SITE_URL = "https://www.wiseconverthub.com";

function isProd(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const cfBranch = process.env.CF_PAGES_BRANCH;

  if (nodeEnv !== "production") return false;
  if (!cfBranch) return true; // 避免誤判
  return ["main", "production"].includes(cfBranch);
}

function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/**
 * ✅ C-4：存在 slug 才生成（白名單）
 * 不在 TOOLS 的 slug，會直接 404（自然 noindex）
 */
export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  const prod = isProd();
  const tool = getTool(slug);

  // ✅ 非 prod：全部 noindex（避免 preview duplicate）
  if (!prod) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "WiseConvertHub Tools",
      description:
        "Convert files online with WiseConvertHub — fast, simple, and secure.",
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: false },
    };
  }

  // ✅ prod：slug 不存在 → 交給 404（後面 Page() 會 notFound）
  // metadata 這邊也回 noindex 保險（即使被某些情況渲染到也不索引）
  if (!tool) {
    return {
      metadataBase: new URL(PROD_SITE_URL),
      title: "Tool Not Found | WiseConvertHub",
      description: "This tool page does not exist.",
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: false },
    };
  }

  const title =
    tool.seoTitle?.en || tool.title?.en || `${tool.slug} | WiseConvertHub`;
  const description =
    tool.seoDescription?.en ||
    tool.shortDescription?.en ||
    "Convert files online with WiseConvertHub — fast, simple, and secure.";

  return {
    metadataBase: new URL(PROD_SITE_URL),
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  // ✅ prod：不在白名單的 slug 直接 404（自然 noindex）
  // non-prod 也可以 404 或保留渲染；這裡採「一致 404」更乾淨
  const tool = getTool(params.slug);
  if (!tool) notFound();

  return <ToolPageClient />;
}
