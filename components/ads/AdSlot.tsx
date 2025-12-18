// components/ads/AdSlot.tsx
import React from "react";

type AdSlotVariant = "top" | "middle" | "bottom" | "sidebar";

type AdSlotProps = {
  variant: AdSlotVariant;
  className?: string;
  label?: string; // optional custom label
};

const variantHeights: Record<AdSlotVariant, string> = {
  top: "min-h-[90px]",
  middle: "min-h-[100px]",
  bottom: "min-h-[90px]",
  sidebar: "min-h-[250px]",
};

export default function AdSlot({ variant, className, label }: AdSlotProps) {
  const heightClass = variantHeights[variant];

  return (
    <div
      className={[
        "w-full",
        heightClass,
        "rounded-2xl",
        "border border-dashed border-gray-300",
        "bg-gray-50",
        "flex items-center justify-center",
        "text-xs text-gray-500",
        "select-none",
        className || "",
      ].join(" ")}
      aria-label={`ad-slot-${variant}`}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="font-medium text-gray-600">
          {label ?? `Ad Placeholder (${variant})`}
        </div>
        <div className="text-[11px] text-gray-400">
          (Phase 3: Adsense / Network integration)
        </div>
      </div>
    </div>
  );
}
