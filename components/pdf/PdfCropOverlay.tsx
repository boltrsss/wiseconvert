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

type DragMode =
  | { kind: "move"; startX: number; startY: number; base: Crop }
  | { kind: "resize"; dir: string; startX: number; startY: number; base: Crop }
  | null;

function clampRect(
  r: Crop,
  pageW: number,
  pageH: number,
  minW = 40,
  minH = 40
): Crop {
  let x = r.x;
  let y = r.y;
  let w = Math.max(minW, r.w);
  let h = Math.max(minH, r.h);

  w = Math.min(w, pageW);
  h = Math.min(h, pageH);

  x = Math.max(0, Math.min(pageW - w, x));
  y = Math.max(0, Math.min(pageH - h, y));

  return { x, y, w, h };
}

export default function PdfCropOverlay({ pageWidth, pageHeight, value, onChange }: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragMode>(null);

  const handles = useMemo(
    () => [
      { dir: "nw", style: { left: -6, top: -6, cursor: "nwse-resize" } },
      { dir: "ne", style: { right: -6, top: -6, cursor: "nesw-resize" } },
      { dir: "sw", style: { left: -6, bottom: -6, cursor: "nesw-resize" } },
      { dir: "se", style: { right: -6, bottom: -6, cursor: "nwse-resize" } },
    ],
    []
  );

  const onPointerDownMove = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ kind: "move", startX: e.clientX, startY: e.clientY, base: value });
  };

  const onPointerDownHandle = (dir: string) => (e: React.PointerEvent) => {
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
      const next = clampRect(
        { ...drag.base, x: drag.base.x + dx, y: drag.base.y + dy },
        pageWidth,
        pageHeight
      );
      onChange(next);
      return;
    }

    // resize
    let { x, y, w, h } = drag.base;
    const dir = drag.dir;

    // 依方向調整
    if (dir.includes("e")) w = drag.base.w + dx;
    if (dir.includes("s")) h = drag.base.h + dy;
    if (dir.includes("w")) {
      x = drag.base.x + dx;
      w = drag.base.w - dx;
    }
    if (dir.includes("n")) {
      y = drag.base.y + dy;
      h = drag.base.h - dy;
    }

    const next = clampRect({ x, y, w, h }, pageWidth, pageHeight);
    onChange(next);
  };

  const onPointerUp = () => setDrag(null);

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
        touchAction: "none", // ✅ mobile 必加，不然會被捲動/縮放吃掉
        boxSizing: "border-box",
      }}
      onPointerDown={onPointerDownMove}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {handles.map((h) => (
        <div
          key={h.dir}
          onPointerDown={onPointerDownHandle(h.dir)}
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
