// app/tools/[slug]/page.tsx

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { AdSlot } from "@/components/AdSlot";
import { getToolBySlug } from "@/lib/toolsConfig";
import { useLang } from "@/context/LanguageContext";

export const runtime = "edge";

type ToolPageProps = {
  params: { slug: string };
};

export default function ToolPage({ params }: ToolPageProps) {
  const { lang } = useLang();
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    return notFound();
  }

  const title = tool.title[lang];
  const description = tool.shortDescription[lang];

  const primaryOutput = tool.outputFormats[0]?.toUpperCase() ?? "PNG";
  const primaryInput = tool.inputFormats[0]?.toUpperCase() ?? undefined;

  // ⬇️ SEO 內容（從 toolsConfig 可選擇帶入）
  const longDesc = tool.longDescription?.[lang] ?? [];
  const useCases = tool.useCases?.[lang] ?? [];
  const faq = tool.faq?.[lang] ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header：Logo + 回首頁 */}
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
            <span className="hidden sm:inline">
              {tool.category.toUpperCase()} TOOL
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8 lg:py-10">
            {/* TOP 廣告：桌機 + 手機 */}
            <div className="mb-6">
              <div className="hidden lg:block">
                <AdSlot
                  slotId="tool-top-desktop"
                  label="AD TOOL TOP — 970×90 / 728×90"
                  className="h-20"
                />
              </div>
              <div className="lg:hidden">
                <AdSlot
                  slotId="tool-top-mobile"
                  label="AD TOOL TOP MOBILE — 320×100"
                  className="h-16"
                />
              </div>
            </div>

            {/* Breadcrumb + Hero */}
            <div className="mb-6 max-w-3xl">
              <div className="text-[11px] text-slate-400 mb-2">
                <Link href="/" className="hover:underline">
                  {lang === "zh" ? "首頁" : "Home"}
                </Link>
                <span className="mx-1">/</span>
                <Link href="/tools" className="hover:underline">
                  {lang === "zh" ? "工具" : "Tools"}
                </Link>
                <span className="mx-1">/</span>
                <span>{title}</span>
              </div>
              <h1 className="text-3xl sm:text-[34px] font-semibold text-slate-900 mb-2">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mb-1.5">
                {description}
              </p>
              <p className="text-xs text-slate-400">
                {lang === "zh" ? "輸入格式" : "Supported input"}:{" "}
                {tool.inputFormats.join(", ").toUpperCase()} •{" "}
                {lang === "zh" ? "輸出" : "Output"}:{" "}
                {tool.outputFormats.join(", ").toUpperCase()}
              </p>
            </div>

            {/* 主體：左工具 + 右側欄（保持原本 layout） */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6 items-start">
              {/* 左側：FileUpload + 中間橫幅 */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm px-4 sm:px-8 py-6">
                  <FileUpload
                    inputFormat={primaryInput}
                    outputFormat={primaryOutput}
                  />
                </div>

                {/* 左側：in-content 廣告（桌機橫幅 + 手機） */}
                <div className="space-y-3">
                  <div className="hidden lg:flex">
                    <AdSlot
                      slotId="tool-in-content-desktop"
                      label="AD TOOL IN-CONTENT — 728×90 / 468×60"
                      className="h-20 w-full"
                    />
                  </div>
                  <div className="lg:hidden">
                    <AdSlot
                      slotId="tool-in-content-mobile"
                      label="AD TOOL IN-CONTENT — 320×100"
                      className="h-20"
                    />
                  </div>
                </div>
              </div>

              {/* 右側：側欄廣告 + 說明（保持原本） */}
              <aside className="space-y-4">
                {/* 兩個 300×250 廣告位 */}
                <div className="hidden lg:block">
                  <AdSlot
                    slotId="tool-sidebar-top"
                    label="AD TOOL SIDEBAR TOP — 300×250"
                    className="w-full h-[250px]"
                  />
                </div>
                <div className="hidden lg:block">
                  <AdSlot
                    slotId="tool-sidebar-middle"
                    label="AD TOOL SIDEBAR MID — 300×250"
                    className="w-full h-[250px]"
                  />
                </div>

                {/* 說明區塊放在側欄最下方 */}
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                  <h2 className="text-base font-semibold text-slate-900 mb-2">
                    {lang === "zh"
                      ? "這個轉檔工具怎麼使用？"
                      : "How this converter works"}
                  </h2>
                  <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
                    <li>
                      {lang === "zh"
                        ? "透過拖拉或點擊，上傳你的檔案。"
                        : "Upload your file using drag & drop or click."}
                    </li>
                    <li>
                      {lang === "zh"
                        ? `WiseConvert 會在雲端將檔案轉成 ${primaryOutput}。`
                        : `WiseConvert converts it in the cloud to ${primaryOutput}.`}
                    </li>
                    <li>
                      {lang === "zh"
                        ? "幾秒鐘內即可下載完成的檔案。"
                        : "Download your converted file instantly."}
                    </li>
                  </ol>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {lang === "zh" ? "為什麼選 WiseConvert？" : "Why use WiseConvert?"}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    <li>
                      {lang === "zh"
                        ? "免安裝軟體，全部在瀏覽器中完成。"
                        : "No software install, all in browser."}
                    </li>
                    <li>
                      {lang === "zh"
                        ? "雲端高速處理，傳輸加密更安全。"
                        : "Fast cloud processing and secure transfer."}
                    </li>
                    <li>
                      {lang === "zh"
                        ? "更多圖片、影片、音訊與 PDF 工具即將上線。"
                        : "More tools coming soon: images, video, audio & PDF."}
                    </li>
                  </ul>
                </div>
              </aside>
            </div>

            {/* ⬇️ 新增：SEO 內容區塊（放在 grid 下面、底部廣告上面） */}
            {(longDesc.length > 0 ||
              useCases.length > 0 ||
              faq.length > 0) && (
              <section className="mt-10 max-w-3xl text-sm text-slate-600 space-y-6">
                {/* 長描述段落 */}
                {longDesc.length > 0 && (
                  <div className="space-y-3">
                    {longDesc.map((para, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {/* 使用情境 */}
                {useCases.length > 0 && (
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                      {lang === "zh"
                        ? "什麼時候適合使用這個轉檔工具？"
                        : "When should you use this converter?"}
                    </h2>
                    <ul className="list-disc list-inside space-y-1.5">
                      {useCases.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FAQ */}
                {faq.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
                      FAQ
                    </h2>
                    <div className="space-y-4">
                      {faq.map((item, idx) => (
                        <div key={idx}>
                          <h3 className="text-sm font-semibold text-slate-900 mb-1">
                            {item.q}
                          </h3>
                          <p className="leading-relaxed">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 底部：全寬 Banner 廣告 */}
            <div className="mt-8">
              <div className="hidden lg:flex">
                <AdSlot
                  slotId="tool-bottom-desktop"
                  label="AD TOOL BOTTOM — 970×90 / 728×90"
                  className="h-20 w-full"
                />
              </div>
              <div className="lg:hidden">
                <AdSlot
                  slotId="tool-bottom-mobile"
                  label="AD TOOL BOTTOM MOBILE — 320×100"
                  className="h-16"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 手機 Sticky 底部廣告（工具頁） */}
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
