// Upload 狀態
export type UploadStatus = 
  | "idle"
  | "uploading"
  | "processing"
  | "done"
  | "error";

// 單一文件的結構
export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  isVideo: boolean;

  status: UploadStatus;
  progress: number;

  // 後端回傳資料
  jobId?: string;
  outputKey?: string;
  downloadUrl?: string;

  // 錯誤訊息（可選）
  errorMessage?: string;

  outputFormat: string; // 必須有

  // 影片設定（只有 video 才會用到）
  videoSettings?: VideoSettings;
}

// ============================
// Video Settings（你需要的）
// ============================
export interface VideoSettings {
  resolution?: string;  // e.g. "1080p", "720p"
  bitrate?: number;     // kbps
  fps?: number;         // 24, 30, 60
  codec?: string;       // e.g. "h264"
  format?: string;      // "mp4", "mov", etc.
  audioBitrate?: number;
  audioChannels?: number;

  // 保留彈性
  [key: string]: any;
}
