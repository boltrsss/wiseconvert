// app/tools/[slug]/ToolSeoClient.tsx
"use client";

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { TOOLS, type ToolDefinition } from "@/lib/toolsConfig";

type Props = {
  tool: ToolDefinition;
  primaryInput: string;
  primaryOutput: string;
};

export default function ToolSeoClient({
  tool,
  primaryInput,
  primaryOutput,
}: Props) {
  const { lang } = useLang();

  const title = tool.title[lang];
  const seoTitle = tool.seoTitle[lang];
  const seoDescription = tool.seoDescription[lang];

  const locale = lang === "zh" ? "zh-TW" : "en-US";
  const url = `https://www.wiseconverthub.com/tools/${tool.slug}`;

  // ----- When to use -----
  const whenToUseTitle =
    lang === "zh"
      ? `什麼時候需要使用「${title}」？`
      : `When should you use a ${title}?`;

  const bulletPoints =
    lang === "zh"
      ? [
          "為 Logo、UI 圖示保留透明背景。",
          "準備網站或 App 用的圖片素材。",
          `改善舊 ${primaryInput} 圖片的壓縮痕跡。`,
          `把螢幕截圖轉成 ${primaryOutput}，讓文字更清晰易讀。`,
        ]
      : [
          "Keep transparent backgrounds for logos and UI icons.",
          "Prepare images for web or app design assets.",
          `Reduce compression artifacts from old ${primaryInput} files.`,
          `Convert screenshots to lossless ${primaryOutput} for better readability.`,
        ];

  // ----- FAQ -----
  const faqItems =
    lang === "zh"
      ? [
          {
            q: `把 ${primaryInput} 轉成 ${primaryOutput}，畫質會變好嗎？`,
            a: `轉成 ${primaryOutput} 不會憑空變出新的細節，但可以避免再次壓縮造成的畫質損失，對需要反覆編輯或保存的圖片比較友善。`,
          },
          {
            q: "我上傳的檔案會安全嗎？",
            a: "檔案會在雲端安全處理，並只會保存短暫時間用於轉檔。我們建議你下載完成後，也一併刪除不再需要的檔案副本。",
          },
          {
            q: "需要安裝軟體才能使用嗎？",
            a: "完全不需要安裝任何程式，只要有瀏覽器和網路，就可以在任何裝置上使用 WiseConvert。",
          },
        ]
      : [
          {
            q: `Will converting ${primaryInput} to ${primaryOutput} improve image quality?`,
            a: `${primaryOutput} won't magically add new details, but it avoids extra compression and helps preserve your existing quality, especially if you edit or save the file again.`,
          },
          {
            q: "Is my file safe when I upload it?",
            a: "Files are processed securely in the cloud and kept only for a short time for conversion. We recommend downloading your result and deleting any copies you no longer need.",
          },
          {
            q: "Do I need to install any software?",
            a: "No installation is required. Everything runs in your browser, so you can use this converter from any device with an internet connection.",
          },
        ];

  // ----- Related Tools -----
  const sameCategory = TOOLS.filter(
    (t) => t.slug !== tool.slug && t.category === tool.category
  );
  const others = TOOLS.filter(
    (t) => t.slug !== tool.slug && t.category !== tool.category
  );
  const related = [...sameCategory, ...others].slice(0, 4);

  // ----- JSON-LD Schema -----
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: title,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        url,
        inLanguage: locale,
        description: seoDescription,
      },
      {
        "@type": "HowTo",
        name: title,
        description: seoDescription,
        inLanguage: locale,
        step:
          lang === "zh"
            ? [
                { "@type": "HowToStep", name: "上傳檔案" },
                { "@type": "HowToStep", name: "選擇輸出格式並開始轉檔" },
                { "@type": "HowToStep", name: "下載轉檔完成的檔案" },
              ]
            : [
                { "@type": "HowToStep", name: "Upload your file" },
                { "@type": "HowToStep", name: "Choose output format & convert" },
                { "@type": "HowToStep", name: "Download the converted file" },
              ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* ✅ 動態 Title / Meta，依語言切換 */}
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
        <html lang={lang === "zh" ? "zh-Hant" : "en"} />
      </Head>

      {/* ✅ 下方 SEO 內容 + FAQ */}
      <div className="mt-10 lg:mt-12 max-w-3xl text-sm sm:text-base text-slate-600">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
          {whenToUseTitle}
        </h2>
        <p className="mb-2">{seoDescription}</p>

        <ul className="list-disc list-inside space-y-1 mb-6">
          {bulletPoints.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
          {lang === "zh" ? "常見問題（FAQ）" : "FAQ"}
        </h2>

        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                {item.q}
              </h3>
              <p className="text-sm text-slate-600 mt-1">{item.a}</p>
            </div>
          ))}
        </div>

        {/* ✅ Related Tools 區塊 */}
        <div className="mt-10">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
            {lang === "zh" ? "你可能也會需要這些工具" : "You may also need these tools"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((rt) => (
              <Link
                key={rt.slug}
                href={`/tools/${rt.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm hover:border-blue-500 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-900 group-hover:text-blue-600">
                    {rt.title[lang]}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {rt.inputFormats.join(", ").toUpperCase()} →{" "}
                    {rt.outputFormats.join(", ").toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {rt.shortDescription[lang]}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700"
            >
              <span>←</span>
              <span>{lang === "zh" ? "回到所有工具列表" : "Back to all tools"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ JSON-LD Schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}