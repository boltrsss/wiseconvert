// app/tools/[slug]/page.tsx

import React from "react";
import { notFound } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { AdSlot } from "@/components/AdSlot";
import { getToolBySlug } from "@/lib/toolsConfig";

export const runtime = "edge";

type ToolPageProps = {
  params: { slug: string };
};

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    return notFound();
  }

  // 先用英文 SEO 文案，之後如果要做多語 metadata 再加
  const title = tool.title.en;
  const description = tool.shortDescription.en;

  const primaryOutput = tool.outputFormats[0]?.toUpperCase() ?? "PNG";
  const primaryInput = tool.inputFormats[0]?.toUpperCase() ?? undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 簡單 Header（沿用首頁 logo） */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Wise<span className="text-blue-600">Convert</span>
            </span>
          </a>
          <div className="text-xs sm:text-sm text-slate-500">
            {tool.category.toUpperCase()} TOOL
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
            {/* Hero for this tool */}
            <div className="mb-8 max-w-3xl">
              <h1 className="text-3xl sm:text-[34px] font-semibold text-slate-900 mb-3">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-slate-500">
                {description}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Supported input: {tool.inputFormats.join(", ").toUpperCase()} •
                {"  "}
                Output: {tool.outputFormats.join(", ").toUpperCase()}
              </p>
            </div>

            {/* Desktop top banner */}
            <div className="mb-4 hidden lg:block">
              <AdSlot
                slotId="tool-top-desktop"
                label="AD TOOL TOP — 970×90 / 728×90"
                className="h-20"
              />
            </div>

            {/* Main card */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm px-4 sm:px-8 py-6">
                  <FileUpload
                    inputFormat={primaryInput}
                    outputFormat={primaryOutput}
                  />
                </div>
                {/* Mobile in-content ad */}
                <div className="lg:hidden">
                  <AdSlot
                    slotId="tool-in-content-mobile"
                    label="AD TOOL IN-CONTENT — 320×100"
                    className="h-20"
                  />
                </div>
              </div>

              {/* Right side: simple FAQ / description */}
              <aside className="space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <h2 className="text-base font-semibold text-slate-900 mb-2">
                    How this {primaryInput ?? ""} to {primaryOutput} converter
                    works
                  </h2>
                  <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
                    <li>Upload your file using drag & drop or click.</li>
                    <li>
                      WiseConvert converts it in the cloud to {primaryOutput}.
                    </li>
                    <li>Download your converted file instantly.</li>
                  </ol>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Why use WiseConvert?
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    <li>No software install, all in browser.</li>
                    <li>Fast cloud processing and secure transfer.</li>
                    <li>More tools coming soon: images, video, audio & PDF.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
