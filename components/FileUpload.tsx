"use client";

import React, { useState } from "react";
import { UploadItem } from "@/types/files";
import ErrorBanner from "./ErrorBanner";

const SUPPORTED_IMAGE_INPUTS = ["image/jpeg", "image/png", "image/webp"];
const SUPPORTED_VIDEO_INPUTS = ["video/mp4", "video/quicktime"];

const OUTPUT_FORMATS = ["jpg", "png", "webp", "mp4"];

interface Props {
  onAddFiles: (files: UploadItem[]) => void;
}

export default function FileUpload({ onAddFiles }: Props) {
  const [error, setError] = useState("");
  const [outputFormat, setOutputFormat] = useState("png"); // default

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newItems: UploadItem[] = [];

    Array.from(fileList).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      // -------------------------------
      // ❌ Unsupported format detection
      // -------------------------------
      if (
        !(SUPPORTED_IMAGE_INPUTS.includes(file.type) || SUPPORTED_VIDEO_INPUTS.includes(file.type))
      ) {
        setError(`目前不支援「${file.type}」格式，請改用 PNG / JPG / MP4`);
        return;
      }

      const item: UploadItem = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        isVideo,
        status: "idle",
        progress: 0,
        outputFormat
      };

      newItems.push(item);
    });

    if (newItems.length > 0) {
      onAddFiles(newItems);
    }
  };

  return (
    <div className="w-full">
      {/* Error Banner */}
      <ErrorBanner message={error} onClose={() => setError("")} />

      <div className="flex flex-col items-center gap-4">
        {/* Convert To Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Convert to:</span>
          <select
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
          >
            {OUTPUT_FORMATS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* File Input */}
        <label
          htmlFor="file"
          className="px-6 py-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:bg-gray-200 cursor-pointer"
        >
          <span className="text-gray-700">Click to upload files</span>
        </label>
        <input id="file" type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
}
