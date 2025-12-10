// app/tools/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { TOOLS } from "@/lib/toolsConfig";
import { useLang } from "@/context/LanguageContext";
import { AdSlot } from "@/components/AdSlot";

export const runtime = "edge";

const categoryLabel: Record<string, { en: string; zh: string }> = {
  image: {
    en: "Image",
    zh: "圖片轉檔",
  },
  video: {
    en: "Video",
    zh: "影片轉檔",
  },
  audio: {
    en: "Audio",
    zh: "音訊轉檔",
  },
  document: {
    en: "Document",
    zh: "文件轉檔",
  },
  archive: {
    en: "Archive",
    zh: "壓縮檔 / 其他",
  },
  other: {
    en: "Other",
    zh: "其他工具",
  },
};

export default function ToolsIndexPage() {
  const { lang } = useLang();
  const [query, setQuery] = React.useState("");

  const normalizedQuery = query.trim().toLowerCase();

  // 依搜尋關鍵字過濾工具
  const filteredTools = React.useMemo(() => {
    if (!normalizedQuery) return TOOLS;

    return TOOLS.filter((tool) => {
      const haystack = [
        tool.slug,
        tool.title.en,
        tool.title.zh,
        tool.shortDescription.en,
        tool.shortDescription.zh,
        ...tool.inputFormats,
        ...tool.outputFormats,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  // 依分類 group
  const grouped = filteredTools.reduce<Record<string, typeof TOOLS>>(
    (acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    },
    {}
  );

  const groupedEntries = Object.entries(grouped);

  const pageTitle =
    lang === "zh" ? "所有線上轉檔工具" : "All Online Conversion Tools";
  const pageSubtitle =
    lang === "zh"
      ? "選擇一個適合你的轉檔工具，開始上傳檔案即可使用。"
      : "Pick a tool for your task and start converting your files in seconds.";

  const toolsCount = filteredTools.length;

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
          {/* 右上角：回首頁 + 簡單文字 */}
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <span>←</span>
              <span>{lang === "zh" ? "回首頁" : "Back to Home"}</span>
            </Link>
            <span className="hidden sm:inline">
              {lang === "zh" ? "全部工具" : "All tools"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">
        <section className="py-10 lg:py-14">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            {/* Title + SubTitle + Breadcrumb */}
            <div className="mb-6 max-w-3xl space-y-2">
              <div className="text-[11px] text-slate-400">
                <Link href="/" className="hover:underline">
                  {lang === "zh" ? "首頁" : "Home"}
                </Link>
                <span className="mx-1">/</span>
                <span>{lang === "zh" ? "轉檔工具" : "Tools"}</span>
              </div>
              <h1 className="text-3xl sm:text-[34px] font-semibold text-slate-900">
                {pageTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-500">
                {pageSubtitle}
              </p>
            </div>

            {/* 上方廣告：桌機 & 手機 */}
            <div className="mb-6">
              <div className="hidden lg:block">
                <AdSlot
                  slotId="tools-top-desktop"
                  label="AD TOOLS TOP — 970×90 / 728×90"
                  className="h-20"
                />
              </div>
              <div className="lg:hidden">
                <AdSlot
                  slotId="tools-top-mobile"
                  label="AD TOOLS TOP MOBILE — 320×100"
                  className="h-16"
                />
              </div>
            </div>

            {/* ✅ 搜尋列 + 工具數量 */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs sm:text-sm text-slate-500">
                {lang === "zh"
                  ? `目前共有 ${toolsCount} 個轉檔工具。`
                  : `${toolsCount} tools available.`}
              </p>
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    lang === "zh"
                      ? "搜尋格式或工具名稱，例如：jpg、mp3、video..."
                      : "Search by format or tool name, e.g. jpg, mp3, video..."
                  }
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ⌕
                </span>
              </div>
            </div>

            {/* 工具群組列表 / 無結果提示 */}
            {groupedEntries.length === 0 ? (
              <p className="text-sm text-slate-500">
                {lang === "zh"
                  ? "找不到符合搜尋條件的工具。可以試試輸入「jpg」、「mp3」或「video」。"
                  : 'No tools match your search. Try typing "jpg", "mp3" or "video".'}
              </p>
            ) : (
              <div className="space-y-8">
                {groupedEntries.map(([cat, tools]) => (
                  <div key={cat} className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <span>
                        {categoryLabel[cat]?.[lang] ??
                          (lang === "zh" ? "其他工具" : "Other tools")}
                      </span>
                      <span className="text-xs text-slate-400">
                        · {tools.length}{" "}
                        {lang === "zh"
                          ? "項工具"
                          : tools.length > 1
                          ? "tools"
                          : "tool"}
                      </span>
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="group rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm hover:border-blue-500 hover:shadow-sm transition"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
                              {tool.title[lang]}
                            </h3>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              {tool.inputFormats.join(", ").toUpperCase()} →{" "}
                              {tool.outputFormats.join(", ").toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {tool.shortDescription[lang]}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 下方廣告：底部 banner */}
            <div className="mt-10">
              <div className="hidden lg:flex">
                <AdSlot
                  slotId="tools-bottom-desktop"
                  label="AD TOOLS BOTTOM — 970×90 / 728×90"
                  className="h-20"
                />
              </div>
              <div className="lg:hidden">
                <AdSlot
                  slotId="tools-bottom-mobile"
                  label="AD TOOLS BOTTOM MOBILE — 320×100"
                  className="h-16"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 手機 Sticky 底部廣告（tools 頁也吃一份） */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
        <div className="max-w-screen-sm mx-auto px-3 pb-2">
          <AdSlot
            slotId="tools-sticky-mobile"
            label="AD TOOLS STICKY MOBILE — 320×50"
            className="h-12 shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
