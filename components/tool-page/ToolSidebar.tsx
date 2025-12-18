// components/tool-page/ToolSidebar.tsx
import React from "react";
import { AdSlot } from "@/components/AdSlot";


type SidebarSection = {
  title: string;
  content: React.ReactNode;
};

type ToolSidebarProps = {
  // Optional custom sections (tips, related tools, etc.)
  sections?: SidebarSection[];

  // Show sidebar ad placeholder
  showAd?: boolean;

  className?: string;
};

export default function ToolSidebar({
  sections,
  showAd = true,
  className,
}: ToolSidebarProps) {
  return (
    <div className={["w-full space-y-4", className || ""].join(" ")}>
      {/* Sidebar Ad */}
      {showAd ? (
  <div className="rounded-2xl border border-gray-200 bg-white p-3">
    <div className="mb-2 text-xs font-medium text-gray-600">
      Sponsored
    </div>
    <div className="min-h-[250px]">
      <AdSlot slotId="tool-sidebar" />
    </div>
  </div>
) : null}
      {/* Sections */}
      {sections && sections.length > 0
        ? sections.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="text-sm font-semibold text-gray-900">
                {s.title}
              </div>
              <div className="mt-3 text-sm text-gray-600">{s.content}</div>
            </div>
          ))
        : // Default placeholders (so sidebar doesn't look empty)
          [
            <div
              key="related-tools"
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="text-sm font-semibold text-gray-900">
                Related tools
              </div>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="hover:text-gray-900 hover:underline cursor-pointer">
                  PDF Merge
                </li>
                <li className="hover:text-gray-900 hover:underline cursor-pointer">
                  PDF Split
                </li>
                <li className="hover:text-gray-900 hover:underline cursor-pointer">
                  PDF Rotate
                </li>
                <li className="hover:text-gray-900 hover:underline cursor-pointer">
                  PDF Compress
                </li>
              </ul>
              <div className="mt-3 text-xs text-gray-400">
                (Placeholder — Phase 3 will auto-generate from registry)
              </div>
            </div>,
            <div
              key="tips"
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="text-sm font-semibold text-gray-900">Tips</div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                <li>Files are processed securely.</li>
                <li>Keep your browser tab open during conversion.</li>
                <li>Large files may take longer to finish.</li>
              </ul>
              <div className="mt-3 text-xs text-gray-400">
                (Placeholder — Phase 3 will be tool-specific)
              </div>
            </div>,
          ]}

      {/* Small footer note */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-xs text-gray-500">
          More sidebar modules (FAQ links, limits, guides) will be added in Phase
          3.
        </div>
      </div>
    </div>
  );
}
