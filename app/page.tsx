// app/page.tsx
"use client"; // ✅ 這頁要用 hook，所以是 client component

import React from "react";
import { AdSlot } from "@/components/AdSlot";
import FileUpload from "@/components/FileUpload";
import { useLang } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";

export default function HomePage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
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
            <a href="#converter" className="hover:text-blue-600">
              {t("navbar.convert")}
            </a>
            <a href="#how-it-works" className="hover:text-blue-600">
              {t("navbar.how_it_works")}
            </a>
            <a href="#why" className="hover:text-blue-600">
              {t("navbar.why")}
            </a>
            <a href="#pricing" className="hover:text-blue-600">
              {t("navbar.pricing")}
            </a>
            {/* ✅ 新增：直接連到 /tools 的 All tools */}
            <Link href="/tools" className="hover:text-blue-600">
              {t("navbar.all_tools")}
            </Link>
          </nav>

          {/* 右側：登入 / 註冊 + 語言切換 */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-[16px] font-medium">
              <button className="px-4 py-1.5 rounded-lg hover:bg-slate-100">
                {t("auth.login")}
              </button>
              <button className="px-5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                {t("auth.signup")}
              </button>
            </div>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* main 加 padding-bottom，避免被手機 Sticky 廣告遮住 */}
      <main className="flex-1 pb-20 lg:pb-0">
        {/* ===== File Converter 主區塊 ===== */}
        <section
          id="converter"
          className="bg-slate-50 border-b border-slate-200"
        >
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
            {/* Title */}
            <div className="text-center mb-6 lg:mb-8">
              <h1 className="text-4xl sm:text-[42px] font-semibold text-slate-900">
                {t("hero.title")}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                {t("hero.subtitle")}
              </p>
            </div>

            {/* 手機版頂部廣告（桌機隱藏） */}
            <div className="mb-4 lg:hidden">
              <AdSlot
                slotId="top-mobile"
                label="AD TOP MOBILE — 320×100"
                className="h-16"
              />
            </div>

            {/* 三欄：左廣告 / 中央工具 / 右廣告（桌機） */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] gap-4 lg:gap-6">
              {/* 左側大廣告（桌機） */}
              <div className="hidden lg:block">
                <AdSlot
                  slotId="sidebar-left"
                  label="AD SLOT LEFT — 300×600"
                  className="w-full h-[600px]"
                />
              </div>

              {/* 中央內容 */}
              <div className="space-y-4 lg:space-y-5">
                {/* 上方橫幅廣告（桌機） */}
                <AdSlot
                  slotId="top-desktop"
                  label="AD SLOT TOP — 970×90 / 728×90"
                  className="hidden lg:flex h-20"
                />

                {/* Uploader Card */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm px-4 sm:px-8 py-6">
                  <FileUpload />
                </div>

                {/* 手機版：內容中間一個 banner（桌機隱藏） */}
                <div className="lg:hidden">
                  <AdSlot
                    slotId="in-content-mobile"
                    label="AD IN-CONTENT MOBILE — 320×100"
                    className="h-20"
                  />
                </div>

                {/* 下方橫幅（桌機） */}
                <AdSlot
                  slotId="bottom-desktop"
                  label="AD SLOT BOTTOM — 970×90 / 728×90"
                  className="hidden lg:flex h-20"
                />
              </div>

              {/* 右側大廣告（桌機） */}
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

        {/* ===== Why WiseConvert ===== */}
        <section
          id="why"
          className="py-12 lg:py-14 bg-white border-b border-slate-200"
        >
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">
              {t("why.title")}
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 text-lg">
                  ⚡
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {t("why.fast_title")}
                </h3>
                <p className="text-sm text-slate-500">
                  {t("why.fast_desc")}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4 text-lg">
                  🔒
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {t("why.privacy_title")}
                </h3>
                <p className="text-sm text-slate-500">
                  {t("why.privacy_desc")}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 text-lg">
                  🧰
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {t("why.all_in_one_title")}
                </h3>
                <p className="text-sm text-slate-500">
                  {t("why.all_in_one_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section
          id="how-it-works"
          className="py-12 lg:py-14 bg-slate-50 border-b border-slate-200"
        >
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-8">
              {t("how_it_works.title")}
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  titleKey: "how_it_works.step1_title",
                  descKey: "how_it_works.step1_desc",
                },
                {
                  step: 2,
                  titleKey: "how_it_works.step2_title",
                  descKey: "how_it_works.step2_desc",
                },
                {
                  step: 3,
                  titleKey: "how_it_works.step3_title",
                  descKey: "how_it_works.step3_desc",
                },
                {
                  step: 4,
                  titleKey: "how_it_works.step4_title",
                  descKey: "how_it_works.step4_desc",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-white border border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold">
                      {item.step}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">
                      {t(item.titleKey)}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    {t(item.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="pricing" className="py-12 lg:py-14 bg-white">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-8">
              {t("pricing.title")}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {t("pricing.free_title")}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {t("pricing.free_desc")}
                </p>
                <p className="text-3xl font-bold">
                  {t("pricing.free_price")}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>{t("pricing.free_benefit1")}</li>
                  <li>{t("pricing.free_benefit2")}</li>
                  <li>{t("pricing.free_benefit3")}</li>
                </ul>
              </div>

              {/* Pro */}
              <div className="p-6 rounded-2xl bg-slate-900 text-slate-100">
                <h3 className="text-lg font-semibold mb-2">
                  {t("pricing.pro_title")}
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  {t("pricing.pro_desc")}
                </p>
                <p className="text-3xl font-bold">
                  {t("pricing.pro_price")}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  <li>{t("pricing.pro_benefit1")}</li>
                  <li>{t("pricing.pro_benefit2")}</li>
                  <li>{t("pricing.pro_benefit3")}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 手機 Sticky 底部廣告（全站共用） */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
        <div className="max-w-screen-sm mx-auto px-3 pb-2">
          <AdSlot
            slotId="sticky-mobile"
            label="AD STICKY MOBILE — 320×50"
            className="h-12 shadow-lg"
          />
        </div>
      </div>

      {/* Footer */}
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
