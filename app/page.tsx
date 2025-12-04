// app/page.tsx
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base">
              W
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              Wise<span className="text-blue-600">Convert</span>
            </span>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-600">
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

          <div className="hidden md:flex items-center gap-4 text-[15px] font-medium">
            <button className="px-4 py-2 rounded-lg hover:bg-slate-100">
              Log in
            </button>
            <button className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ===== File Converter 主區塊 ===== */}
        <section
          id="converter"
          className="bg-slate-50 border-b border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900">
                File Converter
              </h1>
              <p className="mt-4 text-lg text-slate-500">
                Easily convert files from one format to another, online.
              </p>
            </div>

            {/* 三欄：左廣告 / 中央工具 / 右廣告 */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_280px] gap-6">
              {/* 左側大廣告（桌機） */}
              <div className="hidden lg:block">
                <div className="w-full h-[600px] rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                  AD SLOT LEFT — 300×600
                </div>
              </div>

              {/* 中央內容 */}
              <div className="space-y-6">
                {/* 上方橫幅廣告 */}
                <div className="w-full h-24 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                  AD SLOT TOP — 970×90 / 728×90
                </div>

                {/* ===== Uploader Card ===== */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  {/* Dropzone */}
                  <div className="border-b border-slate-200 bg-slate-50">
                    <div className="px-6 sm:px-10 py-12 sm:py-16">
                      <div className="mx-auto max-w-xl">
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-white/60 p-10 flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                            <svg
                              className="w-8 h-8 text-blue-600"
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

                          <p className="text-lg font-semibold text-slate-900">
                            Drag &amp; drop files here
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            or{" "}
                            <span className="text-blue-600 font-semibold cursor-pointer">
                              Choose Files
                            </span>
                          </p>

                          <input type="file" className="hidden" />

                          <p className="mt-4 text-xs text-slate-400">
                            Max file size 1GB. No watermarks. By proceeding, you
                            agree to our Terms of Use.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 底部設定列 */}
                  <div className="px-6 sm:px-10 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                          Convert to
                        </span>
                        <select className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-blue-500">
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

                      <button className="inline-flex justify-center items-center rounded-lg bg-blue-600 text-white text-sm font-semibold px-8 py-3 hover:bg-blue-700">
                        Start conversion
                      </button>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-sm text-slate-400">
                        Your uploaded files will appear here.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 下方橫幅 */}
                <div className="w-full h-24 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                  AD SLOT BOTTOM — 970×90 / 728×90
                </div>
              </div>

              {/* 右側大廣告 */}
              <div className="hidden lg:block">
                <div className="w-full h-[600px] rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                  AD SLOT RIGHT — 300×600
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Why WiseConvert ===== */}
        <section id="why" className="py-14 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-slate-900 mb-6">
              Why choose WiseConvert?
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 text-lg">
                  ⚡
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  Fast cloud processing
                </h3>
                <p className="text-sm text-slate-500">
                  High-performance servers convert your files quickly.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4 text-lg">
                  🔒
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  Privacy-first
                </h3>
                <p className="text-sm text-slate-500">
                  Files are encrypted and auto-deleted after a short period.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 text-lg">
                  🧰
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  All-in-one toolset
                </h3>
                <p className="text-sm text-slate-500">
                  Convert images, videos, audio and documents in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section
          id="how-it-works"
          className="py-14 bg-slate-50 border-b border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-slate-900 mb-10">
              How it works
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  title: "Upload your files",
                  desc: "Browse or drag & drop.",
                },
                {
                  step: 2,
                  title: "Choose output format",
                  desc: "Pick JPG, MP4, PDF, MP3 and more.",
                },
                {
                  step: 3,
                  title: "Convert in the cloud",
                  desc: "Fast servers do the heavy work.",
                },
                {
                  step: 4,
                  title: "Download instantly",
                  desc: "Your files will be ready in seconds.",
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
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="pricing" className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-slate-900 mb-8">
              Start free. Upgrade later.
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Free
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Ideal for most users.
                </p>
                <p className="text-3xl font-bold">$0</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>✓ 1GB max file size</li>
                  <li>✓ Standard conversion speed</li>
                  <li>✓ Basic tools</li>
                </ul>
              </div>

              {/* Pro */}
              <div className="p-6 rounded-2xl bg-slate-900 text-slate-100">
                <h3 className="text-lg font-semibold mb-2">Pro</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Coming soon — for power users.
                </p>
                <p className="text-3xl font-bold">$19</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  <li>✓ Faster conversions</li>
                  <li>✓ Higher file limits</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Wise<span className="text-blue-600">Convert</span>
            </span>
            © {new Date().getFullYear()}
          </div>

          <div className="flex items-center gap-6">
            <a className="hover:text-blue-600" href="#">
              Privacy
            </a>
            <a className="hover:text-blue-600" href="#">
              Terms
            </a>
            <a className="hover:text-blue-600" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
