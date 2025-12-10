// app/tools/[slug]/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/toolsConfig";
import { useLang } from "@/context/LanguageContext";
import { AdSlot } from "@/components/AdSlot";
import FileUpload from "@/components/FileUpload";

export const runtime = "edge";

type ToolPageProps = {
  params: { slug: string };
};

export default function ToolPage({ params }: ToolPageProps) {
  const { slug } = params;
  const tool = getToolBySlug(slug);
  const { lang } = useLang();

  if (!tool) return notFound();

  const longDesc = tool.longDescription?.[lang] ?? [];
  const useCases = tool.useCases?.[lang] ?? [];
  const faq = tool.faq?.[lang] ?? [];

  const homeLabel = lang === "zh" ? "回首頁" : "Back to Home";
  const allToolsLabel = lang === "zh" ? "所有工具" : "All tools";
  const whyUseTitle =
    lang === "zh"
      ? "什麼時候適合使用這個轉檔工具？"
      : "When should you use this converter?";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Wise<span className="text-blue-600">Convert</span>
            </span>
          </Link>

          {/* Right links */}
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <span>←</span>
              <span>{homeLabel}</span>
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1 hover:text-blue-600"
            >
              <span className="text-[13px]">🧰</span>
              <span>{allToolsLabel}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="py-8 lg:py-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          {/* Top: title + layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-8 lg:gap-10">
            {/* Left column: hero + uploader + SEO content */}
            <div className="space-y-6">
              {/* Breadcrumb + hero */}
              <div>
                <div className="text-[11px] text-slate-400 mb-2">
                  <Link href="/" className="hover:underline">
                    {lang === "zh" ? "首頁" : "Home"}
                  </Link>
                  <span className="mx-1">/</span>
                  <Link href="/tools" className="hover:underline">
                    {lang === "zh" ? "轉檔工具" : "Tools"}
                  </Link>
                  <span className="mx-1">/</span>
                  <span>{tool.title[lang]}</span>
                </div>

                <h1 className="text-3xl sm:text-[32px] font-semibold text-slate-900 mb-2">
                  {tool.title[lang]}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 mb-1.5">
                  {tool.seoDescription[lang] || tool.shortDescription[lang]}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {tool.inputFormats.join(", ").toUpperCase()} →{" "}
                  {tool.outputFormats.join(", ").toUpperCase()}
                </p>
              </div>

              {/* Converter card —— 這一塊就是你要的轉檔區 */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 py-5">
                  <FileUpload />
                </div>
              </div>

              {/* SEO long description */}
              {longDesc.length > 0 && (
                <section className="pt-4 border-t border-slate-200">
                  {longDesc.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className={`text-sm sm:text-[15px] text-slate-600 ${
                        idx === 0 ? "" : "mt-3"
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              )}

              {/* Use cases */}
              {useCases.length > 0 && (
                <section className="pt-6">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
                    {whyUseTitle}
                  </h2>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600">
                    {useCases.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* FAQ */}
              {faq.length > 0 && (
                <section className="pt-6 pb-2">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
                    FAQ
                  </h2>
                  <div className="space-y-4">
                    {faq.map(({ q, a }, idx) => (
                      <div key={idx}>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          {q}
                        </h3>
                        <p className="text-sm text-slate-600">{a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right column: ad slots */}
            <aside className="space-y-4 lg:space-y-6">
              <AdSlot
                slotId={`tool-${slug}-right-top`}
                label="AD TOOL RIGHT TOP — 300×250 / 300×600"
                className="w-full h-[250px] lg:h-[600px]"
              />
              <AdSlot
                slotId={`tool-${slug}-right-1`}
                label="AD TOOL RIGHT 1 — 300×250"
                className="w-full h-[250px]"
              />
              <AdSlot
                slotId={`tool-${slug}-right-2`}
                label="AD TOOL RIGHT 2 — 300×250"
                className="w-full h-[250px]"
              />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
