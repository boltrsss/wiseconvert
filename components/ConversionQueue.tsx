"use client";

import React from "react";
import { UploadItem } from "@/types/files";

interface ConversionQueueProps {
  items: UploadItem[];
  onOpenSettings: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
}

const statusLabel: Record<UploadItem["status"], string> = {
  waiting: "Waiting",
  uploading: "Uploading",
  processing: "Processing",
  done: "Completed",
  error: "Error",
};

const ConversionQueue: React.FC<ConversionQueueProps> = ({
  items,
  onOpenSettings,
  onDelete,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        Conversion Queue
      </h2>

      <div className="space-y-4">
        {items.map((item) => {
          const isDone = item.status === "done";
          const hasError = item.status === "error";

          return (
            <div
              key={item.id}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                {/* Left: file icon + name */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg">
                    {item.isVideo ? "🎬" : "📄"}
                  </div>

                  <div className="truncate">
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(item.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      {statusLabel[item.status]}
                    </p>
                  </div>
                </div>

                {/* Right: action buttons */}
                <div className="flex items-center gap-3">
                  {item.isVideo && (
                    <button
                      onClick={() => onOpenSettings(item.id)}
                      className="px-3 py-1 text-xs bg-gray-100 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200"
                    >
                      ⚙️ Settings
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="px-2 py-1 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-200"
                    >
                      ✕
                    </button>
                  )}

                  {isDone && item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    hasError
                      ? "bg-red-400"
                      : isDone
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              {/* Error Message */}
              {item.errorMessage && (
                <div className="text-xs text-red-500">
                  {item.errorMessage}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionQueue;
