// components/tool-page/ToolSidebar.tsx
import React from "react";
import AdSlot from "@/components/ads/AdSlot";
import Link from "next/link";

type ToolSidebarProps = {
  toolName?: string;
  category?: string;
  inputFormats?: string[];
  outputFormats?: string[];
};

type RelatedItem = { label: string; href: string };

function getRelatedTools(category?: string): RelatedItem[] {
  const cat = (category || "").toLowerCase();

  if (cat === "pdf") {
    return [
      { label: "PDF Merge", href: "/tools/pdf-merge" },
      { label: "PDF Split", href: "/tools/pdf-split" },
      { label: "PDF Rotate", href: "/tools/pdf-rotate" },
      { label: "PDF Crop", href: "/tools/pdf-crop" },
      { label: "PDF Protect", href: "/tools/pdf-protect" },
    ];
  }

  if (cat === "image") {
    return [
      { label: "Image Converter", href: "/tools/image-convert" },
      { label: "PDF to JPG", href: "/tools/pdf-to-jpg" },
    ];
  }

  if (cat === "video") {
    return [{ label: "Video Converter", href: "/tools/video-convert" }];
  }

  return [
    { label: "PDF Merge", href: "/tools/pdf-merge" },
    { label: "Image Converter", href: "/tools/image-convert" },
    { label: "Video Converter", href: "/tools/video-convert" },
  ];
}

export default function ToolSidebar({
  toolName,
  category,
  inputFormats = [],
  outputFormats = [],
}: ToolSidebarProps) {
  const related = getRelatedTools(category);

  return (
    <div className="space-y-6">
      {/* Tool Info */}
      <section className="border rounded-xl p-4 bg-white space-y-2">
        <h3 className="font-semibold text-base">Tool Info</h3>

        {toolName && (
          <div className="text-sm">
            <span className="text-slate-500">Name:</span>{" "}
            <span className="font-medium">{toolName}</span>
          </div>
        )}

        {category && (
          <div className="text-sm">
            <span className="text-slate-500">Category:</span>{" "}
            <span className="capitalize">{category}</span>
          </div>
        )}

        {inputFormats.length > 0 && (
          <div className="text-sm">
            <div className="text-slate-500 mb-1">Input formats</div>
            <div className="flex flex-wrap gap-1">
              {inputFormats.map((f) => (
                <span key={f} className="px-2 py-0.5 text-xs rounded bg-slate-100">
                  {String(f).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {outputFormats.length > 0 && (
          <div className="text-sm">
            <div className="text-slate-500 mb-1">Output formats</div>
            <div className="flex flex-wrap gap-1">
              {outputFormats.map((f) => (
                <span key={f} className="px-2 py-0.5 text-xs rounded bg-slate-100">
                  {String(f).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Quick Tips */}
      <section className="border rounded-xl p-4 bg-white space-y-2">
        <h3 className="font-semibold text-base">Quick Tips</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
          <li>Your files are processed securely.</li>
          <li>No installation required.</li>
          <li>Works directly in your browser.</li>
        </ul>
      </section>

      {/* Related Tools */}
      <section className="border rounded-xl p-4 bg-white space-y-2">
        <h3 className="font-semibold text-base">Related Tools</h3>
        <ul className="text-sm space-y-1">
          {related.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-blue-600 hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Sidebar Ad（最後） */}
      <section>
        <AdSlot variant="sidebar" />
      </section>
    </div>
  );
}
