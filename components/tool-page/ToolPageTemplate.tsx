// components/tool-page/ToolPageTemplate.tsx
import React from "react";
import AdSlot from "@/components/ads/AdSlot";

type ToolPageTemplateProps = {
  // Top: Hero area (title/desc/breadcrumbs etc.)
  hero?: React.ReactNode;

  // Main content
  workspace: React.ReactNode;

  // Right sidebar (optional)
  sidebar?: React.ReactNode;

  // SEO content block (optional)
  seo?: React.ReactNode;

  // Control ad slots
  showAds?: boolean;
  topAd?: React.ReactNode;
  middleAd?: React.ReactNode;
  bottomAd?: React.ReactNode;

  // Layout tuning
  containerClassName?: string; // outer container
  contentClassName?: string; // main grid
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
      {/* 🔹 FreeConvert-level wide container */}
      <div
        className="
          mx-auto
          w-full
          max-w-[1200px] xl:max-w-[1280px]
          px-4 sm:px-6 lg:px-8
        "
      >
        {/* Hero */}
        {hero ? <div className="pt-6">{hero}</div> : <div className="pt-6" />}

        {/* Top Ad */}
        {showAds && (
          <div className="mt-4">
            {topAd ?? <AdSlot variant="top" />}
          </div>
        )}

        {/* Main Grid */}
        <div
          className={[
            "mt-6 grid gap-6",
            // Desktop: workspace + sidebar
            "lg:grid-cols-[minmax(0,1fr)_360px]",
            contentClassName || "",
          ].join(" ")}
        >
          {/* Left: Workspace */}
          <div className="min-w-0">
            {workspace}
          </div>

          {/* Right: Sidebar */}
          {sidebar ? (
            <aside className="w-full">
              <div className="lg:sticky lg:top-28">
                {sidebar}
              </div>
            </aside>
          ) : null}
        </div>

        {/* Middle Ad */}
        {showAds && (
          <div className="mt-8">
            {middleAd ?? <AdSlot variant="middle" />}
          </div>
        )}

        {/* SEO Block */}
        {seo ? (
          <div className="mt-10">
            {seo}
          </div>
        ) : null}

        {/* Bottom Ad */}
        {showAds && (
          <div className="mt-10 pb-12">
            {bottomAd ?? <AdSlot variant="bottom" />}
          </div>
        )}
      </div>
    </div>
  );
}
