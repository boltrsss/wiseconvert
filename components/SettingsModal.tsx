"use client";

import React, { useEffect, useState } from "react";
import { VideoSettings } from "@/types/files";
import { useLanguage } from "@/context/LanguageContext";

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
  frameRate: "30",
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  initialSettings,
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();

  const [settings, setSettings] = useState<VideoSettings>(
    initialSettings || defaultSettings
  );

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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t("videoSettings.title")}
            </h3>
            <p className="mt-1 text-[11px] text-gray-500">
              {t("videoSettings.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Codec */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("videoSettings.codec.label")}
            </label>
            <select
              value={settings.codec}
              onChange={handleChange("codec")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="h264">
                {t("videoSettings.codec.options.h264")}
              </option>
              <option value="h265">
                {t("videoSettings.codec.options.h265")}
              </option>
              <option value="vp9">
                {t("videoSettings.codec.options.vp9")}
              </option>
              <option value="av1">
                {t("videoSettings.codec.options.av1")}
              </option>
            </select>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("videoSettings.resolution.label")}
            </label>
            <select
              value={settings.resolution}
              onChange={handleChange("resolution")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2160p">
                {t("videoSettings.resolution.options.2160p")}
              </option>
              <option value="1440p">
                {t("videoSettings.resolution.options.1440p")}
              </option>
              <option value="1080p">
                {t("videoSettings.resolution.options.1080p")}
              </option>
              <option value="720p">
                {t("videoSettings.resolution.options.720p")}
              </option>
              <option value="480p">
                {t("videoSettings.resolution.options.480p")}
              </option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("videoSettings.aspectRatio.label")}
            </label>
            <select
              value={settings.aspectRatio}
              onChange={handleChange("aspectRatio")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="16:9">
                {t("videoSettings.aspectRatio.options.16_9")}
              </option>
              <option value="9:16">
                {t("videoSettings.aspectRatio.options.9_16")}
              </option>
              <option value="4:3">
                {t("videoSettings.aspectRatio.options.4_3")}
              </option>
              <option value="1:1">
                {t("videoSettings.aspectRatio.options.1_1")}
              </option>
            </select>
          </div>

          {/* Frame rate */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("videoSettings.frameRate.label")}
            </label>
            <select
              value={settings.frameRate}
              onChange={handleChange("frameRate")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24">
                {t("videoSettings.frameRate.options.24")}
              </option>
              <option value="30">
                {t("videoSettings.frameRate.options.30")}
              </option>
              <option value="60">
                {t("videoSettings.frameRate.options.60")}
              </option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            {t("videoSettings.buttons.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {t("videoSettings.buttons.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
