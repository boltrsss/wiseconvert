"use client";

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ✅ Cache PDF document by fileUrl (avoid re-downloading for every thumbnail)
const pdfDocCache = new Map<string, Promise<any>>();

function getPdfDoc(fileUrl: string) {
  let p = pdfDocCache.get(fileUrl);
  if (!p) {
    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      withCredentials: false,
    });
    p = loadingTask.promise;
    pdfDocCache.set(fileUrl, p);
  }
  return p;
}

type Props = {
  fileUrl: string;

  // render page
  pageIndex?: number; // 0-based
  pageNumber?: number; // 1-based fallback

  // callbacks
  onPageCount?: (pageCount: number) => void;
  onPageSize?: (size: { width: number; height: number; scale: number }) => void;

  // main scale (only for mode="main")
  scale?: number;

  // ✅ NEW: modes
  mode?: "main" | "thumbnail";
  thumbWidth?: number; // px, only for thumbnail
};

export default function PdfViewer({
  fileUrl,
  onPageSize,
  onPageCount,
  pageIndex,
  pageNumber = 1,
  scale = 1.2,
  mode = "main",
  thumbWidth = 110,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const run = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // cancel previous render
        try {
          if (renderTask?.cancel) renderTask.cancel();
        } catch {}

        const pdf = await getPdfDoc(fileUrl);
        if (cancelled) return;

        onPageCountRef.current?.(pdf.numPages);

        let pn =
          typeof pageIndex === "number" ? pageIndex + 1 : Number(pageNumber || 1);
        if (!Number.isFinite(pn)) pn = 1;
        pn = Math.max(1, Math.min(pn, pdf.numPages));

        const page = await pdf.getPage(pn);
        if (cancelled) return;

        // ✅ compute viewport
        // - main: use given scale
        // - thumbnail: compute a scale that fits thumbWidth
        let viewport = page.getViewport({ scale: 1 });
        let finalScale = scale;

        if (mode === "thumbnail") {
          const baseW = viewport.width || 1;
          finalScale = Math.max(0.05, thumbWidth / baseW);
        }

        viewport = page.getViewport({ scale: finalScale });

        // only notify page size in main mode (avoid spam for thumbnails)
        if (mode === "main") {
          onPageSizeRef.current?.({
            width: Math.floor(viewport.width),
            height: Math.floor(viewport.height),
            scale: finalScale,
          });
        }

        const dpr =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        // overlay uses CSS px coordinate system
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
      // ✅ no destroy() here: doc is cached to speed thumbnails
    };
  }, [fileUrl, pageIndex, pageNumber, scale, mode, thumbWidth]);

  // thumbnail: no border (page.tsx already puts border around the button)
  const className =
    mode === "thumbnail"
      ? "block"
      : "border rounded-md block";

  return <canvas ref={canvasRef} className={className} />;
}
