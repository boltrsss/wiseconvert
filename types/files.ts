export type UploadStatus =
  | "waiting"
  | "uploading"
  | "processing"
  | "done"
  | "error";

export interface UploadItem {
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

  /** 新增：錯誤訊息（避免 TS build fail） */
  errorMessage?: string;
}
