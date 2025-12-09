// app/tools/[slug]/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOOLS } from "@/lib/toolsConfig";
import { useLang } from "@/context/LanguageContext";
import { AdSlot } from "@/components/AdSlot";

export const runtime = "edge";

type ToolFaqItem = { q: string; a: string };

export default function ToolPage({ params }: { params: { slug: string } }) {
  const { lang } = useLang();
  const router = useRouter();

  const tool = TOOLS.find((t) => t.slug === params.slug);

  if (!tool) {
    // 找不到工具就回首頁
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  const seoTitle =
    (tool as any).seoTitle?.[lang] ?? tool.title[lang] ?? tool.title.en;
  const seoDesc =
    (tool as any).seoDescription?.[lang] ??
    (tool as any).shortDescription?.[lang] ??
    "";

  const longDescription: string[] =
    (tool as any).longDescription?.[lang] ?? [];
  const useCases: string[] = (tool as any).useCases?.[lang] ?? [];
  const faqItems: ToolFaqItem[] = (tool as any).faq?.[lang] ?? [];

  const pageTitle = seoTitle;
  const breadTools = lang === "zh" ? "工具" : "Tools";
  const breadHome = lang === "zh" ? "首頁" : "Home";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
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

          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <span>←</span>
              <span>{lang === "zh" ? "回首頁" : "Back to Home"}</span>
            </Link>
            <Link
              href="/tools"
              className="hidden sm:inline-flex items-center gap-1 hover:text-blue-600"
            >
              <span>🧰</span>
              <span>{lang === "zh" ? "所有工具" : "All tools"}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">
        <section className="py-8 lg:py-12">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            {/* Breadcrumb */}
            <div className="text-[11px] text-slate-400 mb-3">
              <Link href="/" className="hover:underline">
                {breadHome}
              </Link>
              <span className="mx-1">/</span>
              <Link href="/tools" className="hover:underline">
                {breadTools}
              </Link>
              <span className="mx-1">/</span>
              <span>{tool.title[lang] ?? tool.title.en}</span>
            </div>

            {/* 上方：標題 + 簡介 + 桌機上方廣告 */}
            <div className="grid lg:grid-cols-[minmax(0,1.6fr)_320px] gap-6 lg:gap-10 items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-slate-900 mb-2">
                  {tool.title[lang] ?? tool.title.en}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 mb-2">
                  {seoDesc}
                </p>
                <p className="text-xs text-slate-400">
                  {tool.inputFormats.join(", ").toUpperCase()} →{" "}
                  {tool.outputFormats.join(", ").toUpperCase()}
                </p>
              </div>

              {/* 右側：桌機廣告 */}
              <div className="hidden lg:block">
                <AdSlot
                  slotId="tool-right-top"
                  label="AD TOOL RIGHT TOP — 300×250 / 300×600"
                  className="w-full h-[250px]"
                />
              </div>
            </div>

            {/* 中間主內容：左文案 + 中間廣告 + 右文案（桌機） */}
            <div className="mt-8 grid lg:grid-cols-[minmax(0,2fr)_300px] gap-6">
              {/* 文字內容區 */}
              <div className="space-y-8">
                {/* 長說明 */}
                {longDescription.length > 0 && (
                  <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {longDescription.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                )}

                {/* 使用情境 */}
                {useCases.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">
                      {lang === "zh"
                        ? "適合什麼時候使用 JPG 轉 PNG？"
                        : "When should you use a JPG to PNG converter?"}
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                      {useCases.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FAQ 區 */}
                {faqItems.length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      {lang === "zh" ? "常見問題" : "FAQ"}
                    </h2>
                    <div className="space-y-4">
                      {faqItems.map((item, idx) => (
                        <div key={idx}>
                          <p className="text-sm font-semibold text-slate-900 mb-1">
                            {item.q}
                          </p>
                          <p className="text-sm text-slate-600">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 右側：桌機中段廣告 + 說明上方再一個位子 */}
              <div className="hidden lg:flex flex-col gap-4">
                <AdSlot
                  slotId="tool-right-middle-1"
                  label="AD TOOL RIGHT 1 — 300×250"
                  className="w-full h-[250px]"
                />
                <AdSlot
                  slotId="tool-right-middle-2"
                  label="AD TOOL RIGHT 2 — 300×250"
                  className="w-full h-[250px]"
                />
              </div>
            </div>

            {/* 手機版：內文下方廣告 */}
            <div className="mt-8 lg:hidden space-y-4">
              <AdSlot
                slotId="tool-mobile-incontent-1"
                label="AD TOOL MOBILE 1 — 320×100"
                className="h-20"
              />
              <AdSlot
                slotId="tool-mobile-incontent-2"
                label="AD TOOL MOBILE 2 — 320×100"
                className="h-20"
              />
            </div>
          </div>
        </section>
      </main>

      {/* 手機 sticky 底部廣告（沿用全站邏輯） */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
        <div className="max-w-screen-sm mx-auto px-3 pb-2">
          <AdSlot
            slotId="tool-sticky-mobile"
            label="AD TOOL STICKY MOBILE — 320×50"
            className="h-12 shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
