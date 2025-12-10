// components/VideoSettingsModal.tsx
'use client';

import React from 'react';
import { useLang } from '@/context/LanguageContext';

export type VideoSettings = {
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  resolution: '2160p' | '1440p' | '1080p' | '720p' | '480p';
  aspectRatio: '16:9' | '9:16' | '4:3' | '1:1';
  frameRate: 24 | 30 | 60;
};

type Props = {
  open: boolean;
  value: VideoSettings;
  onClose: () => void;
  onSave: (next: VideoSettings) => void;
};

export function VideoSettingsModal({ open, value, onClose, onSave }: Props) {
  const { t } = useLang();

  const [local, setLocal] = React.useState<VideoSettings>(value);

  // 每次打開時同步外面的值
  React.useEffect(() => {
    if (open) {
      setLocal(value);
    }
  }, [open, value]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal 本體 */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-5 sm:p-6 z-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t('video_settings.title')}
        </h2>

        <div className="space-y-4 text-sm">
          {/* Codec */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              {t('video_settings.codec')}
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={local.codec}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  codec: e.target.value as VideoSettings['codec'],
                }))
              }
            >
              <option value="h264">{t('video_settings.codec_h264')}</option>
              <option value="h265">{t('video_settings.codec_h265')}</option>
              <option value="vp9">{t('video_settings.codec_vp9')}</option>
              <option value="av1">{t('video_settings.codec_av1')}</option>
            </select>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              {t('video_settings.resolution')}
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={local.resolution}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  resolution: e.target.value as VideoSettings['resolution'],
                }))
              }
            >
              <option value="2160p">{t('video_settings.res_2160p')}</option>
              <option value="1440p">{t('video_settings.res_1440p')}</option>
              <option value="1080p">{t('video_settings.res_1080p')}</option>
              <option value="720p">{t('video_settings.res_720p')}</option>
              <option value="480p">{t('video_settings.res_480p')}</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              {t('video_settings.aspect_ratio')}
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={local.aspectRatio}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  aspectRatio: e.target.value as VideoSettings['aspectRatio'],
                }))
              }
            >
              <option value="16:9">{t('video_settings.ar_169')}</option>
              <option value="9:16">{t('video_settings.ar_916')}</option>
              <option value="4:3">{t('video_settings.ar_43')}</option>
              <option value="1:1">{t('video_settings.ar_11')}</option>
            </select>
          </div>

          {/* Frame rate */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              {t('video_settings.frame_rate')}
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={local.frameRate}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  frameRate: Number(
                    e.target.value,
                  ) as VideoSettings['frameRate'],
                }))
              }
            >
              <option value={24}>24 fps</option>
              <option value={30}>30 fps</option>
              <option value={60}>60 fps</option>
            </select>
          </div>
        </div>

        {/* 按鈕區 */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            {t('video_settings.cancel')}
          </button>
          <button
            type="button"
            className="px-4 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onSave(local)}
          >
            {t('video_settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
}