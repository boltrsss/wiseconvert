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

  // ✅ 用 ref 保存 callback，避免 callback 變動觸發重新 render/cancel
  const onPageSizeRef = useRef(onPageSize);
  useEffect(() => {
    onPageSizeRef.current = onPageSize;
  }, [onPageSize]);

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

        loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          withCredentials: false,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });

        // ✅ 通知外層（用 ref）
        onPageSizeRef.current?.({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
          scale,
        });

        const dpr =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // ✅ 同一張 canvas 重畫前，先取消上一個 render（避免疊加）
        try {
          if (renderTask?.cancel) renderTask.cancel();
        } catch {}

        renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        await renderTask.promise;
      } catch (err: any) {
        // ✅ 被 cancel 不算錯誤（不刷屏）
        if (err?.name === "RenderingCancelledException") return;
        console.error("[PdfViewer] render error:", err);
      }
    };

    run();

    return () => {
      cancelled = true;
      try {
        if (renderTask?.cancel) renderTask.cancel();
      } catch {}
      try {
        if (loadingTask?.destroy) loadingTask.destroy();
      } catch {}
    };
  }, [fileUrl, pageNumber, scale]);

  // ✅ 不要用 w-full（會把 canvas 拉伸，overlay 座標會亂）
  return <canvas ref={canvasRef} className="border rounded-md block" />;
}
