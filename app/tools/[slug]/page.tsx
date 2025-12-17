"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import PdfViewer from "@/components/pdf/PdfViewer";
import PdfCropOverlay from "@/components/pdf/PdfCropOverlay";

export const runtime = "edge";

type ToolSettingOption = {
  value: string | number;
  label: string;
};

type ToolSetting = {
  type: "select" | "number" | "boolean" | "text";
  label: string;
  options?: ToolSettingOption[];
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  visibleWhen?: {
    field: string;
    equals: any;
  };
};

type ToolSchema = {
  slug: string;
  name: string;
  description: string;
  category?: string;
  input_formats: string[];
  output_formats: string[];
  allow_multiple?: boolean;
  settings: Record<string, ToolSetting>;
};

type StatusResponse = {
  job_id: string;
  status: string;
  progress: number;
  message?: string | null;
  output_s3_key?: string | null;
  file_url?: string | null;
  raw?: Record<string, any> | null;
};

type Crop = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

function fileFingerprint(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

export default function DynamicToolPage() {
  const params = useParams();
  const slug = (params.slug as string) || "";

  const inputRef = useRef<HTMLInputElement | null>(null);

  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [tool, setTool] = useState<ToolSchema | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState<{ width: number; height: number } | null>(null);
  const [cropRect, setCropRect] = useState<Crop | null>(null);
  const [pdfScale, setPdfScale] = useState(1.0);
  const lastScaleRef = useRef(1.0);
  const cropWrapRef = useRef<HTMLDivElement | null>(null);

  // ✅ NEW: 多頁 + apply_to
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageCount, setPageCount] = useState(1);
  const [applyTo, setApplyTo] = useState<"all" | "first">("all");
    // thumbnails
  const THUMB_WIDTH = 110;
  const THUMB_MAX = 40; // 太多頁先限制，避免一次渲染爆炸

  // 取得工具 schema（slug 改變才重置）
  useEffect(() => {
    let cancelled = false;

    const fetchSchema = async () => {
      try {
        setLoadingSchema(true);
        setSchemaError(null);
        setTool(null);
        setFiles([]);
        setStatus(null);
        setStatusError(null);

        const res = await fetch(`${API_BASE_URL}/api/tools/${slug}`);
        if (!res.ok) throw new Error("Tool not found.");

        const data: ToolSchema = await res.json();
        if (cancelled) return;

        setTool(data);

        const init: Record<string, any> = {};
        Object.entries(data.settings || {}).forEach(([key, def]) => {
          init[key] = def.default ?? "";
        });
        setSettings(init);
      } catch (err: any) {
        if (!cancelled) {
          setSchemaError(err?.message ?? "Failed to load tool schema.");
        }
      } finally {
        if (!cancelled) setLoadingSchema(false);
      }
    };

    fetchSchema();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // pdf-preview
  useEffect(() => {
    if (tool?.slug !== "pdf-crop") {
      setPreviewUrl(null);
      setCropRect(null);
      return;
    }

    const f = files[0];
    if (!f) {
      setPreviewUrl(null);
      setCropRect(null);
      return;
    }

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    // ✅ 新檔案時重置頁碼/頁數
    setPageIndex(0);
    setPageCount(1);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [files, tool?.slug]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const shouldShow = (key: string): boolean => {
    const def = tool?.settings?.[key];
    if (!def?.visibleWhen) return true;
    const target = def.visibleWhen.field;
    const expected = def.visibleWhen.equals;
    return settings[target] === expected;
  };

  // pdf-fixcode
  const handlePdfPageSize = React.useCallback(
    (size: { width: number; height: number; scale: number }) => {
      setPdfSize({ width: size.width, height: size.height });
      setPdfScale(size.scale);

      const prevScale = lastScaleRef.current;
      const nextScale = size.scale;
      const ratio = prevScale ? nextScale / prevScale : 1;

      if (ratio !== 1) {
        setCropRect((prev) => {
          if (!prev) return prev;
          return {
            x: Math.round(prev.x * ratio),
            y: Math.round(prev.y * ratio),
            w: Math.round(prev.w * ratio),
            h: Math.round(prev.h * ratio),
          };
        });
      }

      lastScaleRef.current = nextScale;

      // ✅ 第一次初始化 cropRect（只做一次）
      setCropRect((prev) => {
        if (prev) return prev;
        const w = Math.round(size.width * 0.5);
        const h = Math.round(size.height * 0.5);
        const x = Math.round((size.width - w) / 2);
        const y = Math.round((size.height - h) / 2);
        return { x, y, w, h };
      });
    },
    []
  );

  // ✅ 換頁：重新初始化裁切框（用新頁尺寸）
  useEffect(() => {
    if (tool?.slug !== "pdf-crop") return;
    if (!pdfSize) return;

    // 每次換頁先清掉 cropRect，等 PdfViewer 回報新頁尺寸後再初始化
    setCropRect(null);
    lastScaleRef.current = pdfScale;
  }, [pageIndex, tool?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tool) return;

    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (!picked.length) return;

    setStatus(null);
    setStatusError(null);

    if (!tool.allow_multiple) {
      setFiles([picked[0]]);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFiles((prev) => {
      const seen = new Set(prev.map(fileFingerprint));
      const next = [...prev];
      for (const f of picked) {
        const fp = fileFingerprint(f);
        if (!seen.has(fp)) {
          next.push(f);
          seen.add(fp);
        }
      }
      return next;
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setStatus(null);
    setStatusError(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setStatus(null);
    setStatusError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const moveFile = (from: number, to: number) => {
    if (from === to) return;
    setFiles((prev) => {
      const next = [...prev];
      const item = next[from];
      next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const poll = async (jobId: string) => {
    let done = false;
    while (!done) {
      const res = await fetch(`${API_BASE_URL}/api/status/${jobId}`, {
        cache: "no-store",
      });
      const data: StatusResponse = await res.json();
      setStatus(data);

      if (data.status === "completed" || data.status === "failed") {
        done = true;
        break;
      }

      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  const startAction = async () => {
    if (!tool || !files.length) return;

    setIsWorking(true);
    setStatus(null);
    setStatusError(null);

    try {
      const uploadedKeys: string[] = [];

      for (const file of files) {
        const upRes = await fetch(`${API_BASE_URL}/api/get-upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            content_type: file.type || "application/octet-stream",
          }),
        });

        if (!upRes.ok) throw new Error("Failed to get upload URL");
        const { upload_url, key } = await upRes.json();

        const putRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

        if (!putRes.ok) throw new Error("Upload failed");

        uploadedKeys.push(key);
      }

      if (!uploadedKeys.length) throw new Error("No files uploaded");

      const firstFile = files[0];
      const extFromName =
        firstFile?.name.includes(".") &&
        firstFile.name.split(".").pop()?.toLowerCase();

      const outputFormat =
        settings.output_format ||
        tool.output_formats?.[0] ||
        extFromName ||
        "pdf";

      const finalSettings: Record<string, any> = { ...settings };

      // ✅ pdf-crop：把 UI 選的裁切框送到後端
      if (tool.slug === "pdf-crop" && cropRect && pdfSize) {
        const pw = Number(pdfSize.width) || 1;
        const ph = Number(pdfSize.height) || 1;

        finalSettings.crop_norm = {
          x: cropRect.x / pw,
          y: cropRect.y / ph,
          w: cropRect.w / pw,
          h: cropRect.h / ph,
        };

        // ✅ NEW: 多頁/套用方式
        finalSettings.page_index = pageIndex; // 0-based
        finalSettings.apply_to = applyTo; // "first" | "all"
      }

      if (tool.allow_multiple) {
        finalSettings.files = uploadedKeys;
      }

      const startRes = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: uploadedKeys[0],
          target_format: outputFormat,
          tool_slug: tool.slug,
          settings: finalSettings,
        }),
      });

      if (!startRes.ok) {
        const txt = await startRes.text();
        throw new Error(txt || "Failed to start");
      }

      const startData = await startRes.json();
      const jobId = startData.job_id ?? startData.jobId;
      if (!jobId) throw new Error("No job_id returned from backend");

      await poll(jobId);
    } catch (err: any) {
      setStatusError(err?.message ?? "Unknown error");
    } finally {
      setIsWorking(false);
    }
  };

  if (loadingSchema) return <div className="p-8">Loading…</div>;
  if (schemaError) return <div className="p-8 text-red-600">{schemaError}</div>;
  if (!tool) return <div className="p-8 text-red-600">Tool not found</div>;

  const isMulti = !!tool.allow_multiple;
  const acceptStr =
    tool.input_formats?.map((x) => `.${x.toLowerCase()}`).join(",") || undefined;

  const isZipResult =
    !!status &&
    (status.file_url?.toLowerCase().includes(".zip") ||
      status.output_s3_key?.toLowerCase().endsWith(".zip"));

  const actionLabel = tool.slug === "pdf-merge" ? "開始合併" : "開始";
  return (
    <div className="max-w-6xl mx-auto py-10 px-5 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{tool.name}</h1>
        <p className="text-slate-600 mt-2">{tool.description}</p>
      </header>

      {/* File upload */}
      <section className="p-4 border rounded-xl space-y-3 relative isolate">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg">
              上傳檔案
              {isMulti && (
                <span className="ml-2 text-xs text-slate-500">
                  (可多選 / 可追加 / 可拖曳排序)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              支援的格式：{tool.input_formats.join(", ")}
            </p>
          </div>

          {files.length > 0 && (
            <button
              type="button"
              onClick={clearFiles}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              清空
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple={isMulti}
          accept={acceptStr}
          onChange={handleFilesChange}
          className="text-sm"
        />

        {isMulti && (
          <div className="text-xs text-slate-500">
            小提示：少選了檔案就再選一次會「追加」；要調整合併順序可直接拖曳清單排序。
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-2 space-y-2 text-sm">
            <p className="font-medium">已選擇 {files.length} 個檔案：</p>

            <ul className="space-y-2">
              {files.map((f, idx) => (
                <li
                  key={fileFingerprint(f)}
                  draggable={isMulti}
                  onDragStart={() => {
                    if (!isMulti) return;
                    dragIndexRef.current = idx;
                  }}
                  onDragOver={(e) => {
                    if (!isMulti) return;
                    e.preventDefault();
                    setDragOverIndex(idx);
                  }}
                  onDragLeave={() => {
                    if (!isMulti) return;
                    setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    if (!isMulti) return;
                    e.preventDefault();
                    if (dragIndexRef.current !== null) {
                      moveFile(dragIndexRef.current, idx);
                    }
                    dragIndexRef.current = null;
                    setDragOverIndex(null);
                  }}
                  className={`
                    flex items-center justify-between
                    border rounded-md px-3 py-2 bg-white
                    transition
                    ${isMulti ? "cursor-move" : "cursor-default"}
                    ${
                      dragOverIndex === idx
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200"
                    }
                  `}
                  title={isMulti ? "拖曳以調整順序" : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isMulti && <span className="text-slate-400 text-sm">☰</span>}
                    <span className="truncate mr-2">{f.name}</span>
                  </div>

                  <button
                    type="button"
                    className="text-xs text-red-500 hover:underline shrink-0"
                    onClick={() => removeFile(idx)}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

            {/* ✅ PDF Crop Preview */}
{tool.slug === "pdf-crop" && previewUrl && (
  <section className="p-4 border rounded-xl space-y-3">
   <div className="sticky top-0 z-50 bg-white/95 backdrop-blur flex items-center justify-between gap-2 -mx-4 px-4 py-2 border-b">
      <h2 className="font-semibold text-lg">裁切</h2>

      {/* ✅ 右上角工具列（mobile 兩行） */}
      <div className="w-full sm:w-auto overflow-x-auto">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-nowrap sm:justify-end min-w-max pb-1">
        {/* Page + Apply */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:mr-2">
          <button
            type="button"
            className="px-2.5 py-1.5 text-sm border rounded-md hover:bg-slate-50 disabled:opacity-50"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex <= 0}
          >
            Prev
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span>Page</span>
            <input
              className="w-16 px-2 py-1.5 rounded-md border"
              type="number"
              min={1}
              max={pageCount}
              value={pageIndex + 1}
              onChange={(e) => {
                const v = Number(e.target.value || 1);
                const next = Math.min(Math.max(v, 1), pageCount) - 1;
                setPageIndex(next);
              }}
            />
            <span className="text-slate-500">/ {pageCount}</span>
          </div>

          <button
            type="button"
            className="px-2.5 py-1.5 text-sm border rounded-md hover:bg-slate-50 disabled:opacity-50"
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={pageIndex >= pageCount - 1}
          >
            Next
          </button>

          {/* ✅ z-index，避免被 PDF 蓋住 */}
          <select
            className="px-2.5 py-1.5 text-sm border rounded-md bg-white relative z-30"
            value={applyTo}
            onChange={(e) => setApplyTo(e.target.value as "all" | "first")}
            title="Apply crop to..."
          >
            <option value="all">All pages</option>
            <option value="first">This page only</option>
          </select>
        </div>
      </div>
        {/* Zoom */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:justify-end">
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
            onClick={() =>
              setPdfScale((s) => Math.max(0.6, Math.round((s - 0.1) * 10) / 10))
            }
          >
            −
          </button>

          <div className="text-sm tabular-nums w-14 text-center">
            {Math.round(pdfScale * 100)}%
          </div>

          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
            onClick={() =>
              setPdfScale((s) => Math.min(2.2, Math.round((s + 0.1) * 10) / 10))
            }
          >
            +
          </button>

          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
            onClick={() => {
              const el = cropWrapRef.current;
              if (!el || !pdfSize) return;
              const cw = el.clientWidth - 16;
              const ratio = cw / pdfSize.width;
              setPdfScale((s) => {
                const next = s * ratio;
                return Math.max(0.6, Math.min(2.2, Math.round(next * 10) / 10));
              });
            }}
          >
            Fit
          </button>

          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
            onClick={() => {
              if (!pdfSize) return;
              const w = Math.round(pdfSize.width * 0.5);
              const h = Math.round(pdfSize.height * 0.5);
              const x = Math.round((pdfSize.width - w) / 2);
              const y = Math.round((pdfSize.height - h) / 2);
              setCropRect({ x, y, w, h });
            }}
          >
            Reset
          </button>

          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
            onClick={() => {
              if (!pdfSize) return;
              setCropRect({ x: 0, y: 0, w: pdfSize.width, h: pdfSize.height });
            }}
          >
            Full
          </button>
        </div>
      </div>
    </div>

    {/* ✅ 左側縮圖 + 右側主畫布 */}
    <div className="flex flex-col md:flex-row gap-3">
      {/* Thumbnails */}
      <div className="md:w-[150px] md:shrink-0 w-full">
        <div className="text-xs text-slate-500 mb-2">Pages</div>

        <div
          ref={cropWrapRef}
          className="border rounded-md overflow-auto bg-white relative z-0 p-2"
          style={{ maxHeight: "70vh" }}
        >
          <div className="flex md:block gap-2 md:space-y-2 items-start">
            {Array.from({ length: Math.min(pageCount, THUMB_MAX) }).map((_, i) => {
              const active = i === pageIndex;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPageIndex(i)}
                  className={[
                    "self-start inline-flex flex-col shrink-0 md:w-full w-[120px] text-left rounded-md border p-1 bg-white hover:bg-slate-50 transition",
                    active ? "border-blue-600 ring-2 ring-blue-600" : "border-slate-200",
                  ].join(" ")}
                  title={`Page ${i + 1}`}
                >

<div className="relative">
  <div
    className={[
      "absolute left-1 top-1 z-10",
      "text-[11px] px-1.5 py-0.5 rounded",
      "bg-white/90 border",
      active ? "text-blue-700 border-blue-200" : "text-slate-600 border-slate-200",
    ].join(" ")}
  >
    {i + 1}
  </div>

  <PdfViewer
    fileUrl={previewUrl}
    pageIndex={i}
    mode="thumbnail"
    thumbWidth={THUMB_WIDTH}
  />
</div>


                  
                </button>
              );
            })}

            {pageCount > THUMB_MAX && (
              <div className="text-[11px] text-slate-500 px-1 pt-1">
                只顯示前 {THUMB_MAX} 頁（共 {pageCount} 頁）
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main canvas */}
      <div className="flex-1 min-w-0">
        <div
          ref={cropWrapRef}
          className="border rounded-md overflow-auto bg-white"
          style={{ maxHeight: "70vh" }}
        >
          <div
            className="relative z-0"
            style={{
              width: pdfSize?.width ? `${pdfSize.width}px` : undefined,
              height: pdfSize?.height ? `${pdfSize.height}px` : undefined,
            }}
          >
            <PdfViewer
              fileUrl={previewUrl}
              scale={pdfScale}
              pageIndex={pageIndex}
              onPageCount={(n) => {
                setPageCount(n || 1);
                setPageIndex((p) =>
                  Math.min(Math.max(p, 0), Math.max((n || 1) - 1, 0))
                );
              }}
              onPageSize={handlePdfPageSize}
              mode="main"
            />

            {pdfSize && cropRect && (
              <PdfCropOverlay
                pageWidth={pdfSize.width}
                pageHeight={pdfSize.height}
                value={cropRect}
                onChange={setCropRect}
              />
            )}
          </div>
        </div>

        {cropRect && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mt-3">
            <div className="px-3 py-2 border rounded-md bg-slate-50">
              <div className="text-xs text-slate-500">X</div>
              <div className="tabular-nums">{cropRect.x}</div>
            </div>
            <div className="px-3 py-2 border rounded-md bg-slate-50">
              <div className="text-xs text-slate-500">Y</div>
              <div className="tabular-nums">{cropRect.y}</div>
            </div>
            <div className="px-3 py-2 border rounded-md bg-slate-50">
              <div className="text-xs text-slate-500">W</div>
              <div className="tabular-nums">{cropRect.w}</div>
            </div>
            <div className="px-3 py-2 border rounded-md bg-slate-50">
              <div className="text-xs text-slate-500">H</div>
              <div className="tabular-nums">{cropRect.h}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-slate-500 mt-2">
          直接拖曳與拉角落調整裁切區域。按「開始」才會真正裁切 PDF。
        </div>
      </div>
    </div>
  </section>
)}


      {/* Output format */}
      {tool.output_formats && tool.output_formats.length > 0 && (
        <section className="p-4 border rounded-xl space-y-3">
          <h2 className="font-semibold text-lg">輸出格式</h2>

          <select
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={settings.output_format ?? tool.output_formats[0]}
            onChange={(e) => handleSettingChange("output_format", e.target.value)}
          >
            {tool.output_formats.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt.toUpperCase()}
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-500">選擇轉換後的輸出格式</p>
        </section>
      )}

      {/* Settings form */}
      {tool.slug !== "pdf-crop" && (
        <section className="p-4 border rounded-xl space-y-3">
          <h2 className="font-semibold text-lg">進階設定</h2>

          {Object.entries(tool.settings || {}).length === 0 && (
            <p className="text-sm text-slate-500">此工具無需額外設定。</p>
          )}

          {Object.entries(tool.settings || {}).map(([key, def]) => {
            if (!shouldShow(key)) return null;

            return (
              <div key={key} className="space-y-1">
                <label className="block text-sm font-medium">{def.label}</label>

                {def.type === "select" && (
                  <select
                    className="border rounded-md px-3 py-2 text-sm w-full"
                    value={settings[key] ?? ""}
                    onChange={(e) => handleSettingChange(key, e.target.value)}
                  >
                    {def.options?.map((opt) => (
                      <option key={String(opt.value)} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {def.type === "number" && (
                  <input
                    type="number"
                    className="border rounded-md px-3 py-2 text-sm w-full"
                    value={settings[key] ?? ""}
                    min={def.min}
                    max={def.max}
                    step={def.step ?? 1}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleSettingChange(key, v === "" ? "" : Number(v));
                    }}
                  />
                )}

                {def.type === "text" && (
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2 text-sm w-full"
                    value={settings[key] ?? ""}
                    onChange={(e) => handleSettingChange(key, e.target.value)}
                  />
                )}

                {def.type === "boolean" && (
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!settings[key]}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                    />
                    <span className="text-slate-700">Enable</span>
                  </label>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Start button & status */}
      <section className="p-4 border rounded-xl space-y-4">
        <h2 className="font-semibold text-lg">開始</h2>
        <button
          className="
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            px-5 py-2 rounded-lg
            disabled:opacity-50
          "
          disabled={isWorking || files.length === 0}
          onClick={startAction}
        >
          {isWorking ? "處理中…" : actionLabel}
        </button>

        {statusError && <p className="text-sm text-red-600">{statusError}</p>}

        {status && (
          <div className="text-sm space-y-1">
            <p>
              狀態：<span className="font-semibold">{status.status}</span>
            </p>
            <p>進度：{status.progress}%</p>
            {status.message && <p className="text-slate-700">{status.message}</p>}

            {status.status === "completed" && status.file_url && (
              <div className="mt-2 space-y-2">
                {isZipResult && (
                  <div className="text-xs text-slate-600">
                    這次結果包含多個輸出，已自動打包成 ZIP 檔。下載後解壓即可取得全部檔案。
                  </div>
                )}
                <a
                  href={status.file_url}
                  target="_blank"
                  className="
                    inline-block
                    bg-slate-900 hover:bg-slate-800
                    text-white
                    px-4 py-2 rounded-lg
                    text-sm
                  "
                >
                  下載結果
                </a>
              </div>
            )}

            {status.status === "failed" && (
              <p className="text-sm text-red-600">
                轉換失敗，請檢查檔案格式或稍後再試。
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
