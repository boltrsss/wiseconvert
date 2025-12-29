import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";

// ✅ 全站 Header（若 build error，只需要改這行路徑）
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "WiseConvert - Online File Converter",
  description:
    "Convert videos, audio, images, documents and PDFs with WiseConvert, a fast and secure online file converter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <LanguageProvider>
          {/* ✅ 全站一致 Header */}
          <Header />

          {/* Page content */}
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
