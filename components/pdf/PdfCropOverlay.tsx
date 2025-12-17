"use client";

import React, { useMemo, useState } from "react";

type Crop = { x: number; y: number; w: number; h: number };

type Props = {
  pageWidth: number;
  pageHeight: number;
  value: Crop;
  onChange: (c: Crop) => void;
};

type DragState =
  | { kind: "move"; startX: number; startY: number; base: Crop }
  | { kind: "resize"; dir: "nw" | "ne" | "sw" | "se"; startX: number; startY: number; base: Crop }
  | null;

function clampRect(r: Crop, pageW: number, pageH: number, minW = 40, minH = 40): Crop {
  let w = Math.max(minW, r.w);
  let h = Math.max(minH, r.h);

  w = Math.min(w, pageW);
  h = Math.min(h, pageH);

  let x = Math.max(0, Math.min(pageW - w, r.x));
  let y = Math.max(0, Math.min(pageH - h, r.y));

  return { x, y, w, h };
}

export default function PdfCropOverlay({ pageWidth, pageHeight, value, onChange }: Props) {
  const [drag, setDrag] = useState<DragState>(null);

  const handles = useMemo(
    () => [
      { dir: "nw" as const, style: { left: -8, top: -8, cursor: "nwse-resize" } },
      { dir: "ne" as const, style: { right: -8, top: -8, cursor: "nesw-resize" } },
      { dir: "sw" as const, style: { left: -8, bottom: -8, cursor: "nesw-resize" } },
      { dir: "se" as const, style: { right: -8, bottom: -8, cursor: "nwse-resize" } },
    ],
    []
  );

  const beginMove = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ kind: "move", startX: e.clientX, startY: e.clientY, base: value });
  };

  const beginResize = (dir: "nw" | "ne" | "sw" | "se") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ kind: "resize", dir, startX: e.clientX, startY: e.clientY, base: value });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (drag.kind === "move") {
      onChange(clampRect({ ...drag.base, x: drag.base.x + dx, y: drag.base.y + dy }, pageWidth, pageHeight));
      return;
    }

    let { x, y, w, h } = drag.base;

    if (drag.dir === "se") {
      w = drag.base.w + dx;
      h = drag.base.h + dy;
    } else if (drag.dir === "sw") {
      x = drag.base.x + dx;
      w = drag.base.w - dx;
      h = drag.base.h + dy;
    } else if (drag.dir === "ne") {
      y = drag.base.y + dy;
      w = drag.base.w + dx;
      h = drag.base.h - dy;
    } else if (drag.dir === "nw") {
      x = drag.base.x + dx;
      y = drag.base.y + dy;
      w = drag.base.w - dx;
      h = drag.base.h - dy;
    }

    onChange(clampRect({ x, y, w, h }, pageWidth, pageHeight));
  };

  const endDrag = () => setDrag(null);

  // ✅ mobile 角落更好按：用 18px（桌面也 OK）
  const handleSize = 18;

  return (
  <div
    style={{
      position: "absolute",
      left: value.x,
      top: value.y,
      width: value.w,
      height: value.h,
      border: "2px solid #2563eb",
      background: "rgba(37, 99, 235, 0.10)",
      boxSizing: "border-box",
      touchAction: "none",
      zIndex: 20, // ✅ 保證 overlay 在 PDF canvas 上面
    }}
    onPointerDown={beginMove}
    onPointerMove={onPointerMove}
    onPointerUp={endDrag}
    onPointerCancel={endDrag}
  >
    {handles.map((h) => (
      <div
        key={h.dir}
        onPointerDown={beginResize(h.dir)}
        style={{
          position: "absolute",
          width: handleSize,
          height: handleSize,
          background: "#fff",
          border: "2px solid #2563eb",
          borderRadius: 6,
          touchAction: "none",
          zIndex: 30, // ✅ handles 再更上層，避免被蓋或不好點
          ...h.style,
        }}
      />
    ))}
  </div>
);

}
