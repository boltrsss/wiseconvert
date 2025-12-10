// app/tools/[slug]/ToolPageClient.tsx
"use client";

import React from "react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { AdSlot } from "@/components/AdSlot";
import { useLang } from "@/context/LanguageContext";
import type { ToolDefinition } from "@/lib/toolsConfig";

type Props = {
  tool: ToolDefinition;
};

export default function ToolPageClient({ tool }: Props) {
  const { lang } = useLang();
  const isZh = lang === "zh";

  const title = tool.title[lang];
  const description = tool.shortDescription[lang];

  const primaryOutput = tool.outputFormats[0]?.toUpperCase() ?? "PNG";
  const primaryInput = tool.inputFormats[0]?.toUpperCase() ?? undefined;

  const inputLabel = tool.inputFormats.join(", ").toUpperCase();
  const outputLabel = tool.outputFormats.join(", ").toUpperCase();

  const homeLabel = isZh ? "首頁" : "Home";
  const toolsLabel = isZh ? "工具" : "Tools";
  const backHomeLabel = isZh ? "回首頁" : "Back to Home";

  const howTitle = isZh ? "這個轉檔工具怎麼運作？" : "How this converter works";
  const whyTitle = isZh ? "為什麼使用 WiseConvert？" : "Why use WiseConvert?";

  const whenUseTitle = isZh
    ? "什麼時候適合使用這個轉檔工具？"
    : "When should you use this converter?";

  const faqTitle = isZh ? "常見問題 FAQ" : "FAQ";
  const safetyTitle = isZh ? "我的檔案安全嗎？" : "Are my files safe?";
  const installTitle = isZh ? "需要安裝軟體嗎？" : "Do I need to install anything?";

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
              <span>{backHomeLabel}</span>
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
                  {homeLabel}
                </Link>
                <span className="mx-1">/</span>
                <Link href="/tools" className="hover:underline">
                  {toolsLabel}
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
                {isZh ? "支援輸入格式" : "Supported input"}: {inputLabel} •{" "}
                {isZh ? "輸出格式" : "Output"}: {outputLabel}
              </p>
            </div>

            {/* 主體：左工具 + 右側欄（廣告優先，說明在下方） */}
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

              {/* 右側：側欄廣告 + 說明（說明在最下方） */}
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
                    {howTitle}
                  </h2>
                  <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
                    {isZh ? (
                      <>
                        <li>點選或拖拉上傳檔案到上方的轉檔區域。</li>
                        <li>
                          WiseConvert 在雲端自動將檔案轉成 {primaryOutput} 格式。
                        </li>
                        <li>轉檔完成後，立即下載處理好的檔案。</li>
                      </>
                    ) : (
                      <>
                        <li>Upload your file using drag &amp; drop or click.</li>
                        <li>
                          WiseConvert converts it in the cloud to {primaryOutput}.
                        </li>
                        <li>Download your converted file instantly.</li>
                      </>
                    )}
                  </ol>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {whyTitle}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    {isZh ? (
                      <>
                        <li>全部在瀏覽器完成，免安裝任何程式。</li>
                        <li>雲端伺服器處理轉檔，速度快、穩定。</li>
                        <li>陸續增加更多圖片、影片、音訊與 PDF 工具。</li>
                      </>
                    ) : (
                      <>
                        <li>No software install, all in browser.</li>
                        <li>Fast cloud processing and secure transfer.</li>
                        <li>
                          More tools coming soon: images, video, audio &amp; PDF.
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </aside>
            </div>

            {/* ✅ SEO 內容區塊（依語系切換文案） */}
            <section className="mt-10 max-w-3xl text-sm text-slate-600 space-y-6">
              <div className="space-y-3">
                <p className="leading-relaxed">
                  {isZh ? (
                    <>
                      WiseConvert 的 {title} 可以在瀏覽器中，快速把 {inputLabel} 檔案轉成{" "}
                      {outputLabel}。不需要安裝任何軟體，也不用註冊帳號。
                    </>
                  ) : (
                    <>
                      WiseConvert&apos;s {title} lets you quickly convert{" "}
                      {inputLabel} files into high-quality {outputLabel} directly
                      in your browser. No software installation, no registration.
                    </>
                  )}
                </p>
                <p className="leading-relaxed">
                  {isZh ? (
                    <>
                      只要上傳檔案、選擇輸出格式，幾秒鐘內就能下載完成的結果。所有轉檔都在雲端處理，
                      不論你使用 Windows、Mac、Linux 或手機、平板都能輕鬆使用。
                    </>
                  ) : (
                    <>
                      Upload your files, choose the output format, and download
                      your converted files in seconds. Everything runs in the
                      cloud, so it works on Windows, Mac, Linux, phones and
                      tablets.
                    </>
                  )}
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  {whenUseTitle}
                </h2>
                <ul className="list-disc list-inside space-y-1.5">
                  {isZh ? (
                    <>
                      <li>為網頁、UI 設計或簡報準備適合的檔案格式。</li>
                      <li>讓檔案在更多裝置與軟體中保持相容。</li>
                      <li>在維持畫質或音質的情況下降低檔案大小。</li>
                      <li>更方便地透過 Email、通訊軟體或雲端分享檔案。</li>
                    </>
                  ) : (
                    <>
                      <li>Prepare files for web, UI design or documents.</li>
                      <li>Make your files compatible with more apps and devices.</li>
                      <li>
                        Reduce file size while keeping good visual or audio
                        quality.
                      </li>
                      <li>
                        Share files more easily via email, chat or cloud storage.
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
                  {faqTitle}
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {isZh
                        ? `把 ${primaryInput} 轉成 ${primaryOutput} 會提升畫質嗎？`
                        : `Will converting ${primaryInput} to ${primaryOutput} improve quality?`}
                    </h3>
                    <p className="leading-relaxed">
                      {isZh ? (
                        <>
                          轉檔不會憑空產生更多細節，但可以避免重複壓縮造成的畫質損失，
                          在某些情況下能保留比較好的品質。
                        </>
                      ) : (
                        <>
                          Converting will not magically add new details, but it
                          can avoid extra compression artifacts and help preserve
                          the existing quality.
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {safetyTitle}
                    </h3>
                    <p className="leading-relaxed">
                      {isZh ? (
                        <>
                          所有檔案都透過 HTTPS 傳輸並在安全的伺服器上處理，完成轉檔後會在短時間內自動刪除，
                          你的檔案不會長期留在線上。
                        </>
                      ) : (
                        <>
                          Files are transferred over HTTPS and processed on secure
                          servers. They are automatically removed after a short
                          period so your data doesn&apos;t stay online longer than
                          needed.
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {installTitle}
                    </h3>
                    <p className="leading-relaxed">
                      {isZh ? (
                        <>
                          不需要。WiseConvert 完全在瀏覽器中執行，
                          任何裝置只要有網頁就能使用，不必另外安裝程式。
                        </>
                      ) : (
                        <>
                          No. WiseConvert runs entirely in your browser, so you
                          can convert files on any device without installing extra
                          software.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

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