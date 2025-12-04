// app/page.tsx
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Wise<span className="text-blue-600">Convert</span>
            </span>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#converter" className="hover:text-blue-600">
              Convert
            </a>
            <a href="#how-it-works" className="hover:text-blue-600">
              How it works
            </a>
            <a href="#why" className="hover:text-blue-600">
              Why WiseConvert
            </a>
            <a href="#pricing" className="hover:text-blue-600">
              Pricing
            </a>
          </nav>

          {/* Right buttons */}
          <div className="hidden md:flex items-center gap-3 text-sm font-medium">
            <button className="px-3 py-1.5 rounded-lg hover:bg-slate-100">
              Log in
            </button>
            <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {/* ===== File Converter 主區塊（含廣告配置） ===== */}
        <section
          id="converter"
          className="bg-slate-50 border-b border-slate-200"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            {/* Title */}
            <div className="text-center mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                File Converter
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-500">
                Easily convert files from one format to another, online.
              </p>
            </div>

            {/* 三欄：左廣告 / 中央轉檔工具 / 右廣告 */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_260px] gap-4 lg:gap-6 items-start">
              {/* 左側直式廣告（桌機才顯示） */}
              <div className="hidden lg:block">
                <div className="w-full h-[520px] rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[11px] text-slate-400">
                  AD SLOT L — 300×600
                </div>
              </div>

              {/* 中央工具＋橫幅廣告 */}
              <div className="space-y-4 lg:space-y-5">
                {/* 上方橫幅廣告 */}
                <div className="w-full h-20 sm:h-24 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[11px] text-slate-400">
                  AD SLOT TOP — 970×90 / 728×90
                </div>

                {/* Uploader 主卡片 */}
                <div className="rounded-2xl border border-slate-200 bg-white">
                  {/* 大型 Dropzone */}
                  <div className="border-b border-dashed border-slate-200 bg-slate-50/60">
                    <div className="px-4 sm:px-8 py-10 sm:py-12">
                      <div className="mx-auto max-w-xl">
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-white/70 px-4 py-8 sm:px-8 sm:py-10 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-7 h-7 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                          </div>

                          <p className="text-base sm:text-lg font-semibold text-slate-900">
                            Drag &amp; drop files here
                          </p>
                          <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            or{" "}
                            <span className="text-blue-600 font-semibold">
                              Choose Files
                            </span>
                          </p>

                          {/* 這裡未來可以改成你的 <FileUpload /> component */}
                          <input type="file" multiple className="hidden" />

                          <p className="mt-3 text-[11px] sm:text-xs text-slate-400">
                            Max file size 1GB. No watermarks. By proceeding,
                            you agree to our Terms of Use.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 下方設定列：格式選擇 + CTA */}
                  <div className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="font-medium text-slate-600">
                          Convert to
                        </span>
                        <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <optgroup label="Images">
                            <option>JPG</option>
                            <option>PNG</option>
                            <option>WEBP</option>
                            <option>HEIC</option>
                          </optgroup>
                          <optgroup label="Videos">
                            <option>MP4</option>
                            <option>MOV</option>
                          </optgroup>
                          <optgroup label="Audio">
                            <option>MP3</option>
                            <option>WAV</option>
                          </optgroup>
                          <optgroup label="Documents">
                            <option>PDF</option>
                          </optgroup>
                        </select>
                      </div>

                      <button className="inline-flex justify-center items-center rounded-lg bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 hover:bg-blue-700">
                        Start conversion
                      </button>
                    </div>

                    {/* 檔案列表 placeholder：之後可以塞 ConversionQueue */}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-400">
                        Your uploaded files will appear here.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 下方橫幅廣告 */}
                <div className="w-full h-20 sm:h-24 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[11px] text-slate-400">
                  AD SLOT BOTTOM — 970×90 / 728×90
                </div>
              </div>

              {/* 右側直式廣告（桌機才顯示） */}
              <div className="hidden lg:block">
                <div className="w-full h-[520px] rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[11px] text-slate-400">
                  AD SLOT R — 300×600
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Why WiseConvert ===== */}
        <section
          id="why"
          className="py-10 lg:py-14 bg-white border-b border-slate-200"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Why choose WiseConvert?
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                A modern conversion experience designed for speed, privacy and
                simplicity.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 text-lg">
                  ⚡
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Fast cloud processing
                </h3>
                <p className="text-xs text-slate-500">
                  Files are processed on high-performance servers so you don’t
                  have to worry about CPU usage or slow devices.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 text-lg">
                  🔒
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Privacy-first by design
                </h3>
                <p className="text-xs text-slate-500">
                  Your files are encrypted in transit. We never use your content
                  for training and auto-delete after a short period.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 text-lg">
                  🧰
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  All-in-one toolset
                </h3>
                <p className="text-xs text-slate-500">
                  Replace dozens of small utilities with one unified interface
                  for images, video, audio and documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section
          id="how-it-works"
          className="py-10 lg:py-14 bg-slate-50 border-b border-slate-200"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                How it works
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                A simple 4-step flow from upload to download.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: 1,
                  title: "Upload your files",
                  desc: "Drag & drop from your desktop or tap to browse from your device.",
                },
                {
                  step: 2,
                  title: "Choose output format",
                  desc: "Pick your desired format, like JPG, PNG, MP4, MP3 or PDF.",
                },
                {
                  step: 3,
                  title: "Convert in the cloud",
                  desc: "Our servers handle all the heavy lifting while you keep working.",
                },
                {
                  step: 4,
                  title: "Download & share",
                  desc: "Get a clean, ready-to-use file you can download or share instantly.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-5 rounded-2xl bg-white border border-slate-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Pricing 簡單 teaser ===== */}
        <section
          id="pricing"
          className="py-10 lg:py-14 bg-white border-b border-slate-200"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Start free. Upgrade when you’re ready.
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Launch with a simple free tier today and add paid plans later.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Free
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Perfect for casual users and testing your funnel.
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-semibold text-slate-900">
                    $0
                  </span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 mb-5">
                  <li>✓ Up to 1 GB per file</li>
                  <li>✓ Standard conversion speed</li>
                  <li>✓ Limited daily conversions</li>
                  <li>✓ All basic tools</li>
                </ul>
                <button className="w-full py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-100">
                  Continue with Free
                </button>
              </div>

              {/* Pro */}
              <div className="p-6 rounded-2xl bg-slate-900 text-slate-50 border border-slate-900 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-blue-600/40 pointer-events-none" />
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  Pro
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                    Coming soon
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  For marketers, creators and power users who need more.
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-semibold">$19</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200 mb-5">
                  <li>✓ Faster conversion queue</li>
                  <li>✓ Larger file sizes</li>
                  <li>✓ Higher daily limits</li>
                  <li>✓ Priority support</li>
                </ul>
                <button className="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600">
                  Join waitlist
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Wise<span className="text-blue-600">Convert</span>
            </span>
            <span>
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-blue-600">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600">
              Terms
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
