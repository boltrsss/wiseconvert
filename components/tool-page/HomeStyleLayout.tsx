// components/tool-page/HomeStyleLayout.tsx
import React from "react";
import { AdSlot } from "@/components/AdSlot";

type HomeStyleLayoutProps = {
  hero?: React.ReactNode;
  children: React.ReactNode;

  // Optional blocks rendered in center column
  afterMain?: React.ReactNode; // e.g. tool info / tips / related
  seo?: React.ReactNode;

  showAds?: boolean;

  // Allow override ad nodes if needed later
  topAd?: React.ReactNode;
  leftAd?: React.ReactNode;
  rightAd?: React.ReactNode;
  bottomAd?: React.ReactNode;

  containerClassName?: string;
  contentClassName?: string;
};

export default function HomeStyleLayout({
  hero,
  children,
  afterMain,
  seo,
  showAds = true,
  topAd,
  leftAd,
  rightAd,
  bottomAd,
  containerClassName,
  contentClassName,
}: HomeStyleLayoutProps) {
  return (
    <div className={["w-full", containerClassName || ""].join(" ")}>
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {hero ? <div className="pt-8">{hero}</div> : <div className="pt-8" />}

        <div
          className={[
            "mt-6 grid gap-6 items-start",
            "xl:grid-cols-[300px_minmax(0,1fr)_300px]",
            contentClassName || "",
          ].join(" ")}
        >
          {/* Left Ad (desktop only) */}
          <aside className="hidden xl:block">
            {showAds ? leftAd ?? <AdSlot slotId="home-left" /> : null}
          </aside>

          {/* Center */}
          <main className="min-w-0">
            {/* Top Ad */}
            {showAds ? (
              <div className="mb-6">{topAd ?? <AdSlot slotId="home-top" />}</div>
            ) : null}

            {/* Main content */}
            {children}

            {/* After-main blocks */}
            {afterMain ? <div className="mt-8">{afterMain}</div> : null}

            {/* SEO */}
            {seo ? <div className="mt-10">{seo}</div> : null}

            {/* Bottom Ad */}
            {showAds ? (
              <div className="mt-10 pb-12">
                {bottomAd ?? <AdSlot slotId="home-bottom" />}
              </div>
            ) : (
              <div className="pb-12" />
            )}
          </main>

          {/* Right Ad (desktop only) */}
          <aside className="hidden xl:block">
            {showAds ? rightAd ?? <AdSlot slotId="home-right" /> : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
