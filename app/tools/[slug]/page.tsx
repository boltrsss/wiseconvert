"use client";

import React from "react";
import { AdSlot } from "@/components/AdSlot";
import FileUpload from "@/components/FileUpload";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLang } from "@/context/LanguageContext";
import { getToolMeta } from "@/lib/tools";

type ToolPageProps = {
  params: {
    slug: string;
  };
};

export default function ToolPage({ params }: ToolPageProps) {
  const { lang, t } = useLang();
  const meta = getToolMeta(params.slug);

  // 找不到工具 → 簡單顯示 404 風格頁
  if (!meta) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Navbar（跟首頁一樣結構） */}
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                W
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Wise<span className="text-blue-600">Convert</span>
              </span>
            </a>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8 text-[16px] font-medium text-slate-600">
              <a href="/#converter" className="hover:text-blue-600">
                {t("navbar.convert")}
              </a>
              <a href="/#how-it-works" className="hover:text-blue-600">
                {t("navbar.how_it_works")}
              </a>
              <a href="/#why" className="hover:text-blue-600">
                {t("navbar.why")}
              </a>
              <a href="/#pricing" className="hover:text-blue-600">
                {t("navbar.pricing")}
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-4 text-[16px] font-medium">
              <button className="px-4 py-1.5 rounded-lg hover:bg-slate-100">
                {t("auth.login")}
              </button>
              <button className="px-5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                {t("auth.signup")}
              </button>

              {/* 語系切換 */}
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-semibold mb-2">
              Tool not found
            </h1>
            <p className="text-slate-500 mb-4">
              The tool you are looking for does not exist.
            </p>
            <a
              href="/"
              className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Back to home
            </a>
          </div>
        </main>
      </div>
    );
  }

  const title = meta.title[lang] ?? meta.title.en;
  const subtitle = meta.desc[lang] ?? meta.desc.en;
  const inputLabel =
    meta.inputLabel?.[lang] ??
    meta.inputLabel?.en ??
    meta.inputFormat ??
    undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar（結構跟首頁一致） */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Wise<span className="text-blue-600">Convert</span>
            </span>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-[16px] font-medium text-slate-600">
            <a href="/#converter" className="hover:text-blue-600">
              {t("navbar.convert")}
            </a>
            <a href="/#how-it-works" className="hover:text-blue-600">
              {t("navbar.how_it_works")}
            </a>
            <a href="/#why" className="hover:text-blue-600">
              {t("navbar.why")}
            </a>
            <a href="/#pricing" className="hover:text-blue-600">
              {t("navbar.pricing")}
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4 text-[16px] font-medium">
            <button className="px-4 py-1.5 rounded-lg hover:bg-slate-100">
              {t("auth.login")}
            </button>
            <button className="px-5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              {t("auth.signup")}
            </button>

            {/* 語系切換 */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* main 加 padding-bottom，避免手機 sticky 廣告遮住 */}
      <main className="flex-1 pb-20 lg:pb-0">
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
            {/* 標題區（用工具自己的 title / desc） */}
            <div className="text-center mb-6 lg:mb-8">
              <h1 className="text-3xl sm:text-[34px] font-semibold text-slate-900">
                {title}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                {subtitle}
              </p>
            </div>

            {/* 手機版頂部廣告 */}
            <div className="mb-4 lg:hidden">
              <AdSlot
                slotId="tool-top-mobile"
                label="AD TOP MOBILE — 320×100"
                className="h-16"
              />
            </div>

            {/* 左右廣告 + 中間工具 */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] gap-4 lg:gap-6">
              {/* 左側廣告（桌機） */}
              <div className="hidden lg:block">
                <AdSlot
                  slotId="tool-sidebar-left"
                  label="AD SLOT LEFT — 300×600"
                  className="w-full h-[600px]"
                />
              </div>

              {/* 中央內容：FileUpload */}
              <div className="space-y-4 lg:space-y-5">
                {/* 上方橫幅廣告（桌機） */}
                <AdSlot
                  slotId="tool-top-desktop"
                  label="AD SLOT TOP — 970×90 / 728×90"
                  className="hidden lg:flex h-20"
                />

                {/* Uploader Card */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm px-4 sm:px-8 py-6">
                  <FileUpload
                    inputFormat={inputLabel}
                    outputFormat={meta.outputFormat ?? "png"}
                  />
                </div>

                {/* 手機版：中間一個廣告 */}
                <div className="lg:hidden">
                  <AdSlot
                    slotId="tool-in-content-mobile"
                    label="AD IN-CONTENT MOBILE — 320×100"
                    className="h-20"
                  />
                </div>

                {/* 下方橫幅（桌機） */}
                <AdSlot
                  slotId="tool-bottom-desktop"
                  label="AD SLOT BOTTOM — 970×90 / 728×90"
                  className="hidden lg:flex h-20"
                />
              </div>

              {/* 右側廣告（桌機） */}
              <div className="hidden lg:block">
                <AdSlot
                  slotId="tool-sidebar-right"
                  label="AD SLOT RIGHT — 300×600"
                  className="w-full h-[600px]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 手機 Sticky 底部廣告 */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
        <div className="max-w-screen-sm mx-auto px-3 pb-2">
          <AdSlot
            slotId="tool-sticky-mobile"
            label="AD STICKY MOBILE — 320×50"
            className="h-12 shadow-lg"
          />
        </div>
      </div>

      {/* Footer 跟首頁共用風格 */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Wise<span className="text-blue-600">Convert</span>
            </span>
            © {new Date().getFullYear()}
          </div>

          <div className="flex items-center gap-5">
            <a className="hover:text-blue-600" href="#">
              {t("footer.privacy")}
            </a>
            <a className="hover:text-blue-600" href="#">
              {t("footer.terms")}
            </a>
            <a className="hover:text-blue-600" href="#">
              {t("footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}