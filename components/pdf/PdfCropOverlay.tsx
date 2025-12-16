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

export default function PdfCropOverlay({
  pageWidth,
  pageHeight,
  value,
  onChange,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    onChange({
      ...value,
      x: Math.max(0, value.x + dx),
      y: Math.max(0, value.y + dy),
    });

    setStart({ x: e.clientX, y: e.clientY });
  };


  const clampRect = (
  r: { x: number; y: number; w: number; h: number },
  pageW: number,
  pageH: number,
  minW = 20,
  minH = 20
) => {
  let x = r.x;
  let y = r.y;
  let w = Math.max(minW, r.w);
  let h = Math.max(minH, r.h);

  // 先確保 w/h 不超出頁面
  w = Math.min(w, pageW);
  h = Math.min(h, pageH);

  // 再 clamp x/y，確保整個框都在頁內
  x = Math.max(0, Math.min(pageW - w, x));
  y = Math.max(0, Math.min(pageH - h, y));

  return { x, y, w, h };
};


  const onMouseUp = () => {
    setDragging(false);
    setStart(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

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
        cursor: "move",
      }}
      onMouseDown={onMouseDown}
    />
  );
}
