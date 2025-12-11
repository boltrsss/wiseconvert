"use client";

import React, { useEffect, useState } from "react";

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
  helperText?: string;
};

type ToolSchema = {
  slug: string;
  name: string;
  category: string;
  description: string;
  input_formats: string[];
  output_formats: string[];
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

export default function VideoConvertPage() {
  const [tool, setTool] = useState<ToolSchema | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isConverting, setIsConverting] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // 取得工具 schema
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoadingSchema(true);
        const res = await fetch(`${API_BASE_URL}/api/tools/video-convert`);
        if (!res.ok) {
          throw new Error(`Failed to load tool schema: ${res.status}`);
        }
        const data: ToolSchema = await res.json();
        setTool(data);

        // 初始化設定值（使用 default）
        const initial: Record<string, any> = {};
        Object.entries(data.settings).forEach(([key, def]) => {
          initial[key] = def.default ?? "";
        });
        setSettings(initial);
      } catch (err: any) {
        console.error(err);
        setSchemaError(err.message ?? "Failed to load tool definition.");
      } finally {
        setLoadingSchema(false);
      }
    };

    fetchSchema();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setStatus(null);
    setStatusError(null);
  };

  // 核心：上傳 → start-conversion → polling status
  const handleStartConversion = async () => {
    if (!tool) return;
    if (!file) {
      alert("請先選擇一個影片檔。");
      return;
    }

    setIsConverting(true);
    setStatus(null);
    setStatusError(null);

    try {
      // 1) 取得 upload URL
      const uploadRes = await fetch(`${API_BASE_URL}/api/get-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: file.name,
          content_type: file.type || "application/octet-stream",
        }),
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const uploadData = await uploadRes.json();
      const { upload_url, key } = uploadData as {
        upload_url: string;
        key: string;
      };

      // 2) 上傳到 S3
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // 3) 開始轉檔
      const outputFormat =
        settings.output_format || tool.output_formats[0] || "mp4";

      const startRes = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: key,
          target_format: outputFormat,
          tool_slug: tool.slug, // "video-convert"
          settings: {
            codec: settings.codec,
            resolution: settings.resolution,
            frameRate: settings.frameRate,
          },
        }),
      });

      if (!startRes.ok) {
        const errText = await startRes.text();
        throw new Error(`Failed to start conversion: ${errText}`);
      }

      const startData = await startRes.json();
      const jobId: string = startData.job_id ?? startData.jobId;

      // 4) Poll status
      await pollStatus(jobId);
    } catch (err: any) {
      console.error(err);
      setStatusError(err.message ?? "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  const pollStatus = async (jobId: string) => {
    let finished = false;

    while (!finished) {
      const res = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
      if (!res.ok) {
        throw new Error(`Failed to get status for job ${jobId}`);
      }
      const data: StatusResponse = await res.json();
      setStatus(data);

      if (data.status === "completed" || data.status === "failed") {
        finished = true;
        break;
      }

      // 避免塞爆 backend，稍微等一下
      await new Promise((r) => setTimeout(r, 2000));
    }
  };

  // ---------- UI ----------

  if (loadingSchema) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse text-slate-500">Loading tool…</div>
      </div>
    );
  }

  if (schemaError || !tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Video Converter</h1>
        <p className="text-red-600">
          無法載入工具定義：{schemaError ?? "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
        <p className="text-slate-600">{tool.description}</p>
      </header>

      {/* 檔案上傳 */}
      <section className="space-y-3 border border-slate-200 rounded-xl p-4">
        <h2 className="font-semibold text-lg">1. 選擇影片檔案</h2>
        <input
          type="file"
          accept={tool.input_formats.map((ext) => `.${ext}`).join(",")}
          onChange={handleFileChange}
          className="block w-full text-sm"
        />
        {file && (
          <p className="text-sm text-slate-600">
            已選擇：<span className="font-medium">{file.name}</span>
          </p>
        )}
      </section>

      {/* 設定表單 */}
      <section className="space-y-3 border border-slate-200 rounded-xl p-4">
        <h2 className="font-semibold text-lg">2. 設定轉檔參數</h2>

        {/* Output format */}
        {"output_format" in tool.settings && (
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              {tool.settings.output_format.label}
            </label>
            <select
              className="border rounded-md px-3 py-1 text-sm w-full"
              value={settings.output_format ?? ""}
              onChange={(e) =>
                handleSettingChange("output_format", e.target.value)
              }
            >
              {tool.settings.output_format.options?.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Codec */}
        {"codec" in tool.settings && (
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              {tool.settings.codec.label}
            </label>
            <select
              className="border rounded-md px-3 py-1 text-sm w-full"
              value={settings.codec ?? ""}
              onChange={(e) => handleSettingChange("codec", e.target.value)}
            >
              {tool.settings.codec.options?.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {tool.settings.codec.helperText && (
              <p className="text-xs text-slate-500">
                {tool.settings.codec.helperText}
              </p>
            )}
          </div>
        )}

        {/* Resolution */}
        {"resolution" in tool.settings && (
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              {tool.settings.resolution.label}
            </label>
            <select
              className="border rounded-md px-3 py-1 text-sm w-full"
              value={settings.resolution ?? ""}
              onChange={(e) =>
                handleSettingChange("resolution", e.target.value)
              }
            >
              {tool.settings.resolution.options?.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Frame rate */}
        {"frameRate" in tool.settings && (
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              {tool.settings.frameRate.label}
            </label>
            <select
              className="border rounded-md px-3 py-1 text-sm w-full"
              value={settings.frameRate ?? ""}
              onChange={(e) =>
                handleSettingChange("frameRate", Number(e.target.value))
              }
            >
              {tool.settings.frameRate.options?.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Start button + Status */}
      <section className="space-y-4 border border-slate-200 rounded-xl p-4">
        <h2 className="font-semibold text-lg">3. 開始轉檔</h2>

        <button
          onClick={handleStartConversion}
          disabled={!file || isConverting}
          className="inline-flex items-center px-4 py-2 rounded-md border text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isConverting ? "正在處理…" : "Start Conversion"}
        </button>

        {statusError && (
          <p className="text-sm text-red-600">錯誤：{statusError}</p>
        )}

        {status && (
          <div className="space-y-1 text-sm">
            <p>
              狀態：<span className="font-medium">{status.status}</span>
            </p>
            <p>進度：{status.progress}%</p>
            {status.message && (
              <p className="text-slate-600">訊息：{status.message}</p>
            )}

            {status.status === "completed" && status.file_url && (
              <a
                href={status.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-2 px-4 py-2 rounded-md border text-sm font-medium"
              >
                Download Converted Video
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
