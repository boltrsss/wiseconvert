
"use client";

import React, { useEffect, useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import ConversionQueue from "@/components/ConversionQueue";
import SettingsModal from "@/components/SettingsModal";
import { UploadItem, VideoSettings } from "@/types/files";
import {
  getUploadUrl,
  uploadFileToS3,
  startConversion,
  getJobStatus
} from "@/lib/api";

const ALLOWED_EXTENSIONS = [
  "mp4","mkv","mov","avi","webm",
  "mp3","wav","ogg","aac","flac",
  "jpg","jpeg","png","webp","gif","heic","svg",
  "pdf","docx","pptx","xlsx",
  "epub","mobi","azw3"
];

function getExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

const FileUpload: React.FC = () => {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [settingsForFileId, setSettingsForFileId] = useState<string | null>(null);

  const updateItem = (id: string, updater: (item: UploadItem) => UploadItem) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const handleFilesSelected = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const newItems: UploadItem[] = arr.map((file) => {
      const ext = getExtension(file.name);
      const isAllowed = ALLOWED_EXTENSIONS.includes(ext);
      return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: isAllowed ? "idle" : "error",
        progress: isAllowed ? 0 : 100,
        isVideo: ["mp4", "mkv", "mov", "avi", "webm"].includes(ext),
        errorMessage: isAllowed ? undefined : "Unsupported file type."
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
    newItems.filter((i) => i.status === "idle").forEach((i) => handleUploadAndConvert(i.id));
  };

  const handleUploadAndConvert = async (id: string) => {
    const item = queue.find((x) => x.id === id);
    if (!item || item.status === "uploading" || item.status === "done") return;
    if (item.status === "error") return;

    try {
      updateItem(id, (cur) => ({ ...cur, status: "uploading", progress: 5 }));

      const { upload_url, key } = await getUploadUrl(item.file);
      await uploadFileToS3(item.file, upload_url);
      updateItem(id, (cur) => ({ ...cur, status: "uploading", progress: 40 }));

      const ext = getExtension(item.name);
      const targetExt = item.isVideo ? "mp4" : ext || "pdf";

      const resp = await startConversion(key, targetExt, item.videoSettings);
      updateItem(id, (cur) => ({
        ...cur,
        status: "processing",
        progress: 50,
        jobId: resp.job_id
      }));
    } catch (err: any) {
      console.error(err);
      updateItem(id, (cur) => ({
        ...cur,
        status: "error",
        progress: 100,
        errorMessage: err?.message || "Upload or conversion failed"
      }));
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const itemsWithJobs = queue.filter(
        (i) => i.jobId && (i.status === "processing" || i.status === "uploading")
      );
      if (itemsWithJobs.length === 0) return;

      for (const item of itemsWithJobs) {
        try {
          if (!item.jobId) continue;
          const status = await getJobStatus(item.jobId);
          updateItem(item.id, (cur) => {
            const next: UploadItem = { ...cur };
            if (status.progress !== undefined) {
              next.progress = status.progress;
            }
            if (status.status === "completed") {
              next.status = "done";
              next.progress = 100;
            } else if (status.status === "failed") {
              next.status = "error";
              next.progress = 100;
              next.errorMessage = status.message || "Conversion failed";
            } else if (status.status === "processing") {
              next.status = "processing";
            }
            return next;
          });
        } catch (e) {
          console.error(e);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [queue]);

  const handleOpenSettings = (fileId: string) => {
    setSettingsForFileId(fileId);
  };

  const handleSaveSettings = (settings: VideoSettings) => {
    if (!settingsForFileId) return;
    updateItem(settingsForFileId, (cur) => ({
      ...cur,
      videoSettings: settings
    }));
  };

  const currentSettingsItem: UploadItem | undefined = settingsForFileId
  ? queue.find((q) => q.id === settingsForFileId) || undefined
  : undefined;

  return (
    <div className="w-full flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-gray-900">WiseConvert Online File Converter</h1>
        <p className="mt-2 text-sm text-gray-500">
          Convert videos, audio, images, documents, and ebooks via a secure cloud backend.
        </p>
      </div>
      <UploadDropzone onFilesSelected={handleFilesSelected} />
      <ConversionQueue items={queue} onOpenSettings={handleOpenSettings} />
      <SettingsModal
        isOpen={!!settingsForFileId}
        initialSettings={currentSettingsItem?.videoSettings}
        onClose={() => setSettingsForFileId(null)}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default FileUpload;
