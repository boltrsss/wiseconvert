"use client";

import React from "react";
import { UploadItem } from "@/types/files";

interface ConversionQueueProps {
  items: UploadItem[];
  onOpenSettings: (fileId: string) => void;
}

const statusLabel: Record<UploadItem["status"], string> = {
  idle: "Waiting",
  uploading: "Uploading",
  processing: "Processing",
  done: "Completed",
  error: "Error"
};

const ConversionQueue: React.FC<ConversionQueueProps> = ({ items, onOpenSettings }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Conversion Queue</h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="px-6 py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-sm">
                  {item.isVideo ? "🎬" : "📄"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB • {statusLabel[item.status]}
                  </p>
                </div>
              </div>

              {/* Video settings button */}
              {item.isVideo && (
                <button
                  type="button"
                  onClick={() => onOpenSettings(item.id)}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="mr-1">⚙️</span> Settings
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  item.status === "error"
                    ? "bg-red-400"
                    : item.status === "done"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>

            {/* Error message */}
            {item.errorMessage && (
              <p className="text-xs text-red-500 mt-1">{item.errorMessage}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversionQueue;
