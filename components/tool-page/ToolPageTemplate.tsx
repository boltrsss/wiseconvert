// components/tool-page/ToolPageTemplate.tsx
import React from "react";
import { AdSlot } from "@/components/AdSlot";

type ToolPageTemplateProps = {
  hero?: React.ReactNode;
  workspace: React.ReactNode;
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
  const hasSidebar = !!sidebar;

  return (
    <div className={["w-full", containerClassName || ""].join(" ")}>
      <div
        className={[
          "mx-auto w-full",
          "max-w-[1200px] xl:max-w-[1280px]",
          "px-4 sm:px-6 lg:px-8",
        ].join(" ")}
      >
        {/* Hero */}
        <div className="pt-6">{hero ?? null}</div>

        {/* Top Ad (full width) */}
        {showAds ? (
          <div className="mt-4">
            {topAd ?? <AdSlot slotId="tool-top" />}
          </div>
        ) : null}

        {/* Main Grid */}
        <div
          className={[
            "mt-6 grid gap-6 items-start",
            hasSidebar ? "xl:grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1",
            contentClassName || "",
          ].join(" ")}
        >
          {/* Left column */}
          <div className="min-w-0">
            {workspace}

            {/* Middle Ad (put inside left column so sticky range is long enough) */}
            {showAds ? (
              <div className="mt-8">
                {middleAd ?? <AdSlot slotId="tool-middle" />}
              </div>
            ) : null}

            {/* SEO Block */}
            {seo ? <div className="mt-10">{seo}</div> : null}

            {/* Bottom Ad */}
            {showAds ? (
              <div className="mt-10 pb-12">
                {bottomAd ?? <AdSlot slotId="tool-bottom" />}
              </div>
            ) : null}
          </div>

          {/* Right column: Sidebar
              - Sticky only on xl+
              - Smaller top gap
              - Constrain height + allow internal scroll so bottom is reachable
           */}
          {hasSidebar ? (
            <aside
              className={[
                "w-full",
                "xl:sticky xl:top-16",
                "xl:max-h-[calc(100vh-4rem)]",
                "xl:overflow-auto",
                "xl:pr-1",
              ].join(" ")}
            >
              {sidebar}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
