"use client";

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Props = {
  fileUrl: string;
  onPageSize?: (size: { width: number; height: number; scale: number }) => void;
  pageNumber?: number;
  scale?: number;
};

export default function PdfViewer({
  fileUrl,
  onPageSize,
  pageNumber = 1,
  scale = 1.2,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: any = null;
    let loadingTask: any = null;

    const run = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        loadingTask = pdfjsLib.getDocument({ url: fileUrl, withCredentials: false });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });

        onPageSize?.({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
          scale,
        });

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        // ✅ 讓座標系統保持 CSS px（overlay 同步）
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        // ✅ reset（避免累積）
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ✅ 以 CSS px render
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
      } catch (err) {
        console.error("[PdfViewer] render error:", err);
      }
    };

    run();

    return () => {
      cancelled = true;
      try { renderTask?.cancel?.(); } catch {}
      try { loadingTask?.destroy?.(); } catch {}
    };
  }, [fileUrl, pageNumber, scale, onPageSize]);

  // 🔴 這裡不要用 w-full，避免跟 inline style width(px) 打架造成偏移
  return <canvas ref={canvasRef} className="border rounded-md block" />;
}
