"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export const runtime = "edge";

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

  /* ---------- load schema ---------- */
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
        Object.entries(data.settings || {}).forEach(([k, def]) => {
          init[k] = def.default ?? "";
        });
        setSettings(init);
      } catch (e: any) {
        if (!cancelled) setSchemaError(e?.message ?? "Failed to load tool");
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
  const handleSettingChange = (k: string, v: any) =>
    setSettings((p) => ({ ...p, [k]: v }));

  const shouldShow = (k: string) => {
    const def = tool?.settings?.[k];
    if (!def?.visibleWhen) return true;
    return settings[def.visibleWhen.field] === def.visibleWhen.equals;
  };

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

  const removeFile = (i: number) =>
    setFiles((p) => p.filter((_, idx) => idx !== i));

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

  /* ---------- poll ---------- */
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

  /* ---------- start ---------- */
  const startAction = async () => {
    if (!tool || !files.length) return;

    setIsWorking(true);
    setStatus(null);
    setStatusError(null);

    try {
      const uploadedKeys: string[] = [];

      for (const f of files) {
        const up = await fetch(`${API_BASE_URL}/api/get-upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: f.name,
            content_type: f.type || "application/octet-stream",
          }),
        });
        const { upload_url, key } = await up.json();
        await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": f.type || "application/octet-stream" },
          body: f,
        });
        uploadedKeys.push(key);
      }

      const ext =
        files[0]?.name.split(".").pop()?.toLowerCase() ?? "pdf";

      const finalSettings = {
        ...settings,
        ...(tool.allow_multiple ? { files: uploadedKeys } : {}),
      };

      const startRes = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: uploadedKeys[0],
          target_format:
            settings.output_format || tool.output_formats?.[0] || ext,
          tool_slug: tool.slug,
          settings: finalSettings,
        }),
      });

      const startData = await startRes.json();
      await poll(startData.job_id);
    } catch (e: any) {
      setStatusError(e?.message ?? "Failed");
    } finally {
      setIsWorking(false);
    }
  };

  /* ---------- render ---------- */
  if (loadingSchema) return <div className="p-8">Loading…</div>;
  if (schemaError) return <div className="p-8 text-red-600">{schemaError}</div>;
  if (!tool) return <div className="p-8 text-red-600">Tool not found</div>;

  const isZipResult =
    status &&
    (status.file_url?.toLowerCase().includes(".zip") ||
      status.output_s3_key?.toLowerCase().endsWith(".zip"));

  const actionLabel = tool.slug === "pdf-merge" ? "開始合併" : "開始";

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <h1 className="text-3xl font-bold">{tool.name}</h1>

      {/* start */}
      <button
        disabled={isWorking || !files.length}
        onClick={startAction}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        {isWorking ? "處理中…" : actionLabel}
      </button>

      {status && (
        <div className="text-sm space-y-2">
          <div>狀態：{status.status}</div>
          <div>進度：{status.progress}%</div>

          {/* ✅ 修正後：download 永遠會出現 */}
          {status.status === "completed" && (
            <div className="space-y-2">
              {isZipResult && (
                <div className="text-xs text-slate-600">
                  多個輸出已打包成 ZIP。
                </div>
              )}

              {!status.file_url && (
                <div className="text-xs text-slate-500">
                  正在準備下載連結…
                </div>
              )}

              {status.file_url && (
                <a
                  href={status.file_url}
                  target="_blank"
                  className="inline-block bg-slate-900 text-white px-4 py-2 rounded-lg"
                >
                  下載結果
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
