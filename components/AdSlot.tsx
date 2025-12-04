// components/AdSlot.tsx
import React from "react";

interface AdSlotProps {
  /** 自己用來辨識這個廣告位，例如 "top-desktop", "sidebar-left" */
  slotId: string;
  /** 目前用來顯示在畫面上的文字，之後可以刪掉換成真正廣告 */
  label?: string;
  /** 額外 Tailwind 樣式，例如 hidden lg:flex 等 */
  className?: string;
}

/**
 * 統一的廣告占位元件。
 * 之後你要接 AdSense，只要把內部內容換掉即可，不用改版面。
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  label,
  className = "",
}) => {
  const base =
    "flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-[11px] text-slate-400";

  return (
    <div data-ad-slot={slotId} className={`${base} ${className}`}>
      {/* 之後改成真正廣告 script / <ins> 即可 */}
      {label ?? slotId}
    </div>
  );
};