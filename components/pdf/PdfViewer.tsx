"use client";

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// ✅ Cloudflare Pages：worker 放 public/ 底下，用絕對路徑抓
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Props = {
  fileUrl: string;
};

export default function PdfViewer({ fileUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    // ✅ 允許清掉上一個 render task，避免切換檔案時互相打架
    let renderTask: any = null;
    let loadingTask: any = null;

    const run = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // ✅ 載入 PDF
        loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          withCredentials: false, // 通常不需要帶 cookie，避免 CORS 麻煩
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        // ✅ 讓畫面在 retina 上不模糊
        const scale = 1.2;
        const viewport = page.getViewport({ scale });
        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // ✅ 清掉舊畫面
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ✅ Render（pdfjs v5 需要 canvas）
        renderTask = page.render({
          canvasContext: ctx,
          canvas,
          viewport,
        });

        await renderTask.promise;
      } catch (err) {
        // ✅ 不要讓前端爆掉
        console.error("[PdfViewer] render error:", err);
      }
    };

    run();

    return () => {
      cancelled = true;

      // ✅ 取消上一個 loading/render
      try {
        if (renderTask?.cancel) renderTask.cancel();
      } catch {}
      try {
        if (loadingTask?.destroy) loadingTask.destroy();
      } catch {}
    };
  }, [fileUrl]);

  return <canvas ref={canvasRef} className="border rounded-md w-full" />;
}
