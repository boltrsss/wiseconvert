"use client";

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Props = {
  fileUrl: string;

  // ✅ 新增：用 0-based pageIndex（page.tsx 會傳這個）
  pageIndex?: number;

  // ✅ 兼容舊用法：如果外面仍用 pageNumber（1-based）
  pageNumber?: number;

  // ✅ 新增：回報總頁數
  onPageCount?: (pageCount: number) => void;

  onPageSize?: (size: { width: number; height: number; scale: number }) => void;
  scale?: number;
};

export default function PdfViewer({
  fileUrl,
  onPageSize,
  onPageCount,
  pageIndex,
  pageNumber = 1,
  scale = 1.2,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ✅ 用 ref 保存 callbacks
  const onPageSizeRef = useRef<Props["onPageSize"]>(onPageSize);
  const onPageCountRef = useRef<Props["onPageCount"]>(onPageCount);

  useEffect(() => {
    onPageSizeRef.current = onPageSize;
  }, [onPageSize]);

  useEffect(() => {
    onPageCountRef.current = onPageCount;
  }, [onPageCount]);

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

        // ✅ 取消上一個 render
        try {
          if (renderTask?.cancel) renderTask.cancel();
        } catch {}

        loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          withCredentials: false,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        // ✅ 回報總頁數
        onPageCountRef.current?.(pdf.numPages);

        // ✅ 決定要 render 哪一頁（優先 pageIndex，其次 pageNumber）
        let pn =
          typeof pageIndex === "number" ? pageIndex + 1 : Number(pageNumber || 1);

        if (!Number.isFinite(pn)) pn = 1;
        pn = Math.max(1, Math.min(pn, pdf.numPages));

        const page = await pdf.getPage(pn);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });

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

        renderTask = page.render({
          canvasContext: ctx,
          canvas,
          viewport,
        });

        await renderTask.promise;
      } catch (err: any) {
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
  }, [fileUrl, pageIndex, pageNumber, scale]);

  return <canvas ref={canvasRef} className="border rounded-md block" />;
}
