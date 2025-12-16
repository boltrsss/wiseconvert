"use client";

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// ✅ Cloudflare Pages：worker 放 public/ 底下，用絕對路徑抓
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Props = {
  fileUrl: string;

  // ✅ 給 Crop overlay 用：回傳「CSS 像素」座標系統的寬高（跟 overlay 一致）
  onPageSize?: (size: { width: number; height: number; scale: number }) => void;

  // ✅ 之後要做 page selector 可以用（先預設 1）
  pageNumber?: number;

  // ✅ 你想要控制 scale 也可以（預設 1.2）
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

        // ✅ 若上一輪還在 render，先取消（避免縮放/切頁快速操作出現競態）
        try {
          if (renderTask?.cancel) renderTask.cancel();
        } catch {}

        // ✅ 載入 PDF
        loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          withCredentials: false,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });

        // ✅ 通知外層：overlay 用 CSS px 尺寸
        onPageSize?.({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
          scale,
        });

        // ✅ retina 不糊：canvas 實際像素 = css * dpr
        const dpr =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        // ✅ 這兩行很重要：Crop overlay 會用 CSS px 當座標系統
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        // ✅ reset transform（避免重 render 累積）
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ✅ 設成 dpr scale（讓 viewport 用 CSS px render）
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        renderTask = page.render({
          canvasContext: ctx,
          canvas,
          viewport,
        });

        await renderTask.promise;
      } catch (err) {
        if (!cancelled) {
          console.error("[PdfViewer] render error:", err);
        }
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
  }, [fileUrl, pageNumber, scale, onPageSize]);

  <canvas
    ref={canvasRef}
    className="border rounded-md block relative z-0"/>;
}
