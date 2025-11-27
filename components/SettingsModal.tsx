
"use client";

import React, { useEffect, useState } from "react";
import { VideoSettings } from "@/types/files";

interface SettingsModalProps {
  isOpen: boolean;
  initialSettings?: VideoSettings;
  onClose: () => void;
  onSave: (settings: VideoSettings) => void;
}

const defaultSettings: VideoSettings = {
  codec: "h264",
  resolution: "1080p",
  aspectRatio: "16:9",
  frameRate: "30"
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  initialSettings,
  onClose,
  onSave
}) => {
  const [settings, setSettings] = useState<VideoSettings>(initialSettings || defaultSettings);

  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings || defaultSettings);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleChange =
    (field: keyof VideoSettings) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setSettings((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Advanced Video Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Codec</label>
            <select
              value={settings.codec}
              onChange={handleChange("codec")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="h264">H.264 (MP4)</option>
              <option value="h265">H.265 / HEVC</option>
              <option value="vp9">VP9 (WebM)</option>
              <option value="av1">AV1</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Resolution</label>
            <select
              value={settings.resolution}
              onChange={handleChange("resolution")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2160p">4K (2160p)</option>
              <option value="1440p">2K (1440p)</option>
              <option value="1080p">Full HD (1080p)</option>
              <option value="720p">HD (720p)</option>
              <option value="480p">SD (480p)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Aspect Ratio</label>
            <select
              value={settings.aspectRatio}
              onChange={handleChange("aspectRatio")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="9:16">9:16 (Mobile Portrait)</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Frame Rate (fps)</label>
            <select
              value={settings.frameRate}
              onChange={handleChange("frameRate")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24">24</option>
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
