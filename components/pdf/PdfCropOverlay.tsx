"use client";

import { useEffect, useRef, useState } from "react";

type Crop = { x: number; y: number; w: number; h: number };

type Props = {
  pageWidth: number;
  pageHeight: number;
  value: Crop;
  onChange: (c: Crop) => void;
  minW?: number;
  minH?: number;
};

type DragMode = "move" | "nw" | "ne" | "sw" | "se";

function clampRect(
  r: Crop,
  pageW: number,
  pageH: number,
  minW = 40,
  minH = 40
): Crop {
  let w = Math.max(minW, r.w);
  let h = Math.max(minH, r.h);

  w = Math.min(w, pageW);
  h = Math.min(h, pageH);

  let x = Math.max(0, Math.min(pageW - w, r.x));
  let y = Math.max(0, Math.min(pageH - h, r.y));

  return { x, y, w, h };
}

export default function PdfCropOverlay({
  pageWidth,
  pageHeight,
  value,
  onChange,
  minW = 40,
  minH = 40,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [dragging, setDragging] = useState(false);
  const modeRef = useRef<DragMode>("move");

  const startRef = useRef<{
    startX: number;
    startY: number;
    rect: Crop;
  } | null>(null);

  const getLocalPoint = (clientX: number, clientY: number) => {
    // parent 是 relative 容器（PdfViewer 外面那個 div）
    const parent = wrapRef.current?.parentElement;
    if (!parent) return { x: clientX, y: clientY };
    const b = parent.getBoundingClientRect();
    return {
      x: clientX - b.left + parent.scrollLeft,
      y: clientY - b.top + parent.scrollTop,
    };
  };

  const begin = (e: React.MouseEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();

    modeRef.current = mode;
    setDragging(true);

    const p = getLocalPoint(e.clientX, e.clientY);
    startRef.current = {
      startX: p.x,
      startY: p.y,
      rect: { ...value },
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !startRef.current) return;

      const p = getLocalPoint(e.clientX, e.clientY);
      const dx = p.x - startRef.current.startX;
      const dy = p.y - startRef.current.startY;

      const base = startRef.current.rect;
      const mode = modeRef.current;

      let next: Crop = { ...base };

      if (mode === "move") {
        next = { ...base, x: base.x + dx, y: base.y + dy };
      } else {
        // resize from corners
        if (mode === "se") {
          next = { ...base, w: base.w + dx, h: base.h + dy };
        }
        if (mode === "sw") {
          next = { ...base, x: base.x + dx, w: base.w - dx, h: base.h + dy };
        }
        if (mode === "ne") {
          next = { ...base, y: base.y + dy, w: base.w + dx, h: base.h - dy };
        }
        if (mode === "nw") {
          next = {
            ...base,
            x: base.x + dx,
            y: base.y + dy,
            w: base.w - dx,
            h: base.h - dy,
          };
        }
      }

      // ✅ clamp 進頁面
      next = clampRect(next, pageWidth, pageHeight, minW, minH);
      onChange(next);
    };

    const onUp = () => {
      setDragging(false);
      startRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onChange, pageWidth, pageHeight, minW, minH]);

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    width: 12,
    height: 12,
    background: "#fff",
    border: "2px solid #2563eb",
    borderRadius: 3,
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        left: value.x,
        top: value.y,
        width: value.w,
        height: value.h,
        border: "2px dashed #2563eb",
        background: "rgba(37, 99, 235, 0.08)",
        cursor: dragging ? "grabbing" : "move",
        boxSizing: "border-box",
        touchAction: "none",
      }}
      onMouseDown={(e) => begin(e, "move")}
    >
      {/* NW */}
      <div
        style={{ ...handleStyle, left: -7, top: -7, cursor: "nwse-resize" }}
        onMouseDown={(e) => begin(e, "nw")}
      />
      {/* NE */}
      <div
        style={{ ...handleStyle, right: -7, top: -7, cursor: "nesw-resize" }}
        onMouseDown={(e) => begin(e, "ne")}
      />
      {/* SW */}
      <div
        style={{ ...handleStyle, left: -7, bottom: -7, cursor: "nesw-resize" }}
        onMouseDown={(e) => begin(e, "sw")}
      />
      {/* SE */}
      <div
        style={{ ...handleStyle, right: -7, bottom: -7, cursor: "nwse-resize" }}
        onMouseDown={(e) => begin(e, "se")}
      />
    </div>
  );
}
