import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";

// ✅ 新增：全站 Header
import Header from "@/components/layout/Header";

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
          <Header />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
