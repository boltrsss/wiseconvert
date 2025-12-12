"use client";

import React, { useEffect, useState } from "react";
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
  raw?: any; // 後端有塞 all_output_keys 在這裡
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cnv.wiseconverthub.com";

export default function DynamicToolPage() {
  const params = useParams();
  const slug = params.slug as string;

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
        const res = await fetch(`${API_BASE_URL}/api/tools/${slug}`);
        if (!res.ok) throw new Error("Tool not found.");

        const data: ToolSchema = await res.json();
        setTool(data);

        // 初始化設定值
        const init: Record<string, any> = {};
        Object.entries(data.settings).forEach(([key, def]) => {
          init[key] = def.default ?? "";
        });
        setSettings(init);
      } catch (err: any) {
        setSchemaError(err.message);
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setStatus(null);
    setStatusError(null);
  };

  const startConversion = async () => {
    if (!tool || !file) return;

    setIsConverting(true);
    setStatus(null);
    setStatusError(null);

    try {
      // 1) get upload url
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

      // 2) upload
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed");

      // 3) get output_format
      const outputFormat =
        settings.output_format ||
        tool.output_formats?.[0] ||
        file.name.split(".").pop();

      // 4) start conversion
      const startRes = await fetch(`${API_BASE_URL}/api/start-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: key,
          target_format: outputFormat,
          tool_slug: tool.slug,
          settings,
        }),
      });
      if (!startRes.ok) throw new Error(await startRes.text());

      const startData = await startRes.json();
      const jobId = startData.job_id ?? startData.jobId;

      // 5) poll
      await poll(jobId);
    } catch (err: any) {
      setStatusError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const poll = async (jobId: string) => {
    let done = false;

    while (!done) {
      const res = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
      const data: StatusResponse = await res.json();
      setStatus(data);

      if (data.status === "completed" || data.status === "failed") {
        done = true;
        break;
      }

      await new Promise((r) => setTimeout(r, 2000));
    }
  };

  // ---- 判斷是否 ZIP（例如 pdf-to-jpg 多頁） ----
  const isZipResult =
    !!status &&
    (status.file_url?.toLowerCase().includes(".zip") ||
      status.output_s3_key?.toLowerCase().endswith?.(".zip"));

  const pagesCount =
    (status?.raw &&
      Array.isArray(status.raw.all_output_keys) &&
      status.raw.all_output_keys.length) ||
    undefined;

  // ------------------ UI ------------------

  if (loadingSchema) return <div className="p-8">Loading…</div>;
  if (!tool)
    return (
      <div className="p-8 text-red-600">
        {schemaError ?? "Tool not found"}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{tool.name}</h1>
        <p className="text-slate-600 mt-2">{tool.description}</p>
      </header>

      {/* File upload */}
      <section className="p-4 border rounded-xl space-y-3">
        <h2 className="font-semibold text-lg">1. 上傳檔案</h2>
        <input
          type="file"
          accept={tool.input_formats.map((x) => `.${x}`).join(",")}
          onChange={handleFile}
          className="text-sm"
        />
        {file && <p className="text-sm">檔案：{file.name}</p>}
      </section>

      {/* Settings form */}
      <section className="p-4 border rounded-xl space-y-3">
        <h2 className="font-semibold text-lg">2. 設定參數</h2>

        {Object.entries(tool.settings).map(([key, def]) => {
          if (!shouldShow(key)) return null;

          return (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium">
                {def.label}
              </label>

              {def.type === "select" && (
                <select
                  className="border rounded-md px-3 py-1 text-sm w-full"
                  value={settings[key] ?? ""}
                  onChange={(e) =>
                    handleSettingChange(key, e.target.value)
                  }
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
                  className="border rounded-md px-3 py-1 text-sm w-full"
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
                <input
                  type="checkbox"
                  checked={!!settings[key]}
                  onChange={(e) =>
                    handleSettingChange(key, e.target.checked)
                  }
                />
              )}
            </div>
          );
        })}
      </section>

      {/* Start button & status */}
      <section className="p-4 border rounded-xl space-y-4">
        <h2 className="font-semibold text-lg">3. 開始轉換</h2>

        <button
          className="border px-4 py-2 rounded-md disabled:opacity-50"
          disabled={isConverting || !file}
          onClick={startConversion}
        >
          {isConverting ? "處理中…" : "Start Conversion"}
        </button>

        {statusError && (
          <p className="text-sm text-red-600">{statusError}</p>
        )}

        {status && (
          <div className="text-sm space-y-2 mt-2">
            <p>
              狀態：<span className="font-semibold">{status.status}</span>
            </p>
            <p>進度：{status.progress}%</p>

            {/* 後端訊息顯示區塊 */}
            {status.message && (
              <div className="text-xs text-gray-700 bg-gray-100 p-2 rounded border border-gray-200">
                {status.message}
              </div>
            )}

            {status.status === "completed" && status.file_url && (
              <div className="mt-3">
                {isZipResult ? (
                  <div className="flex flex-col items-start gap-2">
                    <div className="text-green-600 font-semibold text-sm">
                      ZIP 檔案已準備好，可以下載全部頁面。
                    </div>
                    <button
                      onClick={() => {
                        window.location.href = status.file_url!;
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm animate-pulse"
                    >
                      下載 ZIP（所有頁面）
                    </button>
                    {pagesCount && (
                      <div className="text-xs text-gray-500">
                        共 {pagesCount} 張 JPG 已打包。
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={status.file_url}
                    target="_blank"
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                  >
                    下載結果檔案
                  </a>
                )}
              </div>
            )}

            {status.status === "failed" && (
              <p className="text-xs text-red-600">
                轉換失敗，請確認檔案格式是否正確或稍後再試。
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
