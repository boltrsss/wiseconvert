export type UploadStatus =
  | "waiting"
  | "uploading"
  | "processing"
  | "done"
  | "error";

export type UploadItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  isVideo: boolean;
  status: UploadStatus;
  progress: number;
  jobId?: string;
  outputKey?: string;
  downloadUrl?: string;
};
