// components/tool-page/ToolPageTemplate.tsx
import React from "react";
import { AdSlot } from "@/components/AdSlot";

type ToolPageTemplateProps = {
  hero?: React.ReactNode;

  // Main tool UI
  workspace: React.ReactNode;

  // Extra sections (Tool info / tips / related) -> still allowed, shown under workspace
  sidebar?: React.ReactNode;

  seo?: React.ReactNode;

  showAds?: boolean;
  topAd?: React.ReactNode;
  middleAd?: React.ReactNode;
  bottomAd?: React.ReactNode;

  containerClassName?: string;
  contentClassName?: string;
};

export default function ToolPageTemplate({
  hero,
  workspace,
  sidebar,
  seo,
  showAds = true,
  topAd,
  middleAd,
  bottomAd,
  containerClassName,
  contentClassName,
}: ToolPageTemplateProps) {
  return (
    <div className={["w-full", containerClassName || ""].join(" ")}>
      {/* Same “homepage feel”: wide canvas with side gutters for ads */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Hero (title/desc) */}
        <div className="pt-8">{hero ?? null}</div>

        {/* 3-column layout: Left Ad / Center Content / Right Ad */}
        <div
          className={[
            "mt-6 grid gap-6 items-start",
            "xl:grid-cols-[300px_minmax(0,1fr)_300px]",
            contentClassName || "",
          ].join(" ")}
        >
          {/* Left Ad (desktop only) */}
          {showAds ? (
            <aside className="hidden xl:block">
              <AdSlot slotId="tool-left" />
            </aside>
          ) : (
            <aside className="hidden xl:block" />
          )}

          {/* Center column */}
          <main className="min-w-0">
            {/* Top Ad (center) */}
            {showAds ? (
              <div className="mb-6">{topAd ?? <AdSlot slotId="tool-top" />}</div>
            ) : null}

            {/* Tool workspace */}
            <div>{workspace}</div>

            {/* Below-workspace sections (info/tips/related) */}
            {sidebar ? <div className="mt-8">{sidebar}</div> : null}

            {/* Middle Ad (center) */}
            {showAds ? (
              <div className="mt-8">{middleAd ?? <AdSlot slotId="tool-middle" />}</div>
            ) : null}

            {/* SEO */}
            {seo ? <div className="mt-10">{seo}</div> : null}

            {/* Bottom Ad (center) */}
            {showAds ? (
              <div className="mt-10 pb-12">{bottomAd ?? <AdSlot slotId="tool-bottom" />}</div>
            ) : (
              <div className="pb-12" />
            )}
          </main>

          {/* Right Ad (desktop only) */}
          {showAds ? (
            <aside className="hidden xl:block">
              <AdSlot slotId="tool-right" />
            </aside>
          ) : (
            <aside className="hidden xl:block" />
          )}
        </div>
      </div>
    </div>
  );
}
