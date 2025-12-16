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
  width: number;
  height: number;
};


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

// 用於去重（避免使用者重複選到同一個檔案造成清單爆炸）
function fileFingerprint(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

export default function DynamicToolPage() {
  const params = useParams();
  const slug = (params.slug as string) || "";

  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Drag & Drop（Hook-safe，無第三方套件）
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
  const [pdfSize, setPdfSize] = useState<{ width: number; height: number } | null>(
  null
);
  const [cropRect, setCropRect] = useState<Crop | null>(null);


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

        // 初始化設定值
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


  //pdf-preview
  useEffect(() => {
  // 只在 pdf-crop 工具才需要 preview
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

  // ⭐ 這行就是「本機 preview」的核心
  const url = URL.createObjectURL(f);
  setPreviewUrl(url);

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

  // ✅ 多檔工具：再選檔「追加」而不是覆蓋（且去重）
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tool) return;

    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (!picked.length) return;

    setStatus(null);
    setStatusError(null);

    // 單檔工具：直接取第一個（覆蓋）
    if (!tool.allow_multiple) {
      setFiles([picked[0]]);
      // 允許下一次選到同一個檔也能觸發 onChange
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // 多檔工具：追加 + 去重
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

    // 允許下一次選到同一個檔也能觸發 onChange
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

  // ✅ 拖曳排序：移動檔案（from -> to）
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
      // 1) 逐檔上傳到 S3，取得 keys（順序 = 目前 files 順序，會影響合併順序）
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

      // 2) output_format（通用）
      const firstFile = files[0];
      const extFromName =
        firstFile?.name.includes(".") &&
        firstFile.name.split(".").pop()?.toLowerCase();

      const outputFormat =
        settings.output_format ||
        tool.output_formats?.[0] ||
        extFromName ||
        "pdf";

      // 3) settings（多檔工具帶 files）
      const finalSettings: Record<string, any> = { ...settings };

      if (tool.allow_multiple) {
        // 多檔工具：永遠提供 files（即使只有 1 個也提供）
        finalSettings.files = uploadedKeys;
      }

      // 4) start
      const startRes = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: uploadedKeys[0], // 主檔（或第一個）
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

  // ------------------ UI ------------------

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

  const actionLabel =
    tool.slug === "pdf-merge" ? "開始合併" : "開始";

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{tool.name}</h1>
        <p className="text-slate-600 mt-2">{tool.description}</p>
      </header>

      {/* File upload */}
      <section className="p-4 border rounded-xl space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg">
              1. 上傳檔案
              {isMulti && (
                <span className="ml-2 text-xs text-slate-500">(可多選 / 可追加 / 可拖曳排序)</span>
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

            {isMulti && tool.slug === "pdf-merge" && files.length > 1 && (
              <div className="text-xs text-slate-600">
                合併順序會依照上面清單由上到下（可拖曳調整）。
              </div>
            )}
          </div>
        )}
      </section>

{/* ✅ PDF Crop Preview */}
{tool.slug === "pdf-crop" && previewUrl && (
  <section className="p-4 border rounded-xl space-y-3">
    <h2 className="font-semibold text-lg">2. 裁切預覽</h2>

    <div className="relative inline-block">
      <PdfViewer
        fileUrl={previewUrl}
        onPageSize={(size) => {
          setPdfSize(size);
          if (!cropRect) {
            setCropRect({
              x: 0,
              y: 0,
              width: size.width,
              height: size.height,
            });
          }
        }}
      />

      {pdfSize && cropRect && (
        <PdfCropOverlay
          pageWidth={pdfSize.width}
          pageHeight={pdfSize.height}
          value={cropRect}
          onChange={(rect) => setCropRect(rect)}
        />
      )}
    </div>

    <div className="text-xs text-slate-500">
      拖曳滑鼠選取裁切區域，完成後按「開始」才會真正裁切 PDF。
    </div>
  </section>
)}


            {/* Output format */}
      {tool.output_formats && tool.output_formats.length > 0 && (
        <section className="p-4 border rounded-xl space-y-3">
          <h2 className="font-semibold text-lg">2. 輸出格式</h2>

          <select
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={settings.output_format ?? tool.output_formats[0]}
            onChange={(e) =>
              handleSettingChange("output_format", e.target.value)
            }
          >
            {tool.output_formats.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt.toUpperCase()}
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-500">
            選擇轉換後的輸出格式
          </p>
        </section>
      )}

      {/* Settings form */}
      <section className="p-4 border rounded-xl space-y-3">
        <h2 className="font-semibold text-lg">3. 進階設定</h2>

        {Object.entries(tool.settings || {}).length === 0 && (
          <p className="text-sm text-slate-500">此工具無需額外設定。</p>
        )}

        {Object.entries(tool.settings || {}).map(([key, def]) => {
          if (!shouldShow(key)) return null;

          return (
  <div key={key} className="space-y-1">
    <label className="block text-sm font-medium">{def.label}</label>
    {"description" in def && (def as any).description ? (
      <p className="text-xs text-slate-500">{(def as any).description}</p>
    ) : null}

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

      {/* Start button & status */}
      <section className="p-4 border rounded-xl space-y-4">
        <h2 className="font-semibold text-lg">4. 開始</h2>
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
