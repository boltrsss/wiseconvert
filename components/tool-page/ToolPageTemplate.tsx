// components/tool-page/ToolPageTemplate.tsx
import React from "react";
import { AdSlot } from "@/components/AdSlot";

type ToolPageTemplateProps = {
  hero?: React.ReactNode;
  workspace: React.ReactNode;

  // 仍保留這個 prop，方便你沿用既有 ToolSidebar 元件
  // 但不再做右側欄：會被渲染到主欄位的下方（FreeConvert 風格）
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
      <div
        className={[
          "mx-auto w-full",
          "max-w-[1200px] xl:max-w-[1280px]",
          "px-4 sm:px-6 lg:px-8",
        ].join(" ")}
      >
        {/* Hero */}
        <div className="pt-6">{hero ?? null}</div>

        {/* Top Ad */}
        {showAds ? (
          <div className="mt-4">{topAd ?? <AdSlot slotId="tool-top" />}</div>
        ) : null}

        {/* Single column flow (FreeConvert-like) */}
        <div className={["mt-6 space-y-8", contentClassName || ""].join(" ")}>
          {/* Workspace */}
          <div className="min-w-0">{workspace}</div>

          {/* “Sidebar” content becomes below sections */}
          {sidebar ? <div>{sidebar}</div> : null}

          {/* Middle Ad */}
          {showAds ? (
            <div>{middleAd ?? <AdSlot slotId="tool-middle" />}</div>
          ) : null}

          {/* SEO Block */}
          {seo ? <div>{seo}</div> : null}

          {/* Bottom Ad */}
          {showAds ? (
            <div className="pb-12">{bottomAd ?? <AdSlot slotId="tool-bottom" />}</div>
          ) : (
            <div className="pb-12" />
          )}
        </div>
      </div>
    </div>
  );
}
