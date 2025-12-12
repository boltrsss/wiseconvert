"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export const runtime = "edge";

/* =========================
   Types
========================= */

type ToolSettingOption = {
  value: string | number;
  label: string;
};

type ToolSetting = {
  type: "select" | "number" | "boolean";
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
};

/* =========================
   Config
========================= */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

/* =========================
   Utils
========================= */

function fileFingerprint(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

/* =========================
   Page
========================= */

export default function DynamicToolPage() {
  const params = useParams();
  const slug = (params.slug as string) || "";

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const [tool, setTool] = useState<ToolSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /* =========================
     Load tool schema
  ========================= */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setTool(null);
        setFiles([]);
        setStatus(null);
        setStatusError(null);

        const res = await fetch(`${API_BASE_URL}/api/tools/${slug}`);
        if (!res.ok) throw new Error("Tool not found");

        const data: ToolSchema = await res.json();
        if (cancelled) return;

        setTool(data);

        const init: Record<string, any> = {};
        Object.entries(data.settings || {}).forEach(([k, v]) => {
          init[k] = v.default ?? "";
        });
        setSettings(init);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load tool");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* =========================
     Handlers
  ========================= */

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

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
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

  const shouldShow = (key: string) => {
    const def = tool?.settings[key];
    if (!def?.visibleWhen) return true;
    return settings[def.visibleWhen.field] === def.visibleWhen.equals;
  };

  const poll = async (jobId: string) => {
    while (true) {
      const res = await fetch(`${API_BASE_URL}/api/status/${jobId}`, {
        cache: "no-store",
      });
      const data: StatusResponse = await res.json();
      setStatus(data);

      if (data.status === "completed" || data.status === "failed") break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  const start = async () => {
    if (!tool || !files.length) return;

    setWorking(true);
    setStatus(null);
    setStatusError(null);

    try {
      const uploadedKeys: string[] = [];

      for (const file of files) {
        const up = await fetch(`${API_BASE_URL}/api/get-upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            content_type: file.type || "application/octet-stream",
          }),
        });
        if (!up.ok) throw new Error("Failed to get upload url");

        const { upload_url, key } = await up.json();
        const put = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!put.ok) throw new Error("Upload failed");

        uploadedKeys.push(key);
      }

      const outputFormat =
        settings.output_format ||
        tool.output_formats?.[0] ||
        files[0].name.split(".").pop();

      const finalSettings: Record<string, any> = { ...settings };
      if (tool.allow_multiple) finalSettings.files = uploadedKeys;

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

      if (!startRes.ok) throw new Error(await startRes.text());

      const { job_id } = await startRes.json();
      await poll(job_id);
    } catch (e: any) {
      setStatusError(e.message ?? "Failed");
    } finally {
      setWorking(false);
    }
  };

  /* =========================
     Render
  ========================= */

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!tool) return null;

  const actionLabel = tool.slug === "pdf-merge" ? "開始合併" : "開始";
  const isZip =
    status?.file_url?.toLowerCase().includes(".zip") ||
    status?.output_s3_key?.toLowerCase().endsWith(".zip");

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <h1 className="text-3xl font-bold">{tool.name}</h1>
      <p className="text-slate-600">{tool.description}</p>

      {/* Upload */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-lg">
          1. 上傳檔案{" "}
          {tool.allow_multiple && (
            <span className="text-xs text-slate-500">
              （可多選 / 拖曳排序）
            </span>
          )}
        </h2>

        <input
          ref={inputRef}
          type="file"
          multiple={tool.allow_multiple}
          accept={tool.input_formats.map((x) => `.${x}`).join(",")}
          onChange={handleFilesChange}
        />

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li
                key={fileFingerprint(f)}
                draggable={tool.allow_multiple}
                onDragStart={() => (dragIndexRef.current = i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(i);
                }}
                onDrop={() => {
                  if (dragIndexRef.current !== null)
                    moveFile(dragIndexRef.current, i);
                  dragIndexRef.current = null;
                  setDragOverIndex(null);
                }}
                className={`flex justify-between items-center border px-3 py-2 rounded ${
                  dragOverIndex === i ? "bg-blue-50 border-blue-400" : ""
                }`}
              >
                <div className="flex gap-3 min-w-0">
                  {tool.allow_multiple && (
                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                  )}
                  <span className="truncate">{f.name}</span>
                </div>
                <button
                  className="text-xs text-red-500"
                  onClick={() => removeFile(i)}
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Settings */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-lg">2. 設定</h2>

        {Object.entries(tool.settings).length === 0 && (
          <p className="text-sm text-slate-500">此工具沒有額外設定。</p>
        )}

        {Object.entries(tool.settings).map(([k, def]) =>
          shouldShow(k) ? (
            <div key={k}>
              <label className="block text-sm font-medium">{def.label}</label>
              {def.type === "select" && (
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={settings[k]}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, [k]: e.target.value }))
                  }
                >
                  {def.options?.map((o) => (
                    <option key={String(o.value)} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : null
        )}
      </section>

      {/* Start */}
      <section className="border rounded-xl p-4 space-y-3">
        <button
          disabled={working || files.length === 0}
          onClick={start}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded disabled:opacity-50"
        >
          {working ? "處理中…" : actionLabel}
        </button>

        {statusError && <p className="text-red-600 text-sm">{statusError}</p>}

        {status?.status === "completed" && status.file_url && (
          <div className="space-y-2">
            {isZip && (
              <p className="text-xs text-slate-600">
                結果包含多個檔案，已打包為 ZIP。
              </p>
            )}
            <a
              href={status.file_url}
              target="_blank"
              className="inline-block bg-slate-900 text-white px-4 py-2 rounded"
            >
              下載結果
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
