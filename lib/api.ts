// lib/api.ts
import { VideoSettings } from "@/types/files";

// 所有 API 都打到同網域的 /api
const API_BASE = "/api";

export type UploadUrlResponse = {
  upload_url: string;
  key: string;
};

export async function getUploadUrl(file: File): Promise<UploadUrlResponse> {
  const res = await fetch(`${API_BASE}/get-upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type || "application/octet-stream",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get upload URL");
  }

  return res.json();
}

export async function uploadFileToS3(
  file: File,
  uploadUrl: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error("Failed to upload file to S3");
  }
}

export type StartConversionResponse = {
  job_id: string;
  status: string;
};

export async function startConversion(
  s3Key: string,
  targetFormat: string,
  videoSettings?: VideoSettings
): Promise<StartConversionResponse> {
  const res = await fetch(`${API_BASE}/start-conversion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      s3_key: s3Key,
      target_format: targetFormat,
      settings: videoSettings,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to start conversion");
  }

  return res.json();
}

export type StatusResponse = {
  job_id: string;
  status?: string;
  progress?: number;
  message?: string;
  output_s3_key?: string;
  raw?: Record<string, any>;
};

export async function getJobStatus(jobId: string): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status/${jobId}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch job status");
  }

  return res.json();
}
