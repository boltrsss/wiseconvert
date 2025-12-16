"use client";

import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// ✅ Cloudflare Pages：worker 放 public/ 底下，用絕對路徑抓
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Props = {
  fileUrl: string;
  onPageSize?: (size: { width: number; height: number; scale: number }) => void;
  pageNumber?: number;
  scale?: number;
};

const PdfViewer: React.FC<Props> = ({
  fileUrl,
  onPageSize,
  pageNumber = 1,
  scale = 1.2,
}) => {
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

        // 取消舊 render
        try {
          if (renderTask?.cancel) renderTask.cancel();
        } catch {}

        loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          withCredentials: false,
        });

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

        const dpr =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

 return (
  <canvas
    ref={canvasRef}
    className="border rounded-md w-full block relative z-0"
  />
);


export default PdfViewer;
