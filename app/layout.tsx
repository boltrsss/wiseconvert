// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext"; // ✅ 一定要這行

export const metadata: Metadata = {
  title: "WiseConvert - Free Online File Converter",
  description: "Convert images, videos, audio and documents in your browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* ✅ 在這裡把全站包起來 */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
