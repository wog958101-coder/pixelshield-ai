'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Loader2,
  RotateCw,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { MediaSafetyReport } from '@/types/media';
import { validateImageFile, formatBytes } from '@/lib/cloudinary';

interface ImageUploaderProps {
  onUploadFile: (file: File) => void;
  onSelectSample: (preset: string) => void;
  isProcessing: boolean;
  processingStep: string;
  error: string | null;
  onDismissError: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
  uploadedReport: MediaSafetyReport | null;
  onAnalyzeMedia: () => void;
  onOptimizeMedia: () => void;
  onStartOver: () => void;
}

export function ImageUploader({
  onUploadFile,
  onSelectSample,
  isProcessing,
  processingStep,
  error,
  onDismissError,
  onRetry,
  canRetry = false,
  uploadedReport,
  onAnalyzeMedia,
  onOptimizeMedia,
  onStartOver,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeError = error || localError;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    onDismissError();
    setLocalError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid image file.');
      return;
    }

    onUploadFile(file);
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div id="dashboard" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 scroll-mt-20">
      {/* =========================================================================
          FRIENDLY ERROR STATE COMPONENT
          ========================================================================= */}
      {activeError && (
        <div
          role="alert"
          className="mb-6 rounded-3xl border border-rose-200 bg-rose-50/90 p-5 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Something went wrong.
                </h4>
                <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 leading-relaxed max-w-xl">
                  {activeError}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                onDismissError();
              }}
              className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-semibold shrink-0 cursor-pointer p-1"
            >
              Dismiss
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-rose-200/70 dark:border-rose-900/40">
            {canRetry && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-500 transition active:scale-95 cursor-pointer"
              >
                <RotateCw className="h-3 w-3" />
                <span>Try Again</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                onDismissError();
                onSelectSample('portrait_id');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-zinc-900 dark:text-rose-300 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Try Instant Sample Preset</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
        aria-label="Upload image file"
      />

      {/* =========================================================================
          STATE 1: SUCCESS / UPLOADED ASSET PREVIEW & METADATA
          ========================================================================= */}
      {uploadedReport && !isProcessing ? (
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Media uploaded successfully
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Stored in Cloudinary folder: <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">pixelshield/uploads/</span>
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 self-start sm:self-auto">
              CDN Edge Ready
            </span>
          </div>

          {/* Image Preview Box */}
          <div className="mt-5 overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-inner flex items-center justify-center p-3 relative group min-h-[220px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedReport.cloudinaryDetails.secureUrl}
              alt="Uploaded Media Preview"
              referrerPolicy="no-referrer"
              className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
            />
            <div className="absolute top-4 left-4 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-mono text-zinc-200 backdrop-blur-xs border border-white/10">
              Cloudinary Asset Preview
            </div>
            <a
              href={uploadedReport.cloudinaryDetails.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 rounded-xl bg-black/70 p-2 text-zinc-300 hover:text-white backdrop-blur-xs border border-white/10 transition"
              title="Open raw asset in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Image Information Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Format</span>
              <p className="mt-0.5 font-bold uppercase text-zinc-800 dark:text-zinc-200">
                {uploadedReport.technicalSpecs.format || 'JPEG'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Dimensions</span>
              <p className="mt-0.5 font-bold text-zinc-800 dark:text-zinc-200">
                {uploadedReport.technicalSpecs.width} × {uploadedReport.technicalSpecs.height} px
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">File size</span>
              <p className="mt-0.5 font-bold text-zinc-800 dark:text-zinc-200">
                {formatBytes(uploadedReport.technicalSpecs.originalBytes)}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Cloudinary status</span>
              <p className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400 truncate" title="Stored in pixelshield/uploads/ • Active">
                Stored & Delivered
              </p>
            </div>
          </div>

          {/* Public ID and Copy URL Bar */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-zinc-200/60 bg-zinc-100/50 px-3.5 py-2.5 text-[11px] dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-zinc-400 font-medium shrink-0">Public ID:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate" title={uploadedReport.cloudinaryDetails.publicId}>
                {uploadedReport.cloudinaryDetails.publicId}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyUrl(uploadedReport.cloudinaryDetails.secureUrl)}
                className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-zinc-700 hover:bg-zinc-100 shadow-2xs border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer transition font-medium"
              >
                {copiedUrl ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer transition active:scale-98"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Start Over</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOptimizeMedia}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer transition active:scale-98 shadow-xs"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Optimize</span>
              </button>

              <button
                type="button"
                onClick={onAnalyzeMedia}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 shadow-sm transition active:scale-98 cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Analyze Media</span>
              </button>
            </div>
          </div>
        </div>
      ) : isProcessing ? (
        /* =========================================================================
            STATE 2: LOADING / PROCESSING MEDIA (NON-FREEZING)
            ========================================================================= */
        <div
          role="status"
          className="rounded-3xl border-2 border-dashed border-sky-400/80 bg-sky-50/40 p-8 sm:p-12 text-center dark:border-sky-800/80 dark:bg-sky-950/20"
        >
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute h-full w-full rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin dark:border-sky-950 dark:border-t-sky-400" />
              <Sparkles className="h-6 w-6 text-sky-600 dark:text-sky-400 animate-pulse" />
            </div>
            <h3 className="mt-5 text-base font-bold text-zinc-900 dark:text-white">
              Uploading to Cloudinary...
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              Processing media...
            </p>
            <p className="mt-1 text-[11px] text-zinc-400 max-w-sm">
              {processingStep || 'Uploading asset to folder pixelshield/uploads/ and analyzing telemetry...'}
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-full bg-white/90 dark:bg-zinc-900/90 px-3.5 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-sky-100 dark:border-sky-900 shadow-2xs">
              <Loader2 className="h-3 w-3 animate-spin text-sky-600" />
              <span>Analyzing biometrics, EXIF metadata & format negotiation...</span>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            STATE 3: EMPTY DROPZONE STATE
            ========================================================================= */
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 scale-[1.01]'
                : 'border-zinc-300/80 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60'
            }`}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/60 dark:text-sky-400">
                <UploadCloud className="h-8 w-8" />
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  No image analyzed yet
                </span>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  Drop image here
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Upload an image to generate your media safety report
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="rounded bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  JPG
                </span>
                <span className="rounded bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  PNG
                </span>
                <span className="rounded bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  WEBP
                </span>
                <span>• Max 15MB</span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 active:scale-98 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Browse Files</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Presets */}
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Instant Test Presets
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">One-click scenarios</span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => onSelectSample('portrait_id')}
                disabled={isProcessing}
                className="flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:border-sky-400 hover:shadow-xs active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-500 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Portrait Face ID</span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    1 Face + GPS
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Frontal face with embedded GPS tags and device metadata.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectSample('street_crowd')}
                disabled={isProcessing}
                className="flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:border-sky-400 hover:shadow-xs active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-500 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Street Bystanders</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    3 Faces Detected
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Multiple bystander faces requiring multi-target anonymization.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectSample('document_privacy')}
                disabled={isProcessing}
                className="flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:border-sky-400 hover:shadow-xs active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-500 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">High-Res Camera</span>
                  <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    Delivery Bloat
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Large raw capture needing f_auto and q_auto optimization.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
