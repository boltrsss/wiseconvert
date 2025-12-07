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

export default function FileUpload({
  inputFormat,
  outputFormat = "png",
}: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 🔔 全頁面的錯誤 Banner
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // 🔽 使用者選擇的輸出格式
  const [selectedOutputFormat, setSelectedOutputFormat] = useState(
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

  const runJobPipeline = async (item: UploadItem) => {
    try {
      updateItem(item.id, { status: "uploading", progress: 0 });

      // 1. 拿上傳 URL
      const uploadInfo = await getUploadUrl(item.file);

      // 2. 上傳到 S3
      await uploadFileToS3(item.file, uploadInfo.upload_url);
      updateItem(item.id, { status: "processing", progress: 10 });

      // 3. 呼叫轉檔 API，格式用目前選擇的輸出格式
      const targetFormat = (selectedOutputFormat || "png").toLowerCase();
      const { job_id } = await startConversion(uploadInfo.key, targetFormat);

      updateItem(item.id, { jobId: job_id, status: "processing" });

      // 4. polling 狀態
      const poll = async (): Promise<void> => {
        const res: StatusResponse = await getJobStatus(job_id);

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
          const msg = res.message ?? "";
          const lower = msg.toLowerCase();

          updateItem(item.id, {
            status: "error",
            progress: 100,
            errorMessage: msg,
          } as any);

          if (lower.includes("not supported")) {
            setErrorBanner("目前不支援此格式轉檔，請改用 PNG / JPG。");
          } else if (!errorBanner) {
            setErrorBanner("轉檔時發生錯誤，請稍後再試。");
          }
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
    } catch (err: any) {
      console.error("[pipeline] error", err);
      const msg =
        typeof err?.message === "string" ? err.message : "Conversion failed.";

      updateItem(item.id, {
        status: "error",
        progress: 100,
        errorMessage: msg,
      } as any);

      const lower = msg.toLowerCase();
      if (lower.includes("not supported")) {
        setErrorBanner("目前不支援此格式轉檔，請改用 PNG / JPG。");
      } else if (!errorBanner) {
        setErrorBanner("轉檔時發生錯誤，請稍後再試。")
