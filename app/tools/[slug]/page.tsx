// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const runtime = "edge";

// ✅ 關鍵：讓超大 Client UI 不參與 SSR，避免 Edge 500
const ToolPageClient = dynamic(() => import("./ToolPageClient"), {
  ssr: false,
});

const PROD_SITE_URL = "https://www.wiseconverthub.com";

function isProd(): boolean {
  // Cloudflare Pages production build 通常：
  // NODE_ENV=production 且 CF_PAGES_BRANCH=main（或你設定的 production）
  const nodeEnv = process.env.NODE_ENV;
  const cfBranch = process.env.CF_PAGES_BRANCH;

  if (nodeEnv !== "production") return false;

  // 沒有 branch 也先視為 prod（避免誤判 noindex）
  if (!cfBranch) return true;

  return ["main", "production"].includes(cfBranch);
}

function titleFromSlug(slug: string) {
  const nice = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return `${nice} | WiseConvertHub`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const canonicalUrl = `${PROD_SITE_URL}/tools/${encodeURIComponent(slug)}`;

  const prod = isProd();

  // ✅ C-4 Robots（穩定版）：
  // - prod：index,follow
  // - non-prod：noindex,nofollow（避免 preview duplicate）
  const robots: Metadata["robots"] = prod
    ? { index: true, follow: true }
    : { index: false, follow: false };

  return {
    metadataBase: new URL(PROD_SITE_URL),
    title: titleFromSlug(slug),
    description:
      "Convert files online with WiseConvertHub — fast, simple, and secure.",
    alternates: { canonical: canonicalUrl },
    robots,
  };
}

export default function Page() {
  return <ToolPageClient />;
}
