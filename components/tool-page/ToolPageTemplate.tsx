// components/tool-page/ToolPageTemplate.tsx
import React from "react";
import AdSlot from "@/components/ads/AdSlot";

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
        className="
          mx-auto w-full
          max-w-[1200px] xl:max-w-[1280px]
          px-4 sm:px-6 lg:px-8
        "
      >
        {/* Hero */}
        {hero ? <div className="pt-6">{hero}</div> : <div className="pt-6" />}

        {/* Top Ad (full width) */}
        {showAds && <div className="mt-4">{topAd ?? <AdSlot variant="top" />}</div>}

        {/* Main Grid */}
        <div
          className={[
            "mt-6 grid gap-6 items-start",
            hasSidebar ? "xl:grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1",
            contentClassName || "",
          ].join(" ")}
        >
          {/* Left column */}
