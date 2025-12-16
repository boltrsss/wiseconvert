"use client";

import { useEffect, useRef, useState } from "react";

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

type HandleDir = "nw" | "ne" | "sw" | "se";

const clampRect = (
  r: Crop,
  pageW: number,
  pageH: number,
  minW = 20,
  minH = 20
): Crop => {
  let x = r.x;
  let y = r.y;
  let w = Math.max(minW, r.w);
  let h = Math.max(minH, r.h);

  // w/h 不超出頁面
  w = Math.min(w, pageW);
  h = Math.min(h, pageH);

  // x/y 讓整個框都在頁內
  x = Math.max(0, Math.min(pageW - w, x));
  y = Math.max(0, Math.min(pageH - h, y));

  return { x, y, w, h };
};

export default function PdfCropOverlay({
  pageWidth,
  pageHeight,
  value,
  onChange,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  // drag or resize 狀態
  const modeRef = useRef<null | { type: "drag" } | { type: "resize"; dir: HandleDir }>(null);
  const startRef = useRef<null | { x: number; y: number; rect: Crop }>(null);

  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    const target = e.target as HTMLElement;
    const handle = target.dataset.handle as HandleDir | undefined;

    if (handle) {
      modeRef.current = { type: "resize", dir: handle };
    } else {
      modeRef.current = { type: "drag" };
    }

    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      rect: { ...value },
    };

    setDragging(true);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !startRef.current || !modeRef.current) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    const r0 = startRef.current.rect;
    let next: Crop = { ...r0 };

    if (modeRef.current.type === "drag") {
      next.x = r0.x + dx;
      next.y = r0.y + dy;
    } else {
      const dir = modeRef.current.dir;

      // 東/西：改 w 或 x+w
      if (dir.includes("e")) {
        next.w = r0.w + dx;
      }
      if (dir.includes("w")) {
        next.x = r0.x + dx;
        next.w = r0.w - dx;
      }

      // 南/北：改 h 或 y+h
      if (dir.includes("s")) {
        next.h = r0.h + dy;
      }
      if (dir.includes("n")) {
        next.y = r0.y + dy;
        next.h = r0.h - dy;
      }
    }

    onChange(clampRect(next, pageWidth, pageHeight));
  };

  const onMouseUp = () => {
    setDragging(false);
    startRef.current = null;
    modeRef.current = null;
  };

  // ✅ 只綁一次（不要每次 render 都重綁）
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, pageWidth, pageHeight, value]);

  return (
    <div
      ref={ref}
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
      }}
      onMouseDown={onMouseDown}
    >
      {/* ✅ 四角 resize handles */}
      {(["nw", "ne", "sw", "se"] as const).map((dir) => (
        <div
          key={dir}
          data-handle={dir}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            background: "#fff",
            border: "1px solid #2563eb",
            borderRadius: 2,
            left: dir.includes("w") ? -6 : undefined,
            right: dir.includes("e") ? -6 : undefined,
            top: dir.includes("n") ? -6 : undefined,
            bottom: dir.includes("s") ? -6 : undefined,
            cursor:
              dir === "nw" || dir === "se" ? "nwse-resize" : "nesw-resize",
          }}
        />
      ))}
    </div>
  );
}
