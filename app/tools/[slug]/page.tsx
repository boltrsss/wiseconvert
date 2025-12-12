"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export const runtime = "edge";

/* ---------------- types ---------------- */

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

/* ---------------- utils ---------------- */

function fileFingerprint(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

/* ---------------- page ---------------- */

export default function DynamicToolPage() {
  const params = useParams();
  const slug = (params.slug as string) || "";

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const [tool, setTool] = useState<ToolSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  /* -------- load tool schema -------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setSchemaError(null);
        setTool(null);
        setFiles([]);
        setStatus(null);

        const res = await fetch(`${API_BASE_URL}/api/tools/${slug}`);
        if (!res.ok) throw new Error("Tool not found");

        const data: ToolSchema = await res.json();
        if (cancelled) return;

        setTool(data);

        const init: Record<string, any> = {};
        Object.entries(data.settings || {}).forEach(([k, def]) => {
          init[k] = def.default ?? "";
        });
        setSettings(init);
      } catch (e: any) {
        if (!cancelled) setSchemaError(e?.message ?? "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* -------- helpers -------- */

  const shouldShow = (key: string) => {
    const def = tool?.settings?.[key];
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
      picked.forEach((f) => {
        const fp = fileFingerprint(f);
        if (!seen.has(fp)) {
          next.push(f);
          seen.add(fp);
        }
      });
      return next;
    });

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

  /* -------- start job -------- */

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

  const startAction = async () => {
    if (!tool || !files.length) return;

    setWorking(true);
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
        files[0].name.split(".").pop()?.toLowerCase() ||
        tool.output_formats[0];

      const finalSettings = { ...settings };
      if (tool.allow_multiple) finalSettings.files = uploadedKeys;

      const res = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: uploadedKeys[0],
          target_format: finalSettings.output_format || ext,
          tool_slug: tool.slug,
          settings: finalSettings,
        }),
      });

      const data = await res.json();
      await poll(data.job_id);
    } catch (e: any) {
      setStatusError(e?.message ?? "Failed");
    } finally {
      setWorking(false);
    }
  };

  /* -------- UI -------- */

  if (loading) return <div className="p-8">Loading…</div>;
  if (schemaError) return <div className="p-8 text-red-600">{schemaError}</div>;
  if (!tool) return <div className="p-8">Tool not found</div>;

  const isMulti = !!tool.allow_multiple;
  const accept =
    tool.input_formats.map((x) => `.${x.toLowerCase()}`).join(",") || undefined;

  const actionLabel = tool.slug === "pdf-merge" ? "開始合併" : "開始";

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <h1 className="text-3xl font-bold">{tool.name}</h1>
      <p className="text-slate-600">{tool.description}</p>

      {/* upload */}
      <section className="p-4 border rounded-xl space-y-3">
        <input
          ref={inputRef}
          type="file"
          multiple={isMulti}
          accept={accept}
          onChange={handleFilesChange}
        />

        {files.map((f, i) => (
          <div
            key={fileFingerprint(f)}
            draggable={isMulti}
            onDragStart={() => (dragIndexRef.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() =>
              dragIndexRef.current !== null &&
              moveFile(dragIndexRef.current, i)
            }
            className="border px-3 py-2 rounded-md flex justify-between"
          >
            <span>{f.name}</span>
          </div>
        ))}
      </section>

      {/* settings */}
      <section className="p-4 border rounded-xl space-y-3">
        {Object.entries(tool.settings).map(([key, def]) => {
          if (!shouldShow(key)) return null;

          if (def.type === "select") {
            return (
              <select
                key={key}
                className="border px-3 py-2 w-full"
                value={settings[key]}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, [key]: e.target.value }))
                }
              >
                {def.options?.map((o) => (
                  <option key={String(o.value)} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            );
          }

          if (def.type === "number") {
            return (
              <input
                key={key}
                type="number"
                className="border px-3 py-2 w-full"
                value={settings[key]}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    [key]: Number(e.target.value),
                  }))
                }
              />
            );
          }

          if (def.type === "boolean") {
            return (
              <label key={key} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={!!settings[key]}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      [key]: e.target.checked,
                    }))
                  }
                />
                {def.label}
              </label>
            );
          }

          return null;
        })}
      </section>

      {/* start */}
      <section className="p-4 border rounded-xl space-y-4">
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          disabled={working || !files.length}
          onClick={startAction}
        >
          {working ? "處理中…" : actionLabel}
        </button>

        {statusError && <p className="text-red-600">{statusError}</p>}
        {status && <p>{status.message}</p>}
      </section>
    </div>
  );
}
