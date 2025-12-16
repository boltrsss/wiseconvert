"use client";

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// ⚠️ 關鍵：指定 worker 路徑（Cloudflare Pages 必須）
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "/pdf.worker.min.mjs";

type Props = {
  fileUrl: string;
};

export default function PdfViewer({ fileUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      if (cancelled) return;

      const page = await pdf.getPage(1);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="border rounded-md w-full"
    />
  );
}

