// Upload 狀態
export type UploadStatus =
  | "idle"
  | "waiting"      // ✅ 新增：排隊中
  | "uploading"
  | "processing"
  | "done"
  | "error";

// ============================
// Video Settings（影片進階設定）
// ============================

// 可選的 codec
export type VideoCodec = "h264" | "h265" | "vp9" | "av1" | "copy";

// 可選的解析度
export type VideoResolution =
  | "source"   // 原始解析度
  | "2160p"
  | "1440p"
  | "1080p"
  | "720p"
  | "480p";

// 可選的寬高比
export type VideoAspectRatio =
  | "source"   // 保持原比例
  | "16:9"
  | "9:16"
  | "4:3"
  | "1:1";

export interface VideoSettings {
  codec?: VideoCodec;              // 影片編碼（H.264 / H.265 / VP9 / AV1 / copy）
  resolution?: VideoResolution;    // 解析度
  aspectRatio?: VideoAspectRatio;  // 寬高比
  frameRate?: number;              // 影格數 (例如 24 / 30 / 60)

  // 額外預留選項（如果之後要加）
  bitrateKbps?: number;
  audioBitrateKbps?: number;
  audioChannels?: number;

  // 保留彈性
  [key: string]: any;
}

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
