"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export const runtime = "edge";

/* ---------- Types ---------- */

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

/* ---------- Config ---------- */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

/* ---------- Utils ---------- */

function fileFingerprint(f: File) {
  return `${f.name}_${f.size}_${f.lastModified}`;
}

/* ---------- Page ---------- */

export default function DynamicToolPage() {
  const params = useParams();
  const slug = (params.slug as string) || "";

  const inputRef = useRef<HTMLInputElement | null>(null);

  // drag & drop
  const dragFromRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const [tool, setTool] = useState<ToolSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  /* ---------- Load tool schema ---------- */

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
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ---------- File handling ---------- */

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tool) return;

    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (!picked.length) return;

    setStatus(null);
    setStatusError(null);

    if (!tool.allow_multiple) {
      setFiles([picked[0]]);
    } else {
      setFiles((prev) => {
        const seen = new Set(prev.map(fileFingerprint));
        const next = [...prev];
        for (const f of picked) {
          const fp = fileFingerprint(f);
          if (!seen.has(fp)) {
            seen.add(fp);
            next.push(f);
          }
        }
        return next;
      });
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setStatus(null);
    setStatusError(null);
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

  /* ---------- Conversion ---------- */

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
      const keys: string[] = [];

      for (const file of files) {
        const up = await fetch(`${API_BASE_URL}/api/get-upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            content_type: file.type || "application/octet-stream",
          }),
        });
        if (!up.ok) throw new Error("Upload URL failed");
        const { upload_url, key } = await up.json();

        const put = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!put.ok) throw new Error("Upload failed");

        keys.push(key);
      }

      const ext =
        files[0].name.split(".").pop()?.toLowerCase() ||
        tool.output_formats[0];

      const finalSettings: Record<string, any> = { ...settings };
      if (tool.allow_multiple) finalSettings.files = keys;

      const res = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: keys[0],
          target_format: ext,
          tool_slug: tool.slug,
          settings: finalSettings,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      await poll(data.job_id ?? data.jobId);
    } catch (e: any) {
      setStatusError(e.message);
    } finally {
      setWorking(false);
    }
  };

  /* ---------- UI ---------- */

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!tool) return <div className="p-8 text-red-600">Tool not found</div>;

  const isMulti = !!tool.allow_multiple;
  const isZip =
    status?.file_url?.toLowerCase().includes(".zip") ||
    status?.output_s3_key?.toLowerCase().endsWith(".zip");

  const actionLabel = tool.slug === "pdf-merge" ? "開始合併" : "開始";

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <h1 className="text-3xl font-bold">{tool.name}</h1>
      <p className="text-slate-600">{tool.description}</p>

      {/* Upload */}
      <section className="p-4 border rounded-xl space-y-3">
        <input
          ref={inputRef}
          type="file"
          multiple={isMulti}
          accept={tool.input_formats.map((x) => `.${x}`).join(",")}
          onChange={onFilesChange}
        />

        {files.length > 0 && (
          <ul className="space-y-2 text-sm">
            {files.map((f, i) => (
              <li
                key={fileFingerprint(f)}
                draggable={isMulti}
                onDragStart={() => (dragFromRef.current = i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(i);
                }}
                onDrop={() => {
                  if (dragFromRef.current !== null) {
                    moveFile(dragFromRef.current, i);
                  }
                  dragFromRef.current = null;
                  setDragOver(null);
                }}
                className={`flex items-center justify-between border rounded-md px-3 py-2 ${
                  dragOver === i ? "bg-blue-50 border-blue-500" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isMulti && (
                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                  )}
                  <span className="truncate">{f.name}</span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-xs text-red-500"
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Start */}
      <section className="space-y-4">
        <button
          disabled={working || !files.length}
          onClick={start}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {working ? "處理中…" : actionLabel}
        </button>

        {statusError && <p className="text-red-600">{statusError}</p>}

        {status && (
          <div className="text-sm space-y-1">
            <p>狀態：{status.status}</p>
            <p>進度：{status.progress}%</p>
            {status.message && <p>{status.message}</p>}
            {status.status === "completed" && status.file_url && (
              <>
                {isZip && (
                  <p className="text-xs text-slate-500">
                    已打包為 ZIP，下載後解壓即可。
                  </p>
                )}
                <a
                  href={status.file_url}
                  target="_blank"
                  className="inline-block bg-slate-900 text-white px-4 py-2 rounded"
                >
                  下載結果
                </a>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
