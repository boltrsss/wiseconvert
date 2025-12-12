"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export const runtime = "edge";

/* ---------- types ---------- */

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
  raw?: Record<string, any> | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

/* ---------- utils ---------- */

function fileFingerprint(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

function formatSize(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/* ---------- page ---------- */

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

  /* ---------- schema ---------- */

  useEffect(() => {
    let cancelled = false;

    const fetchSchema = async () => {
      try {
        setLoadingSchema(true);
        setSchemaError(null);
        setTool(null);
        setFiles([]);
        setStatus(null);

        const res = await fetch(`${API_BASE_URL}/api/tools/${slug}`);
        if (!res.ok) throw new Error("Tool not found.");

        const data: ToolSchema = await res.json();
        if (cancelled) return;

        setTool(data);

        const init: Record<string, any> = {};
        Object.entries(data.settings || {}).forEach(([k, v]) => {
          init[k] = v.default ?? "";
        });
        setSettings(init);
      } catch (e: any) {
        if (!cancelled) setSchemaError(e?.message ?? "Load failed");
      } finally {
        if (!cancelled) setLoadingSchema(false);
      }
    };

    fetchSchema();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ---------- helpers ---------- */

  const isMulti = !!tool?.allow_multiple;
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  const shouldShow = (key: string) => {
    const def = tool?.settings?.[key];
    if (!def?.visibleWhen) return true;
    return settings[def.visibleWhen.field] === def.visibleWhen.equals;
  };

  /* ---------- files ---------- */

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tool) return;
    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (!picked.length) return;

    if (!tool.allow_multiple) {
      setFiles([picked[0]]);
    } else {
      setFiles((prev) => {
        const seen = new Set(prev.map(fileFingerprint));
        const next = [...prev];
        picked.forEach((f) => {
          const fp = fileFingerprint(f);
          if (!seen.has(fp)) {
            seen.add(fp);
            next.push(f);
          }
        });
        return next;
      });
    }

    setStatus(null);
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

  /* ---------- action ---------- */

  const startAction = async () => {
    if (!tool || !files.length) return;

    setIsWorking(true);
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
        }).then((r) => r.json());

        await fetch(up.upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

        uploadedKeys.push(up.key);
      }

      const outputFormat =
        settings.output_format ||
        tool.output_formats?.[0] ||
        "pdf";

      const finalSettings = {
        ...settings,
        ...(isMulti ? { files: uploadedKeys } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: uploadedKeys[0],
          target_format: outputFormat,
          tool_slug: tool.slug,
          settings: finalSettings,
        }),
      });

      const data = await res.json();
      await poll(data.job_id);
    } catch (e: any) {
      setStatusError(e?.message ?? "Failed");
    } finally {
      setIsWorking(false);
    }
  };

  const poll = async (jobId: string) => {
    while (true) {
      const res = await fetch(`${API_BASE_URL}/api/status/${jobId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setStatus(data);
      if (data.status === "completed" || data.status === "failed") break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  /* ---------- UI ---------- */

  if (loadingSchema) return <div className="p-8">Loading…</div>;
  if (schemaError) return <div className="p-8 text-red-600">{schemaError}</div>;
  if (!tool) return <div className="p-8">Tool not found</div>;

  const actionLabel = tool.slug === "pdf-merge" ? "開始合併" : "開始";

  const downloadName =
    tool.slug === "pdf-merge"
      ? "merged.pdf"
      : tool.slug === "pdf-to-jpg"
      ? "pages.zip"
      : `${tool.slug}-result`;

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <h1 className="text-3xl font-bold">{tool.name}</h1>
      <p className="text-slate-600">{tool.description}</p>

      {/* files */}
      <section className="p-4 border rounded-xl space-y-3">
        <input
          ref={inputRef}
          type="file"
          multiple={isMulti}
          accept={tool.input_formats.map((x) => `.${x}`).join(",")}
          onChange={handleFilesChange}
        />

        {files.length > 0 && (
          <>
            <div className="text-sm text-slate-600">
              檔案數：{files.length} ｜ 總大小：{formatSize(totalSize)}
            </div>

            <ul className="space-y-2">
              {files.map((f, idx) => (
                <li
                  key={fileFingerprint(f)}
                  draggable={isMulti}
                  onDragStart={() => (dragIndexRef.current = idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(idx);
                  }}
                  onDrop={() => {
                    if (dragIndexRef.current !== null) {
                      moveFile(dragIndexRef.current, idx);
                    }
                    setDragOverIndex(null);
                  }}
                  className={`flex items-center justify-between border px-3 py-2 rounded
                    ${dragOverIndex === idx ? "bg-blue-50 border-blue-500" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {isMulti && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    )}
                    <span className="truncate">{f.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* action */}
      <section className="p-4 border rounded-xl space-y-3">
        <button
          onClick={startAction}
          disabled={isWorking || !files.length}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          {isWorking ? "處理中…" : actionLabel}
        </button>

        {status && status.file_url && status.status === "completed" && (
          <a
            href={status.file_url}
            download={downloadName}
            className="inline-block bg-slate-900 text-white px-4 py-2 rounded"
          >
            下載結果
          </a>
        )}
      </section>
    </div>
  );
}
