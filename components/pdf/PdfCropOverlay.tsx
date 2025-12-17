"use client";

import React, { useMemo, useRef, useState } from "react";

type Crop = {
  x: number;
  y: number;
  w: number;
  h: number;
};

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
  let x = r.x;
  let y = r.y;
  let w = Math.max(minW, r.w);
  let h = Math.max(minH, r.h);

  // w/h 先不能超出頁面
  w = Math.min(w, pageW);
  h = Math.min(h, pageH);

  // 再確保整個框都在頁內
  x = Math.max(0, Math.min(pageW - w, x));
  y = Math.max(0, Math.min(pageH - h, y));

  return { x, y, w, h };
}

export default function PdfCropOverlay({ pageWidth, pageHeight, value, onChange }: Props) {
  const [drag, setDrag] = useState<DragState>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const handles = useMemo(
    () => [
      { dir: "nw" as const, style: { left: -6, top: -6, cursor: "nwse-resize" } },
      { dir: "ne" as const, style: { right: -6, top: -6, cursor: "nesw-resize" } },
      { dir: "sw" as const, style: { left: -6, bottom: -6, cursor: "nesw-resize" } },
      { dir: "se" as const, style: { right: -6, bottom: -6, cursor: "nwse-resize" } },
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
      onChange(
        clampRect(
          { ...drag.base, x: drag.base.x + dx, y: drag.base.y + dy },
          pageWidth,
          pageHeight
        )
      );
      return;
    }

    // resize
    let { x, y, w, h } = drag.base;
    const dir = drag.dir;

    if (dir === "se") {
      w = drag.base.w + dx;
      h = drag.base.h + dy;
    } else if (dir === "sw") {
      x = drag.base.x + dx;
      w = drag.base.w - dx;
      h = drag.base.h + dy;
    } else if (dir === "ne") {
      y = drag.base.y + dy;
      w = drag.base.w + dx;
      h = drag.base.h - dy;
    } else if (dir === "nw") {
      x = drag.base.x + dx;
      y = drag.base.y + dy;
      w = drag.base.w - dx;
      h = drag.base.h - dy;
    }

    onChange(clampRect({ x, y, w, h }, pageWidth, pageHeight));
  };

  const endDrag = () => setDrag(null);

  return (
    <div
      ref={boxRef}
      style={{
        position: "absolute",
        left: value.x,
        top: value.y,
        width: value.w,
        height: value.h,
        border: "2px dashed #2563eb",
        background: "rgba(37, 99, 235, 0.08)",
        boxSizing: "border-box",
        touchAction: "none", // ✅ mobile 必加
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
            width: 12,
            height: 12,
            background: "#fff",
            border: "2px solid #2563eb",
            borderRadius: 3,
            touchAction: "none",
            ...h.style,
          }}
        />
      ))}
    </div>
  );
}
