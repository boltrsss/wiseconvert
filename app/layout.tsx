
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WiseConvert - Online File Converter",
  description:
    "Convert videos, audio, images, documents and PDFs with WiseConvert, a fast and secure online file converter."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
