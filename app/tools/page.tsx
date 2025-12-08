// app/tools/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { TOOLS } from "@/lib/toolsConfig";
import { useLang } from "@/context/LanguageContext";

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

  const grouped = TOOLS.reduce<Record<string, typeof TOOLS>>((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const pageTitle =
    lang === "zh" ? "所有線上轉檔工具" : "All Online Conversion Tools";
  const pageSubtitle =
    lang === "zh"
      ? "選擇一個適合你的轉檔工具，開始上傳檔案即可使用。"
      : "Pick a tool for your task and start converting your files in seconds.";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header 簡版 */}
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
            {lang === "zh" ? "全部工具" : "All tools"}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">
        <section className="py-10 lg:py-14">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            <div className="mb-8 max-w-3xl">
              <h1 className="text-3xl sm:text-[34px] font-semibold text-slate-900 mb-3">
                {pageTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-500">
                {pageSubtitle}
              </p>
            </div>

            <div className="space-y-8">
              {Object.entries(grouped).map(([cat, tools]) => (
                <div key={cat} className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span>
                      {categoryLabel[cat]?.[lang] ??
                        (lang === "zh" ? "其他工具" : "Other tools")}
                    </span>
                    <span className="text-xs text-slate-400">
                      · {tools.length}{" "}
                      {lang === "zh" ? "項工具" : tools.length > 1 ? "tools" : "tool"}
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
          </div>
        </section>
      </main>
    </div>
  );
}