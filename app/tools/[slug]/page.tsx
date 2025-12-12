"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

function fileKey(f: File) {
  return `${f.name}::${f.size}::${f.lastModified}`;
}

export default function DynamicToolPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tool, setTool] = useState<ToolSchema | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isConverting, setIsConverting] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // 讓同一個檔案可以被再次選取（以及補選時不會被 browser 阻擋 onChange）
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 取得工具 schema
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoadingSchema(true);
        setSchemaError(null);
        setTool(null);
        setFiles([]);
        setStatus(null);
        setStatusError(null);

        const res = await fetch(`${API_BASE_URL}/api/tools/${slug}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Tool not found.");

        const data: ToolSchema = await res.json();
        setTool(data);

        // 初始化設定值
        const init: Record<string, any> = {};
        Object.entries(data.settings || {}).forEach(([key, def]) => {
          init[key] = def.default ?? "";
        });
        setSettings(init);
      } catch (err: any) {
        setSchemaError(err.message ?? "Failed to load tool schema.");
      } finally {
        setLoadingSchema(false);
      }
    };

    fetchSchema();
  }, [slug]);

  const handleSettingChange = (key: string, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const shouldShow = (key: string): boolean => {
    const def = tool?.settings[key];
    if (!def?.visibleWhen) return true;

    const target = def.visibleWhen.field;
    const expected = def.visibleWhen.equals;

    return settings[target] === expected;
  };

  // ✅ 修正：補選檔案時「追加」而不是覆蓋；並做去重
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tool) return;

    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (!picked.length) return;

    setFiles((prev) => {
      // 單檔工具：只保留最新選的第一個
      if (!tool.allow_multiple) {
        return [picked[0]];
      }

      // 多檔工具：append + 去重
      const map = new Map<string, File>();
      prev.forEach((f) => map.set(fileKey(f), f));
      picked.forEach((f) => map.set(fileKey(f), f));
      return Array.from(map.values());
    });

    setStatus(null);
    setStatusError(null);

    // 清空 input value，讓同一檔案可以再次被選（尤其是補選/重選時）
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setStatus(null);
    setStatusError(null);
  };

  const getActionLabel = () => {
    if (!tool) return "開始";
    if (tool.slug === "pdf-merge") return "開始合併";
    return "開始轉換";
  };

  const startConversion = async () => {
    if (!tool || !files.length) return;

    setIsConverting(true);
    setStatus(null);
    setStatusError(null);

    try {
      // 1) 逐檔案上傳到 S3，取得 key 陣列
      const uploadedKeys: string[] = [];

      for (const file of files) {
        // 1-1) 取得 upload url
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

        // 1-2) 上傳檔案
        const putRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!putRes.ok) throw new Error("Upload failed");

        uploadedKeys.push(key);
      }

      if (!uploadedKeys.length) {
        throw new Error("No files uploaded");
      }

      // 2) 決定 output_format（通用邏輯）
      const firstFile = files[0];
      const extFromName =
        firstFile?.name.includes(".") &&
        firstFile.name.split(".").pop()?.toLowerCase();

      const outputFormat =
        settings.output_format ||
        tool.output_formats?.[0] ||
        extFromName ||
        "pdf";

      // 3) 組合 settings（含多檔工具的 files）
      const finalSettings: Record<string, any> = { ...settings };

      // 多檔工具一定帶 files（pdf-merge 需要）
      if (uploadedKeys.length >= 1 && tool.allow_multiple) {
        finalSettings.files = uploadedKeys;
      }

      // 4) start conversion
      const startRes = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: uploadedKeys[0], // 舊協議：主檔案/第一個
          target_format: outputFormat,
          tool_slug: tool.slug,
          settings: finalSettings,
        }),
      });

      if (!startRes.ok) {
        const txt = await startRes.text();
        throw new Error(txt || "Failed to start conversion");
      }

      const startData = await startRes.json();
      const jobId = startData.job_id ?? startData.jobId;
      if (!jobId) throw new Error("No job_id returned from backend");

      // 5) poll 狀態
      await poll(jobId);
    } catch (err: any) {
      setStatusError(err.message ?? "Unknown error");
    } finally {
      setIsConverting(false);
    }
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

  // ------------------ UI ------------------

  if (loadingSchema) return <div className="p-8">Loading…</div>;
  if (!tool)
    return (
      <div className="p-8 text-red-600">
        {schemaError ?? "Tool not found"}
      </div>
    );

  const isMulti = !!tool.allow_multiple;
  const selectedExts =
    tool.input_formats?.map((x) => `.${x.toLowerCase()}`).join(",") || undefined;

  const isZipResult =
    !!status &&
    (status.file_url?.toLowerCase()?.includes(".zip") ||
      status.output_s3_key?.toLowerCase()?.endsWith(".zip"));

  const statusTone =
    status?.status === "completed"
      ? "text-green-600"
      : status?.status === "failed"
      ? "text-red-600"
      : "text-blue-600";

  const buttonLabel = useMemo(() => getActionLabel(), [tool]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{tool.name}</h1>
        <p className="text-slate-600 mt-2">{tool.description}</p>
      </header>

      {/* File upload */}
      <section className="p-5 border rounded-2xl space-y-3 bg-white/60">
        <h2 className="font-semibold text-lg">
          1. 上傳檔案
          {isMulti && (
            <span className="ml-2 text-xs text-slate-500">(可多選、可補選)</span>
          )}
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          multiple={isMulti}
          accept={selectedExts}
          onChange={handleFilesChange}
          className="text-sm"
        />

        {files.length > 0 && (
          <div className="mt-2 space-y-1 text-sm">
            <p className="font-medium">已選擇 {files.length} 個檔案：</p>
            <ul className="space-y-2">
              {files.map((f, idx) => (
                <li
                  key={`${fileKey(f)}-${idx}`}
                  className="flex items-center justify-between border rounded-lg px-3 py-2 bg-white"
                >
                  <span className="truncate mr-3">{f.name}</span>
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => removeFile(idx)}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>

            {isMulti && (
              <p className="text-xs text-slate-500">
                小提示：你可以多次選檔來補齊清單，不會清掉先前選取的檔案。
              </p>
            )}
          </div>
        )}

        {files.length === 0 && (
          <p className="text-xs text-slate-500">
            支援的格式：{tool.input_formats.join(", ")}
          </p>
        )}
      </section>

      {/* Settings form */}
      <section className="p-5 border rounded-2xl space-y-3 bg-white/60">
        <h2 className="font-semibold text-lg">2. 設定參數</h2>

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
                  className="border rounded-md px-3 py-2 text-sm w-full bg-white"
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
                  className="border rounded-md px-3 py-2 text-sm w-full bg-white"
                  value={settings[key] ?? ""}
                  min={def.min}
                  max={def.max}
                  step={def.step ?? 1}
                  onChange={(e) =>
                    handleSettingChange(key, Number(e.target.value))
                  }
                />
              )}

              {def.type === "boolean" && (
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!settings[key]}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                  />
                  <span className="text-slate-600">{def.label}</span>
                </label>
              )}
            </div>
          );
        })}
      </section>

      {/* Start button & status */}
      <section className="p-5 border rounded-2xl space-y-4 bg-white/60">
        <h2 className="font-semibold text-lg">3. 開始</h2>

        <button
          className="
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            px-5 py-2 rounded-lg
            disabled:opacity-50
          "
          disabled={isConverting || !files.length}
          onClick={startConversion}
        >
          {isConverting ? "處理中…" : buttonLabel}
        </button>

        {statusError && (
          <p className="text-sm text-red-600">{statusError}</p>
        )}

        {status && (
          <div className="text-sm space-y-1">
            <p>
              狀態：
              <span className={`font-semibold ${statusTone}`}>
                {" "}
                {status.status}
              </span>
            </p>
            <p className="text-slate-600">進度：{status.progress}%</p>
            {status.message && (
              <p className="text-slate-600">{status.message}</p>
            )}

            {status.status === "completed" && status.file_url && (
              <div className="mt-2 space-y-2">
                {isZipResult && (
                  <p className="text-xs text-slate-600">
                    多檔或多頁結果已打包成 ZIP，下載後解壓即可取得全部檔案。
                  </p>
                )}
                <a
                  href={status.file_url}
                  target="_blank"
                  className="
                    inline-block
                    bg-green-600 hover:bg-green-700
                    text-white font-medium
                    px-4 py-2 rounded-lg
                  "
                >
                  下載結果檔案
                </a>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
