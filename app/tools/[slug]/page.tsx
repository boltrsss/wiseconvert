// app/tools/[slug]/page.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const runtime = "edge";

/**
 * ❗關鍵修正
 * ToolPageClient 一定要 client-only
 * 否則 Cloudflare Edge 會在 SSR 時 500
 */
const ToolPageClient = dynamic(() => import("./ToolPageClient"), {
  ssr: false,
});

/**
 * ⚠️ SEO metadata 只在 server 端處理
 * ⚠️ 不 fetch、不用 window、不碰 ToolPageClient
 * ⚠️ 保證 Edge 穩定
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;

  const titleMap: Record<string, string> = {
    "pdf-crop": "Crop PDF | WiseConvertHub",
    "pdf-split": "Split PDF | WiseConvertHub",
    "pdf-merge": "Merge PDF | WiseConvertHub",
    "pdf-rotate": "Rotate PDF | WiseConvertHub",
  };

  const descMap: Record<string, string> = {
    "pdf-crop":
      "Crop pages by margins (manual) or by selecting an area (drag). Convert PDF to PDF.",
    "pdf-split":
      "Split a PDF into separate pages or page ranges online for free.",
    "pdf-merge":
      "Merge multiple PDF files into one document quickly and securely.",
    "pdf-rotate":
      "Rotate PDF pages online to the correct orientation.",
  };

  const title = titleMap[slug] ?? "Online File Converter | WiseConvertHub";
  const description =
    descMap[slug] ??
    "Convert files online with WiseConvertHub — fast, simple, and secure.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.wiseconverthub.com/tools/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * ❗Page 本體只 render client component
 * ❗不傳 props、不做判斷
 */
export default function Page() {
  return <ToolPageClient />;
}
