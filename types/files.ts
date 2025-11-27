
export type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

export type VideoSettings = {
  codec: string;
  resolution: string;
  aspectRatio: string;
  frameRate: string;
};

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number; // 0-100
  isVideo: boolean;
  jobId?: string;
  videoSettings?: VideoSettings;
  errorMessage?: string;
}
