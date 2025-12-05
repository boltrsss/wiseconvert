// app/convert/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { tools } from "@/data/tools";
import FileUpload from "@/components/FileUpload"; // 若 @ 不能用，改成 "../../../components/FileUpload"
import { AdSlot } from "@/components/AdSlot";     // 同上

export const runtime = "edge";

interface PageProps {
  params: { slug: string };
}

// SEO
export async function generateMetadata({ params }: PageProps) {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) {
    return { title: "File Converter - WiseConvert" };
  }

  return {
    title: `${tool.title} | WiseConvert`,
    description: tool.description,
  };
}

export default function ToolPage({ params }: PageProps) {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 簡版 Navbar（之後要共用可以抽成 component） */}
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
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
            <div className="text-center mb-6 lg:mb-8">
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                {tool.title}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                {tool.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] gap-4 lg:gap-6">
              {/* 左邊廣告 */}
              <div className="hidden lg:block">
                <AdSlot
                  slotId="sidebar-left"
                  label="AD SLOT LEFT — 300×600"
                  className="w-full h-[600px]"
                />
              </div>

              {/* 中央 FileUpload + 橫幅廣告 */}
              <div className="space-y-4 lg:space-y-5">
                <AdSlot
                  slotId="top-desktop"
                  label="AD SLOT TOP — 970×90 / 728×90"
                  className="hidden lg:flex h-20"
                />

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm px-4 sm:px-8 py-6">
                  <FileUpload
                    inputFormat={tool.input}
                    outputFormat={tool.output}
                  />
                </div>

                <AdSlot
                  slotId="bottom-desktop"
                  label="AD SLOT BOTTOM — 970×90 / 728×90"
                  className="hidden lg:flex h-20"
                />
              </div>

              {/* 右邊廣告 */}
              <div className="hidden lg:block">
                <AdSlot
                  slotId="sidebar-right"
                  label="AD SLOT RIGHT — 300×600"
                  className="w-full h-[600px]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
