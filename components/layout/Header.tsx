"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Header() {
  const { t } = useLang();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Wise<span className="text-blue-600">Convert</span>
          </span>
        </Link>

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
          <Link href="/tools" className="hover:text-blue-600">
            {t("navbar.all_tools")}
          </Link>
        </nav>

        {/* Right side */}
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
  );
}
