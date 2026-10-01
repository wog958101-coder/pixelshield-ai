'use client';

import React from 'react';
import { ProtectionOptions } from '@/types/media';
import {
  EyeOff,
  MapPinOff,
  Crop,
  Sparkles,
  Sliders,
  Shield,
  Layers,
  FileCode,
} from 'lucide-react';

interface ProtectionStudioProps {
  options: ProtectionOptions;
  onChange: (options: ProtectionOptions) => void;
  facesDetectedCount: number;
}

export function ProtectionStudio({ options, onChange, facesDetectedCount }: ProtectionStudioProps) {
  const updateOption = <K extends keyof ProtectionOptions>(key: K, value: ProtectionOptions[K]) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Cloudinary Protection Pipeline
          </h3>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Real-time transformation engine
        </span>
      </div>

      <div className="mt-5 space-y-6">
        {/* 1. Face Privacy & Anonymization */}
        <div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <EyeOff className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Face Anonymization (e_pixelate_faces / e_blur_faces)</span>
            </label>
            {facesDetectedCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {facesDetectedCount} Face(s) detected
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => updateOption('facePrivacy', 'none')}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                options.facePrivacy === 'none'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              None (Raw)
            </button>
            <button
              type="button"
              onClick={() => updateOption('facePrivacy', 'pixelate')}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                options.facePrivacy === 'pixelate'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              AI Pixelate
            </button>
            <button
              type="button"
              onClick={() => updateOption('facePrivacy', 'blur')}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                options.facePrivacy === 'blur'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              Gaussian Blur
            </button>
            <button
              type="button"
              onClick={() => updateOption('facePrivacy', 'mask')}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                options.facePrivacy === 'mask'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              Heavy Shield
            </button>
          </div>

          {options.facePrivacy === 'pixelate' && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-zinc-50 p-2.5 text-xs dark:bg-zinc-950/40">
              <span className="text-zinc-500 shrink-0">Pixel Density:</span>
              <input
                type="range"
                min="5"
                max="40"
                value={options.facePixelateIntensity}
                onChange={(e) => updateOption('facePixelateIntensity', Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300 w-8 text-right">
                {options.facePixelateIntensity}
              </span>
            </div>
          )}
        </div>

        {/* 2. Metadata & EXIF Stripping */}
        <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <MapPinOff className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                Scrub GPS & Hardware Metadata
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Injects <code className="text-sky-600 dark:text-sky-400 font-mono">fl_strip_profile</code> to strip GPS coordinates, camera serial numbers, and device tags.
              </p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={options.stripMetadata}
              onChange={(e) => updateOption('stripMetadata', e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-zinc-200 peer-checked:bg-sky-600 peer-focus:outline-hidden dark:bg-zinc-700 dark:peer-checked:bg-sky-500 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
          </label>
        </div>

        {/* 3. Background Privacy & Isolation */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <Layers className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Background Privacy & Isolation</span>
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateOption('backgroundPrivacy', 'none')}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                options.backgroundPrivacy === 'none'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              Keep Original
            </button>
            <button
              type="button"
              onClick={() => updateOption('backgroundPrivacy', 'blur')}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                options.backgroundPrivacy === 'blur'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              Optical Blur (e_blur)
            </button>
            <button
              type="button"
              onClick={() => updateOption('backgroundPrivacy', 'remove')}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                options.backgroundPrivacy === 'remove'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              AI BG Removal
            </button>
          </div>
        </div>

        {/* 4. Smart Content-Aware Cropping (g_auto) */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <Crop className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>AI Content-Aware Crop (c_fill, g_auto)</span>
          </label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => updateOption('smartCrop', 'none')}
              className={`rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                options.smartCrop === 'none'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              Original Ratio
            </button>
            <button
              type="button"
              onClick={() => updateOption('smartCrop', 'square')}
              className={`rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                options.smartCrop === 'square'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              1:1 Avatar
            </button>
            <button
              type="button"
              onClick={() => updateOption('smartCrop', 'portrait')}
              className={`rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                options.smartCrop === 'portrait'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              4:5 Portrait
            </button>
            <button
              type="button"
              onClick={() => updateOption('smartCrop', 'landscape')}
              className={`rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                options.smartCrop === 'landscape'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              16:9 Banner
            </button>
          </div>
        </div>

        {/* 5. Format & Optimization */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Format Delivery (f_auto)
            </label>
            <select
              value={options.deliveryFormat}
              onChange={(e) => updateOption('deliveryFormat', e.target.value as any)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="auto">Auto (f_auto &rarr; AVIF / WebP)</option>
              <option value="webp">WebP</option>
              <option value="avif">AVIF (Ultra compact)</option>
              <option value="png">PNG (Lossless)</option>
              <option value="jpg">JPEG</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Perceptual Quality (q_auto)
            </label>
            <select
              value={options.optimization}
              onChange={(e) => updateOption('optimization', e.target.value as any)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="auto">q_auto:good (AI Visual Balance)</option>
              <option value="eco">q_auto:eco (Maximum Compression)</option>
              <option value="lossless">q_auto:best (High Fidelity)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
