// app/convert/[slug]/page.tsx
import { notFound } from "next/navigation";
import { tools } from "@/data/tools";
import { AdSlot } from "@/components/AdSlot";
import FileUpload from "@/components/FileUpload"; // 你有自己的上傳元件可以替換
import React from "react";
export const runtime = "edge";

export async function generateMetadata({ params }: { params: any }) {
  const tool = tools.find(t => t.slug === params.slug);
  if (!tool) return {};

  return {
    title: tool.title + " — Free Online Converter",
    description: tool.description,
  };
}

export default function ToolPage({ params }: { params: any }) {
  const tool = tools.find(t => t.slug === params.slug);
  if (!tool) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      {/* Page Header + Title */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10">
        <h1 className="text-4xl font-semibold text-slate-900 text-center">
          {tool.title}
        </h1>

        <p className="text-center mt-3 text-slate-500 max-w-2xl mx-auto">
          {tool.description}
        </p>
      </div>

      {/* Mobile top ad */}
      <div className="px-6 mb-4 lg:hidden">
        <AdSlot slotId="tool-top-mobile" label="MOBILE — 320×100" className="h-16" />
      </div>

      {/* 3-column layout same as homepage */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] gap-4 lg:gap-6">
        
        {/* Left desktop ad */}
        <div className="hidden lg:block">
          <AdSlot slotId="tool-left" label="LEFT — 300×600" className="h-[600px]" />
        </div>

        {/* Main content */}
        <div className="space-y-4 lg:space-y-5">

          {/* Desktop top ad */}
          <AdSlot slotId="tool-top-desktop" label="TOP — 970×90" className="hidden lg:flex h-20" />

          {/* Upload card */}
          <div className="rounded-2xl border bg-white shadow-sm p-8">
            <FileUpload inputFormat={tool.input} outputFormat={tool.output} />
          </div>

          {/* Mobile middle ad */}
          <AdSlot slotId="tool-middle-mobile" label="MOBILE — 320×100" className="lg:hidden h-20" />

          {/* Bottom desktop ad */}
          <AdSlot slotId="tool-bottom-desktop" label="BOTTOM — 970×90" className="hidden lg:flex h-20" />
        </div>

        {/* Right desktop ad */}
        <div className="hidden lg:block">
          <AdSlot slotId="tool-right" label="RIGHT — 300×600" className="h-[600px]" />
        </div>
      </div>

      {/* Mobile sticky ad */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/90">
        <div className="max-w-screen-sm mx-auto px-3 pb-2">
          <AdSlot slotId="tool-sticky-mobile" label="STICKY — 320×50" className="h-12 shadow-md" />
        </div>
      </div>
    </div>
  );
}
