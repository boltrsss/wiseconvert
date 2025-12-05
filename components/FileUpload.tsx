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

const API_BASE = "/api";
console.log("[FileUpload] API_BASE =", API_BASE);

type FileUploadProps = {
  inputFormat?: string;   // e.g. "JPG"
  outputFormat?: string;  // e.g. "PNG" (初始預設)
};

export default function FileUpload({
  inputFormat,
  outputFormat = "png",
}: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 全局 Output format（使用者可改）
  const [selectedFormat, setSelectedFormat] = useState(
    (outputFormat || "png").toLowerCase()
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
    };

    setItems((prev) => [...prev, item]);
    return item;
  };

  const updateItem = (id: string, patch: Partial<UploadItem> | any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  // 多帶一個 format 進來，確保每個檔案用當下選到的格式
  const runJobPipeline = async (item: UploadItem, format: string) => {
    try {
      console.log("[pipeline] start for", item.name);

      updateItem(item.id, { status: "uploading", progress: 0 });

      // 1. 拿 presigned URL
      const uploadInfo = await getUploadUrl(item.file);
      console.log("[pipeline] got upload URL", uploadInfo);

      // 2. 上傳到 S3
      await uploadFileToS3(item.file, uploadInfo.upload_url);
      console.log("[pipeline] uploaded to S3");

      updateItem(item.id, { status: "processing", progress: 10 });

      // 3. 呼叫轉檔 API
      const targetFormat = (format || "png").toLowerCase();
      const { job_id } = await startConversion(uploadInfo.key, targetFormat);

      console.log("[pipeline] job started", job_id);

      updateItem(item.id, { jobId: job_id, status: "processing" });

      // 4. 定時 polling
      const poll = async (): Promise<void> => {
        console.log("[pipeline] polling", job_id);
        const res: StatusResponse = await getJobStatus(job_id);

        console.log("[pipeline] status", res);

        if (res.status === "completed") {
          const anyRes = res as any;
          const downloadUrlFromApi =
            anyRes.download_url ?? anyRes.output_url ?? null;

          updateItem(item.id, {
            status: "done",
            progress: 100,
            outputKey: res.output_s3_key,
            ...(downloadUrlFromApi ? { downloadUrl: downloadUrlFromApi } : {}),
          } as any);
          return;
        }

        if (res.status === "failed" || res.status === "error") {
          updateItem(item.id, {
            status: "error",
            progress: 100,
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
      });
    }
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const formatForThisBatch = selectedFormat; // 這批檔案用當下選到的格式

      for (const file of list) {
        const item = addItem(file);
        void runJobPipeline(item, formatForThisBatch);
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

  const onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
      e.target.value = "";
    }
  };

  const displayOutput = selectedFormat.toUpperCase();

  const onFormatChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedFormat(e.target.value.toLowerCase());
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Drop zone */}
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

          {/* Output format 選單（點選時要阻止冒泡，不然會觸發選檔） */}
          <div
            className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Output format:</span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
              value={selectedFormat}
              onChange={onFormatChange}
            >
              <optgroup label="Images">
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
                <option value="heic">HEIC</option>
              </optgroup>
              <optgroup label="Videos">
                <option value="mp4">MP4</option>
                <option value="mov">MOV</option>
              </optgroup>
              <optgroup label="Audio">
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
              </optgroup>
              <optgroup label="Documents">
                <option value="pdf">PDF</option>
              </optgroup>
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

                {/* 右側 Download 按鈕（完成時顯示） */}
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
