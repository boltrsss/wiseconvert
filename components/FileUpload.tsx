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

// ===== 影片進階設定型別（前端用） =====
type VideoSettingsState = {
  codec: "h264" | "h265" | "vp9" | "av1";
  resolution: "2160p" | "1440p" | "1080p" | "720p" | "480p";
  aspectRatio: "16:9" | "9:16" | "4:3" | "1:1";
  frameRate: 24 | 30 | 60;
};

// 在這個 component 裡，我們用「加強版」UploadItem
type UploadItemWithVideo = UploadItem & {
  videoSettings?: VideoSettingsState;
};

type FileUploadProps = {
  inputFormat?: string;   // 顯示用，例如 "JPG" 或 "MP4"
  outputFormat?: string;  // 預設輸出格式，例如 "PNG" 或 "GIF"
};

const OUTPUT_OPTIONS = ["png", "jpg", "jpeg", "webp"];

export default function FileUpload({
  inputFormat,
  outputFormat = "png",
}: FileUploadProps) {
  const [items, setItems] = useState<UploadItemWithVideo[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { lang } = useLang();

  const getErrorText = (key: ErrorMessageKey) => errorMessages[key][lang];

  // 全域輸出格式選單（預設用 props）
  const [selectedOutput, setSelectedOutput] = useState(
    (outputFormat || "png").toLowerCase()
  );

  // ===== 全域影片進階設定（預設值） =====
  const [videoSettings, setVideoSettings] = useState<VideoSettingsState>({
    codec: "h264",
    resolution: "1080p",
    aspectRatio: "16:9",
    frameRate: 30,
  });

  const [showVideoSettings, setShowVideoSettings] = useState(false);

  // 根據 inputFormat 粗略判斷是不是影片工具
  const isVideoTool = (() => {
    if (!inputFormat) return false;
    const f = inputFormat.toUpperCase();
    return ["MP4", "MOV", "M4V", "WEBM"].includes(f);
  })();

  const addItem = (file: File): UploadItemWithVideo => {
    const id = crypto.randomUUID();
    const isVideo =
      file.type.startsWith("video/") ||
      (isVideoTool && !file.type); // 沒有 type 時，用工具判斷

    const item: UploadItemWithVideo = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      isVideo,
      status: "waiting" as UploadStatus,
      progress: 0,
      outputFormat: selectedOutput,
      // ✅ 如果是影片，附上當下的進階設定
      videoSettings: isVideo ? videoSettings : undefined,
    };

    setItems((prev) => [...prev, item]);
    return item;
  };

  const updateItem = (id: string, patch: Partial<UploadItemWithVideo> | any) => {
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

  const runJobPipeline = async (item: UploadItemWithVideo) => {
    try {
      const ext = item.name.split(".").pop()?.toLowerCase();
      if (ext === "avif") {
        handleUnsupportedFormat(item.id);
        return;
      }

      updateItem(item.id, { status: "uploading", progress: 0 });

      // 1. S3 上傳 URL
      const uploadInfo = await getUploadUrl(item.file);

      // 2. 上傳到 S3
      await uploadFileToS3(item.file, uploadInfo.upload_url);
      updateItem(item.id, { status: "processing", progress: 10 });

      // 3. 呼叫轉檔 API
      const targetFormat = (
        item.outputFormat || selectedOutput || "png"
      ).toLowerCase();

      // ✅ 只有影片才會帶 videoSettings（圖片 tools 不受影響）
      const videoPayload = item.isVideo ? item.videoSettings : undefined;

      const { job_id } = await startConversion(
        uploadInfo.key,
        targetFormat,
        videoPayload
      );

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
    [selectedOutput, videoSettings, lang] // ✅ 語系 / 影片設定變動，新檔案會吃到最新設定
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

  const displayOutput = (selectedOutput || outputFormat || "png").toUpperCase();

  // === UI ===
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Global Error Banner */}
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

      {/* 上方：輸出格式 + 影片進階設定按鈕 */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between text-sm mb-1 gap-3">
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
          {/* 只有影像工具保留下拉，影片工具就可以視需要改成固定 */}
          {!isVideoTool && (
            <>
              <span className="text-gray-500">
                {lang === "zh" ? "輸出格式" : "Output format"}
              </span>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedOutput}
                onChange={(e) => setSelectedOutput(e.target.value)}
              >
                {OUTPUT_OPTIONS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* 影片工具：顯示「影片進階設定」按鈕 */}
          {isVideoTool && (
            <button
              type="button"
              onClick={() => setShowVideoSettings(true)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              🎬 {lang === "zh" ? "影片進階設定" : "Video settings"}
            </button>
          )}
        </div>
      </div>

      {/* 影片進階設定 Modal（簡易版） */}
      {showVideoSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg text-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                {lang === "zh" ? "影片進階設定" : "Advanced video settings"}
              </h2>
              <button
                type="button"
                onClick={() => setShowVideoSettings(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {/* Codec */}
              <div className="flex items-center justify-between gap-3">
                <span>{lang === "zh" ? "編碼格式" : "Codec"}</span>
                <select
                  className="border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  value={videoSettings.codec}
                  onChange={(e) =>
                    setVideoSettings((prev) => ({
                      ...prev,
                      codec: e.target.value as VideoSettingsState["codec"],
                    }))
                  }
                >
                  <option value="h264">H.264 (MP4)</option>
                  <option value="h265">H.265 / HEVC</option>
                  <option value="vp9">VP9 (WebM)</option>
                  <option value="av1">AV1</option>
                </select>
              </div>

              {/* Resolution */}
              <div className="flex items-center justify-between gap-3">
                <span>{lang === "zh" ? "解析度" : "Resolution"}</span>
                <select
                  className="border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  value={videoSettings.resolution}
                  onChange={(e) =>
                    setVideoSettings((prev) => ({
                      ...prev,
                      resolution:
                        e.target.value as VideoSettingsState["resolution"],
                    }))
                  }
                >
                  <option value="2160p">4K (2160p)</option>
                  <option value="1440p">2K (1440p)</option>
                  <option value="1080p">Full HD (1080p)</option>
                  <option value="720p">HD (720p)</option>
                  <option value="480p">SD (480p)</option>
                </select>
              </div>

              {/* Frame rate */}
              <div className="flex items-center justify-between gap-3">
                <span>{lang === "zh" ? "影格率 (fps)" : "Frame rate"}</span>
                <select
                  className="border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  value={videoSettings.frameRate}
                  onChange={(e) =>
                    setVideoSettings((prev) => ({
                      ...prev,
                      frameRate: Number(
                        e.target.value
                      ) as VideoSettingsState["frameRate"],
                    }))
                  }
                >
                  <option value={24}>24</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVideoSettings(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
              >
                {lang === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  // ✅ 把目前 queue 裡所有「尚未開始的影片 item」也同步更新設定
                  setItems((prev) =>
                    prev.map((it) =>
                      (it as UploadItemWithVideo).isVideo &&
                      (it.status === "waiting" ||
                        it.status === "uploading" ||
                        it.status === "processing")
                        ? {
                            ...(it as UploadItemWithVideo),
                            videoSettings,
                          }
                        : it
                    )
                  );
                  setShowVideoSettings(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                {lang === "zh" ? "儲存設定" : "Save settings"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      {item.outputFormat?.toUpperCase()}
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
    </div>
  );
}
