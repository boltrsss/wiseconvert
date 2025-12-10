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
import {
  errorMessages,
  type ErrorMessageKey,
} from "@/lib/errorMessages";
import { useLang } from "@/context/LanguageContext";
import {
  VideoSettingsModal,
  type VideoSettings,
} from "@/components/VideoSettingsModal";

type FileUploadProps = {
  inputFormat?: string; // 顯示用，例如 "JPG"
  outputFormat?: string; // 預設輸出格式，例如 "PNG" / "GIF" / "MP4"
};

// 只有「圖片工具」可以切換的輸出格式
const IMAGE_OUTPUT_OPTIONS = ["png", "jpg", "jpeg", "webp"] as const;
type ImageOutput = (typeof IMAGE_OUTPUT_OPTIONS)[number];

export default function FileUpload({
  inputFormat,
  outputFormat = "png",
}: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { lang } = useLang(); // lang: "en" | "zh"

  const getErrorText = (key: ErrorMessageKey) => errorMessages[key][lang];

  // ==== 判斷這個工具的「基礎輸出格式」 ====
  const baseOutput = (outputFormat || "png").toLowerCase();
  const isImageTool = IMAGE_OUTPUT_OPTIONS.includes(
    baseOutput as ImageOutput
  );

  // 圖片工具：可以切換輸出；非圖片工具：輸出固定為 baseOutput
  const [selectedOutput, setSelectedOutput] = useState(baseOutput);
  const effectiveOutput = isImageTool ? selectedOutput : baseOutput;

  // ==== 影片進階設定 ====
  const [isVideoSettingsOpen, setIsVideoSettingsOpen] = useState(false);
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    codec: "h264",
    resolution: "1080p",
    aspectRatio: "16:9",
    frameRate: 30,
  });

  // 影片工具：mp4 / webm / gif / mp3 這類（用 baseOutput 判斷）
  const isVideoTool =
    baseOutput === "mp4" ||
    baseOutput === "webm" ||
    baseOutput === "gif" ||
    baseOutput === "mp3";

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
      // 每個檔案記住當下的有效輸出格式
      outputFormat: effectiveOutput,
    };

    setItems((prev) => [...prev, item]);
    return item;
  };

  const updateItem = (id: string, patch: Partial<UploadItem> | any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const handleUnsupportedFormat = (itemId: string) => {
    const msg = getErrorText("unsupportedFormat");
    updateItem(itemId, {
      status: "error",
      progress: 100,
      errorMessage: msg,
    });
    setGlobalError(msg);
  };

  const runJobPipeline = async (item: UploadItem) => {
    try {
      const ext = item.name.split(".").pop()?.toLowerCase();
      if (ext === "avif") {
        handleUnsupportedFormat(item.id);
        return;
      }

      updateItem(item.id, { status: "uploading", progress: 0 });

      // 1. 取得上傳 URL
      const uploadInfo = await getUploadUrl(item.file);

      // 2. 上傳到 S3
      await uploadFileToS3(item.file, uploadInfo.upload_url);
      updateItem(item.id, { status: "processing", progress: 10 });

      // 3. 呼叫轉檔 API，使用檔案自己的 outputFormat 或目前有效輸出格式
      const targetFormat = (
        item.outputFormat || effectiveOutput || "png"
      ).toLowerCase();

      // ⚠️ 目前 videoSettings 還沒送到後端，先保留在前端
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
          });
          return;
        }

        if (res.status === "failed" || res.status === "error") {
          const rawMsg = (res as any).message as string | undefined;
          const isUnsupported =
            rawMsg?.toLowerCase().includes("ffmpeg") ||
            rawMsg?.toLowerCase().includes("unsupported") ||
            rawMsg?.toLowerCase().includes("invalid data");

          const msg = isUnsupported
            ? getErrorText("unsupportedFormat")
            : getErrorText("conversionFailed");

          updateItem(item.id, {
            status: "error",
            progress: 100,
            errorMessage: msg,
          });
          setGlobalError(msg);
          return;
        }

        const nextProgress = Math.min(95, (res.progress ?? 0) || 20);
        updateItem(item.id, { progress: nextProgress });

        setTimeout(poll, 3000);
      };

      setTimeout(poll, 3000);
    } catch (err) {
      console.error("[pipeline] error", err);
      const msg = getErrorText("conversionFailed");
      updateItem(item.id, {
        status: "error",
        progress: 100,
        errorMessage: msg,
      });
      setGlobalError(msg);
    }
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      for (const file of list) {
        const item = addItem(file);
        void runJobPipeline(item);
      }
    },
    [effectiveOutput, lang]
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

  const displayOutput = (effectiveOutput || "png").toUpperCase();

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Global error */}
      {globalError && (
        <div className="w-full max-w-3xl mx-auto mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start justify-between gap-3">
          <div className="flex gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{globalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalError(null)}
            className="text-red-400 hover:text-red-600 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 上方：輸出說明 +（圖片工具才有）下拉 +（影片工具）進階設定 */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between text-sm mb-1">
        <div className="text-gray-600">
          {inputFormat
            ? lang === "zh"
              ? `將 ${inputFormat} 檔案轉成 ${displayOutput}`
              : `Convert ${inputFormat} files to ${displayOutput}`
            : lang === "zh"
            ? `檔案將被轉成 ${displayOutput}`
            : `Files will be converted to ${displayOutput}`}
        </div>

        <div className="flex items-center gap-3">
          {/* 只有圖片工具可以選擇輸出格式 */}
          {isImageTool && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                {lang === "zh" ? "輸出格式" : "Output format"}
              </span>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedOutput}
                onChange={(e) => setSelectedOutput(e.target.value)}
              >
                {IMAGE_OUTPUT_OPTIONS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 影片工具：顯示進階影片設定按钮 */}
          {isVideoTool && (
            <button
              type="button"
              onClick={() => setIsVideoSettingsOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs sm:text-[13px] text-slate-600 hover:bg-slate-50"
            >
              🎬{" "}
              {lang === "zh"
                ? "影片進階設定"
                : "Advanced video settings"}
            </button>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`w-full max-w-3xl border-2 border-dashed rounded-2xl p-10 mx-auto text-center transition-colors cursor-pointer ${
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
            {lang === "zh" ? "拖放檔案到這裡，或" : "Drop files here or "}
            <span className="text-blue-600 underline">
              {lang === "zh" ? "點擊選擇" : "browse"}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            {inputFormat
              ? lang === "zh"
                ? `將 ${inputFormat} 檔案轉成 ${displayOutput}。`
                : `Convert ${inputFormat} files to ${displayOutput}.`
              : lang === "zh"
              ? `檔案將被轉成 ${displayOutput}。`
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
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="font-semibold mb-3 text-sm">
          {lang === "zh" ? "轉檔佇列" : "Conversion Queue"}
        </h2>
        {items.length === 0 && (
          <p className="text-sm text-gray-400">
            {lang === "zh"
              ? "尚未加入檔案，拖放檔案即可開始轉檔。"
              : "No files yet. Drop a file to start converting."}
          </p>
        )}
        <ul className="space-y-3">
          {items.map((item) => {
            const anyItem = item as any;
            const downloadUrl = anyItem.downloadUrl as string | undefined;

            return (
              <li
                key={item.id}
                className="flex flex-col gap-2 text-sm border border-gray-100 rounded-xl px-3 py-2"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {(item.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                      {item.status} · →{" "}
                      {(item.outputFormat || effectiveOutput).toUpperCase()}
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
                  </div>

                  {item.status === "done" && downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {lang === "zh" ? "下載" : "Download"}
                    </a>
                  )}
                </div>

                {item.errorMessage && (
                  <div className="text-xs text-red-500 mt-0.5">
                    {item.errorMessage}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* 影片進階設定 Modal */}
      <VideoSettingsModal
        open={isVideoSettingsOpen}
        value={videoSettings}
        onClose={() => setIsVideoSettingsOpen(false)}
        onSave={(next) => {
          setVideoSettings(next);
          setIsVideoSettingsOpen(false);
        }}
      />
    </div>
  );
}
