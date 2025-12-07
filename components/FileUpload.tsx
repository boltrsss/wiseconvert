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

// 可以之後再做更細的規劃，先放一組常用
const AVAILABLE_OUTPUT_FORMATS = ["jpg", "png", "webp", "pdf", "mp4"];

export default function FileUpload({
  inputFormat,
  outputFormat = "png",
}: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(
    (outputFormat || "png").toLowerCase()
  );
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

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
      // 如果你在 UploadItem 裡有 outputFormat 欄位，可以加上：
      // outputFormat: selectedFormat,
    };

    setItems((prev) => [...prev, item]);
    return item;
  };

  const updateItem = (id: string, patch: Partial<UploadItem> | any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const runJobPipeline = async (item: UploadItem) => {
    try {
      updateItem(item.id, { status: "uploading", progress: 0 });

      // 1. 拿上傳 URL
      const uploadInfo = await getUploadUrl(item.file);

      // 2. 上傳到 S3
      await uploadFileToS3(item.file, uploadInfo.upload_url);
      updateItem(item.id, { status: "processing", progress: 10 });

      // 3. 呼叫轉檔 API，格式由「選單」決定
      const targetFormat =
        (selectedFormat || outputFormat || "png").toLowerCase();
      const { job_id } = await startConversion(uploadInfo.key, targetFormat);

      updateItem(item.id, { jobId: job_id, status: "processing" });

      // 4. polling 狀態
      const poll = async (): Promise<void> => {
        const res: StatusResponse = await getJobStatus(job_id);

        if (res.status === "completed") {
          const anyRes = res as any;
          // 這裡多看 file_url / download_url / output_url
          const downloadUrlFromApi =
            anyRes.file_url ?? anyRes.download_url ?? anyRes.output_url ?? null;

          updateItem(item.id, {
            status: "done",
            progress: 100,
            outputKey: res.output_s3_key,
            ...(downloadUrlFromApi ? { downloadUrl: downloadUrlFromApi } : {}),
          } as any);
          return;
        }

        if (res.status === "failed" || res.status === "error") {
          updateItem(item.id, { status: "error", progress: 100 });
          return;
        }

        const nextProgress = Math.min(95, (res.progress ?? 0) || 20);
        updateItem(item.id, { progress: nextProgress });

        setTimeout(poll, 3000);
      };

      setTimeout(poll, 3000);
    } catch (err) {
      console.error("[pipeline] error", err);
      updateItem(item.id, { status: "error", progress: 100 });
    }
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      for (const file of list) {
        const lowerName = file.name.toLowerCase();

        // ❌ 不支援 AVIF → 顯示 banner，直接略過這個檔案
        if (lowerName.endsWith(".avif")) {
          setErrorBanner("目前不支援 AVIF 轉檔，請改用 PNG / JPG");
          continue;
        }

        const item = addItem(file);
        void runJobPipeline(item);
      }
    },
    [selectedFormat]
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

  const displayOutput = (selectedFormat || outputFormat || "png").toUpperCase();

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 🔴 Error Banner（不支援格式） */}
      {errorBanner && (
        <div className="w-full max-w-3xl mx-auto rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm flex items-center justify-between">
          <span>{errorBanner}</span>
          <button
            type="button"
            className="ml-3 font-semibold"
            onClick={() => setErrorBanner(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Convert To 選單 */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-end gap-2 text-sm">
        <span className="text-gray-600">Convert to:</span>
        <select
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value.toLowerCase())}
        >
          {AVAILABLE_OUTPUT_FORMATS.map((fmt) => (
            <option key={fmt} value={fmt}>
              {fmt.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        className={`w-full max-w-3xl border-2 border-dashed rounded-2xl p-10 mx-auto text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
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
            const anyItem = item as any;
            const downloadUrl = anyItem.downloadUrl as string | undefined;

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                    {item.status}
                  </div>
                  <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-500 transition-all"
                      style={{ width: `${item.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* ✅ 轉檔完成才顯示 Download */}
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
