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

  // ✅ Canonical（統一唯一版本）
  const canonical = `https://www.wiseconverthub.com/tools/${slug}`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/tools/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        title: "WiseConvert Tool",
        description:
          "Convert files online with WiseConvert — fast, simple, and secure.",
        alternates: {
          canonical,
        },
      };
    }

    const tool = (await res.json()) as ToolSchema;

    const toolName = tool.name || slug;
    const inFmt = prettyFormats(tool.input_formats);
    const outFmt = prettyFormats(tool.output_formats);

    const fmtHint = inFmt && outFmt ? `${inFmt} → ${outFmt}` : "";
    const title = fmtHint
      ? `${toolName} (${fmtHint}) | WiseConvert`
      : `${toolName} | WiseConvert`;

    const baseDesc =
      (tool.description || "").trim() ||
      "Convert files online with WiseConvert — fast, simple, and secure.";

    const description =
      fmtHint && baseDesc.length < 140
        ? `${baseDesc} Supported formats: ${fmtHint}.`
        : baseDesc;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
    };
  } catch {
    return {
      title: "WiseConvert Tool",
      description:
        "Convert files online with WiseConvert — fast, simple, and secure.",
      alternates: {
        canonical,
      },
    };
  }
}

export default function Page() {
  return <ToolPageClient />;
}
