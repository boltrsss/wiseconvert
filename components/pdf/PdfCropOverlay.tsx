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
  | { kind: "move"; startX: number; startY: number; base: Crop; pointerId: number }
  | {
      kind: "resize";
      dir: "nw" | "ne" | "sw" | "se";
      startX: number;
      startY: number;
      base: Crop;
      pointerId: number;
    }
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

  // 手機更好按：角點 18x18 + 外擴 hit area
  const handles = useMemo(
    () => [
      { dir: "nw" as const, style: { left: -10, top: -10, cursor: "nwse-resize" } },
      { dir: "ne" as const, style: { right: -10, top: -10, cursor: "nesw-resize" } },
      { dir: "sw" as const, style: { left: -10, bottom: -10, cursor: "nesw-resize" } },
      { dir: "se" as const, style: { right: -10, bottom: -10, cursor: "nwse-resize" } },
    ],
    []
  );

  const beginMove = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = boxRef.current;
    if (!el) return;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

    setDrag({
      kind: "move",
      startX: e.clientX,
      startY: e.clientY,
      base: value,
      pointerId: e.pointerId,
    });
  };

  const beginResize = (dir: "nw" | "ne" | "sw" | "se") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = boxRef.current;
    if (!el) return;

    // 用同一個 overlay 元素 capture（最穩，避免事件不一致）
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

    setDrag({
      kind: "resize",
      dir,
      startX: e.clientX,
      startY: e.clientY,
      base: value,
      pointerId: e.pointerId,
    });
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

  const endDrag = () => {
    setDrag(null);
  };

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
        cursor: drag?.kind === "move" ? "grabbing" : "move",
        touchAction: "none", // ✅ mobile 必加：避免頁面滾動吃掉手勢
        zIndex: 10,
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
            width: 18,
            height: 18,
            background: "#fff",
            border: "2px solid #2563eb",
            borderRadius: 4,
            boxSizing: "border-box",
            touchAction: "none",
            ...h.style,
          }}
        />
      ))}
    </div>
  );
}
