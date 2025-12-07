"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  getUploadUrl,
  uploadFileToS3,
  startConversion,
  getJobStatus,
  type StatusResponse,
} from "@/lib/api";
import { UploadItem, UploadStatus } from "@/types/files";

type FileUploadProps = {
  inputFormat?: string;   // 顯示用，例如 "JPG"
  outputFormat?: string;  // 預設輸出格式，例如 "PNG"
};

// 可選的輸出格式（之後可以依工具類型再細分）
const BASE_OUTPUT_FORMATS = ["png", "jpg", "webp", "pdf"];

export default function FileUpload({
  inputFormat,
  outputFormat = "png",
}: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // 目前選擇的輸出格式（影響之後上傳的檔案）
  const [selectedFormat, setSelectedFormat] = useState(
    (outputFormat || "png").toLowerCase()
  );

  // 下拉選單中顯示的可選格式（包含 page 傳進來的 outputFormat）
  const availableFormats = Array.from(
    new Set(
      [outputFormat, ...BASE_OUTPUT_FORMATS]
        .filter(Boolean)
        .map((f) => f!.toLowerCase())
    )
  );

  const addItem = (file: File): UploadItem => {
    const id = crypto.randomUUID();

    const item: UploadItem = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      isVideo: file.type.startsWith("video/"),
      status: "waiting" as UploadStatus,
      progress: 0,
      outputFormat: selectedFormat, // ⭐ 必填，修正 Cloudflare build error
    };

    setItems((prev) => [...prev, item]);
    return item;
  };

  const updateItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const runJobPipeline = async (item: UploadItem) => {
    try {
      updateItem(item.id, { status: "uploading", progress: 0 });

      // 1. 取得上傳 URL
      const uploadInfo = await getUploadUrl(item.file);

      // 2. 上傳到 S3
      await uploadFileToS3(item.file, uploadInfo.upload_url);
      updateItem(item.id, { status: "processing", progress: 10 });

      // 3. 呼叫轉檔 API，使用當時記錄在 item 裡的 outputFormat
      const targetFormat = (item.outputFormat || selectedFormat || "png").toLowerCase();
      const { job_id } = await startConversion(uploadInfo.key, targetFormat);

      updateItem(item.id, { jobId: job_id, status: "processing" });

      // 4. Polling 狀態
      const poll = async (): Promise<void> => {
        const res: StatusResponse = await getJobStatus(job_id);

        if (res.status === "completed") {
          const anyRes = res as any;
          const downloadUrlFromApi =
            anyRes.file_url ?? anyRes.download_url ?? anyRes.output_url ?? null;

          updateItem(item.id, {
            status: "done",
            progress: 100,
            outputKey: res.output_s3_key,
            ...(downloadUrlFromApi ? { downloadUrl: downloadUrlFromApi } : {}),
            errorMessage: undefined,
          });
          return;
        }

        if (res.status === "failed" || res.status === "error") {
          const anyRes = res as any;
          const rawMsg =
            anyRes.message ||
            anyRes.error ||
            "轉檔失敗，請稍後再試。";

          let friendly = "轉檔失敗，請稍後再試。";
          const lowerMsg = String(rawMsg).toLowerCase();
          const lowerName = item.name.toLowerCase();

          const isAvif =
            lowerName.endsWith(".avif") ||
            item.type === "image/avif" ||
            lowerMsg.includes("avif");

          // 🔔 特別處理 AVIF 不支援情況
          if (isAvif && lowerMsg.includes("ffmpeg version")) {
            friendly = "目前不支援 AVIF 轉檔，請改用 PNG / JPG。";
            setErrorBanner(friendly);
          }

          updateItem(item.id, {
            status: "error",
            progress: 100,
            errorMessage: friendly,
          });
          return;
        }

        const nextProgress = Math.min(
          95,
          (res.progress ?? 0) || 20
        );
        updateItem(item.id, { progress: nextProgress });

        setTimeout(poll, 3000);
      };

      setTimeout(poll, 3000);
    } catch (err) {
      console.error("[pipeline] error", err);
      updateItem(item.id, {
        status: "error",
        progress: 100,
        errorMessage: "發生未知錯誤，請稍後再試。",
      });
    }
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      // 新上傳時，先清掉舊的 banner
      setErrorBanner(null);

      const list = Array.from(files);
      for (const file of list) {
        const item = addItem(file);
        void runJobPipeline(item);
      }
    },
    [runJobPipeline] // eslint 在本地會提醒，但在 CF build 不會出錯
  );

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dt = e.dataTransfer;
    if (!dt) return;
    if (dt.files && dt.files.length > 0) {
      handleFiles(dt.files);
    }
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
      e.target.value = "";
    }
  };

  const displayOutput = selectedFormat.toUpperCase();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 🔔 全域錯誤 Banner（例如 AVIF 不支援） */}
      {errorBanner && (
        <div className="w-full max-w-3xl mx-auto rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorBanner}
        </div>
      )}

      {/* Drop zone + format 選單 */}
      <div
        className={`w-full max-w-3xl border-2 border-dashed rounded-2xl p-10 mx-auto text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">⬆️</span>
          </div>
          <p className="text-lg font-semibold">
            Drop files here or{" "}
            <span className="text-blue-600 underline">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            {inputFormat
              ? `Convert ${inputFormat} files to ${displayOutput}.`
              : `Files will be converted to ${displayOutput}.`}
          </p>

          {/* 格式選單 */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-gray-500">Convert to</span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value.toLowerCase())}
              onClick={(e) => e.stopPropagation()} // 避免點選 select 觸發 inputRef click
            >
              {availableFormats.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onFileInputChange}
        />
      </div>

      {/* Queue */}
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-semibold mb-3">Conversion Queue</h2>
        {items.length === 0 && (
          <p className="text-sm text-gray-400">
            No files yet. Drop a file to start converting.
          </p>
        )}
        <ul className="space-y-3">
          {items.map((item) => {
            const downloadUrl = item.downloadUrl;

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                    {item.status} · to {item.outputFormat.toUpperCase()}
                  </div>
                  <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 transition-all ${
                        item.status === "error"
                          ? "bg-red-400"
                          : item.status === "done"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${item.progress ?? 0}%` }}
                    />
                  </div>
                  {item.errorMessage && (
                    <div className="mt-1 text-xs text-red-500">
                      {item.errorMessage}
                    </div>
                  )}
                </div>

                {/* 完成時顯示 Download 按鈕 */}
                {item.status === "done" && downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Download
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
