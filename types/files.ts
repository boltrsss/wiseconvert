
export type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

export type VideoSettings = {
  codec: string;
  resolution: string;
  aspectRatio: string;
  frameRate: string;
};

export type UploadItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  isVideo: boolean;
  status: UploadStatus;
  progress: number;
  outputKey?: string;   // <-- add this line
};
