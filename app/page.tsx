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
            <a href="#tools" className="hover:text-blue-600">
              Tools
            </a>
            <a href="#how-it-works" className="hover:text-blue-600">
              How it works
            </a>
            <a href="#features" className="hover:text-blue-600">
              Why WiseConvert
            </a>
            <a href="#pricing" className="hover:text-blue-600">
              Pricing
            </a>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 text-sm font-medium">
            <button className="px-3 py-1.5 rounded-lg hover:bg-slate-100">
              Log in
            </button>
            <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Sign up
            </button>
          </div>
        </div>

        {/* 🟡 Ad Slot 1 – Navbar 下方 728x90 橫幅（桌機） */}
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="h-16 rounded-xl border border-dashed border-slate-300 bg-white/60 flex items-center justify-center text-[11px] text-slate-400">
              {/* 將來放廣告 script，例如 AdSense 728x90 */}
              AD SLOT #1 — 728×90 banner
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {/* Hero / Uploader */}
<section className="bg-gradient-to-b from-white to-slate-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    {/* Left: text */}
    <div>
      <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        New — All-in-one online file converter
      </p>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
        Convert any file <span className="text-blue-600">in seconds</span>.
      </h1>
      <p className="text-slate-600 text-base sm:text-lg mb-6">
        WiseConvert lets you convert images, videos, audio and documents
        with a simple drag &amp; drop interface. Fast, secure and free to start.
      </p>

      <ul className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-600 mb-8">
        <li className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">
            ✓
          </span>
          No signup required
        </li>
        <li className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">
            ✓
          </span>
          Files auto-delete after 24 hours*
        </li>
        <li className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">
            ✓
          </span>
          Supports images, videos, audio &amp; docs
        </li>
      </ul>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex -space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-slate-200 border border-white" />
          <div className="w-6 h-6 rounded-full bg-slate-200 border border-white" />
          <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[10px]">
            +1k
          </div>
        </div>
        <span>Trusted by creators, marketers and developers worldwide.</span>
      </div>
    </div>

    {/* Right: uploader + Ad slot 2 */}
    <div className="space-y-4">
      {/* Uploader card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-7">
        {/* Tabs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-4">
          <button className="px-3 py-1.5 rounded-full bg-slate-900 text-white">
            All files
          </button>
          <button className="px-3 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">
            Images
          </button>
          <button className="px-3 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">
            Videos
          </button>
          <button className="px-3 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">
            Audio
          </button>
          <button className="px-3 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">
            Documents
          </button>
        </div>

        {/* Dropzone（之後可以換成你的 UploadDropzone / FileUpload component） */}
        <label className="group flex flex-col items-center justify-center gap-3 text-center border-2 border-dashed border-slate-200 rounded-xl px-4 py-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-blue-600"
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
          <div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">
              Drag &amp; drop files here
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              or{" "}
              <span className="text-blue-600 font-semibold">
                browse from your device
              </span>
            </p>
          </div>
          <input type="file" className="hidden" multiple />
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Max 1 GB per file in free mode. No watermarks.
          </p>
        </label>

        {/* Convert to selector */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Convert to
            </label>
            <div className="relative">
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
          </div>
          <button className="mt-1 sm:mt-5 inline-flex justify-center items-center rounded-lg bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-blue-700 w-full sm:w-auto">
            Start conversion
          </button>
        </div>

        {/* File list placeholder */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Your uploaded files will appear here.
          </p>
        </div>
      </div>

      {/* Ad Slot 2 – Hero 右邊 300x250 */}
      <div className="hidden lg:block">
        <div className="h-64 w-full rounded-xl border border-dashed border-slate-300 bg-white/70 flex items-center justify-center text-[11px] text-slate-400">
          AD SLOT #2 — 300×250 (sidebar)
        </div>
      </div>
    </div>
  </div>

  <p className="mt-2 text-[11px] text-slate-400 text-center">
    * File retention policy can be customized later in settings.
  </p>
</section>


        {/* 🟡 Ad Slot 3 – 文章區中間 970x250 / 728x90 */}
        <section className="py-4 bg-slate-50 border-t border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-24 sm:h-32 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[11px] text-slate-400">
              AD SLOT #3 — 970×250 or 728×90 (in-content banner)
            </div>
          </div>
        </section>

        {/* Top tools */}
        <section
          id="tools"
          className="py-10 lg:py-14 border-b border-slate-200 bg-white"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  Popular conversion tools
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Quick access to the most common file conversions.
                </p>
              </div>
              <a
                href="#"
                className="hidden sm:inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all tools →
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tool cards 略，跟前一版相同 */}
              {/* 你可以照需要增加或修改工具卡片 */}
              {/* 下面只是範例其中一個，其他你可以複製改文字 */}
              <a className="group p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-[11px] font-semibold text-blue-700">
                      IMG
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      JPG to PNG
                    </h3>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    Image
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Preserve quality while converting JPG photos to PNG in
                  seconds.
                </p>
              </a>

              {/* …其餘工具卡片你可以重複上面 pattern */}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-12 lg:py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Why choose WiseConvert?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                A modern conversion experience designed for speed, privacy and
                simplicity.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature cards…（可以沿用之前那版的內容） */}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="py-12 lg:py-16 bg-white border-t border-slate-200"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 同前一版 How it works 區塊 */}
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="py-12 lg:py-16 bg-slate-50 border-t border-slate-200"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 同前一版 Pricing 區塊 */}
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
