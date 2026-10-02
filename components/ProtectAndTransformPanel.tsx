'use client';

import React, { useState } from 'react';
import {
  Zap,
  Crop,
  FileCode,
  Shield,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Columns2,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { TransformationResult, OperationStatus } from '@/types/media';
import { formatBytes, downloadCloudinaryAsset } from '@/lib/cloudinary';

interface ProtectAndTransformPanelProps {
  publicId: string;
  cloudName: string;
  originalUrl: string;
  originalBytes: number;
  originalFormat: string;
  facesDetectedCount: number;
  results: TransformationResult[];
  onAddResult: (result: TransformationResult) => void;
  onSelectResult: (id: string) => void;
  selectedResultId: string;
}

let actionCounter = 0;
function generateResultMeta(prefix: string) {
  actionCounter += 1;
  const time = Date.now();
  return {
    tempId: `${prefix}_${actionCounter}_${time}`,
    timestamp: time,
  };
}

export function ProtectAndTransformPanel({
  publicId,
  cloudName,
  originalUrl,
  originalBytes,
  originalFormat,
  facesDetectedCount,
  results,
  onAddResult,
  onSelectResult,
  selectedResultId,
}: ProtectAndTransformPanelProps) {
  // Action processing state
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [warningNote, setWarningNote] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Selected format state
  const [selectedFormat, setSelectedFormat] = useState<'auto' | 'webp' | 'avif' | 'jpg' | 'png'>('webp');

  // Trigger real transformation via API
  const executeTransformation = async (
    action: string,
    options: Record<string, any>,
    name: string,
    description: string,
    type: TransformationResult['type'],
    loadingMsg: string,
    timestamp: number,
    tempId: string
  ) => {
    setActiveAction(action);
    setProcessingMessage(loadingMsg);
    setActionError(null);
    setWarningNote(null);

    // Create temporary processing item
    const processingResult: TransformationResult = {
      id: tempId,
      type,
      name,
      description,
      url: originalUrl,
      transformationString: 'processing...',
      timestamp,
      status: 'processing',
      metadata: {
        appliedOperations: [loadingMsg],
        originalSize: originalBytes,
      },
    };

    onAddResult(processingResult);
    onSelectResult(tempId);

    try {
      const response = await fetch('/api/cloudinary/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId,
          action,
          options,
          originalBytes,
          originalFormat,
          facesDetectedCount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.status === 'unavailable') {
          // Feature requires additional configuration (e.g. background removal add-on)
          const unavailableResult: TransformationResult = {
            id: tempId,
            type,
            name,
            description,
            url: data.url || originalUrl,
            transformationString: data.transformationString || 'unconfigured',
            timestamp,
            status: 'unavailable',
            errorMessage: data.message || 'Capability requires additional Cloudinary configuration.',
            metadata: {
              appliedOperations: ['Configuration Check (Unavailable)'],
              isConfigured: false,
            },
          };
          onAddResult(unavailableResult);
          setActionError(data.message || 'Feature is not configured on this Cloudinary account.');
          return;
        }

        throw new Error(data.message || 'Transformation failed to process.');
      }

      if (data.warningMessage) {
        setWarningNote(data.warningMessage);
      }

      const completedResult: TransformationResult = {
        id: tempId,
        type,
        name,
        description,
        url: data.url,
        transformationString: data.transformationString,
        timestamp,
        status: 'success',
        warningMessage: data.warningMessage,
        metadata: {
          ...data.metadata,
          originalSize: originalBytes,
        },
      };

      onAddResult(completedResult);
      onSelectResult(tempId);
    } catch (err: any) {
      console.error('Transformation error:', err);
      const failedResult: TransformationResult = {
        id: tempId,
        type,
        name,
        description,
        url: originalUrl,
        transformationString: 'failed',
        timestamp,
        status: 'failed',
        errorMessage: err.message || 'Network error executing Cloudinary transformation.',
        metadata: {
          appliedOperations: ['Execution Failed'],
        },
      };
      onAddResult(failedResult);
      setActionError(err.message || 'Failed to complete transformation.');
    } finally {
      setActiveAction(null);
      setProcessingMessage('');
    }
  };

  // 1. Optimize Image
  const handleOptimize = (quality: 'good' | 'eco') => {
    const meta = generateResultMeta('opt');
    executeTransformation(
      'optimize',
      { quality },
      `CDN Optimized (${quality})`,
      'Dynamic WebP/AVIF delivery with perceptual lossless compression.',
      'optimized',
      'Optimizing your image via Cloudinary CDN (f_auto, q_auto)...',
      meta.timestamp,
      meta.tempId
    );
  };

  // 2. Smart Crop
  const handleSmartCrop = (aspectRatio: '1:1' | '4:5' | '16:9') => {
    const meta = generateResultMeta('crop');
    const label = aspectRatio === '1:1' ? 'Square (1:1)' : aspectRatio === '4:5' ? 'Portrait (4:5)' : 'Landscape (16:9)';
    executeTransformation(
      'smart_crop',
      { aspectRatio, width: 800 },
      `Smart Crop ${label}`,
      `Content-aware focal point crop focusing on main subjects (c_fill, g_auto, ar_${aspectRatio}).`,
      'smart_crop',
      `Creating ${label} smart crop...`,
      meta.timestamp,
      meta.tempId
    );
  };

  // 3. Format Conversion
  const handleConvertFormat = (targetFormat: 'auto' | 'webp' | 'avif' | 'jpg' | 'png') => {
    const meta = generateResultMeta('fmt');
    setSelectedFormat(targetFormat);
    executeTransformation(
      'format',
      { targetFormat },
      `Format: ${targetFormat.toUpperCase()}`,
      `Transcoded directly to ${targetFormat.toUpperCase()} via Cloudinary edge delivery.`,
      'format',
      `Converting image format to ${targetFormat.toUpperCase()}...`,
      meta.timestamp,
      meta.tempId
    );
  };

  // 4. Background Removal
  const handleRemoveBackground = () => {
    const meta = generateResultMeta('bg');
    executeTransformation(
      'background_removal',
      {},
      'Background Removed',
      'Cloudinary AI neural background cutout with transparent alpha layer.',
      'background_removed',
      'Removing background via Cloudinary AI...',
      meta.timestamp,
      meta.tempId
    );
  };

  // 5. Privacy Protection
  const handlePrivacyAction = (method: 'pixelate' | 'blur' | 'mask') => {
    const meta = generateResultMeta('priv');
    const label = method === 'pixelate' ? 'AI Pixelated Faces' : method === 'blur' ? 'Gaussian Blurred Faces' : 'Heavy Privacy Mask';
    executeTransformation(
      'privacy',
      { facePrivacy: method, stripMetadata: true },
      label,
      'Biometric face obfuscation and complete EXIF/GPS profile scrubbing.',
      'privacy_protected',
      'Generating protected copy with face redaction and EXIF scrubbing...',
      meta.timestamp,
      meta.tempId
    );
  };

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = async (result: TransformationResult) => {
    setDownloadingId(result.id);
    const ext = result.metadata.format ? result.metadata.format.toLowerCase() : 'jpg';
    const filename = `pixelshield-${result.type}-${Date.now()}.${ext}`;
    await downloadCloudinaryAsset(result.url, filename);
    setDownloadingId(null);
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          SECTION 1: PROTECT & TRANSFORM CONTROLS PANEL
          ========================================================================= */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Protect & Transform
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Apply real Cloudinary transformations, smart crops, format conversions, and privacy safeguards.
            </p>
          </div>

          {activeAction && (
            <div className="flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{processingMessage || 'Processing Cloudinary operation...'}</span>
            </div>
          )}
        </div>

        {/* Global Action Warning or Error Notice */}
        {actionError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-900 dark:text-rose-200">Action Notice</p>
              <p className="mt-0.5 leading-relaxed">{actionError}</p>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {warningNote && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-200">Format Notice</p>
              <p className="mt-0.5 leading-relaxed">{warningNote}</p>
            </div>
            <button
              onClick={() => setWarningNote(null)}
              className="text-amber-600 hover:text-amber-800 font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Controls Matrix */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Optimization */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Optimization (f_auto, q_auto)</span>
              </div>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Active CDN
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Automatic modern format negotiation (AVIF/WebP) and perceptual quality optimization.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleOptimize('good')}
                disabled={activeAction !== null}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                <span>Optimize (q_auto:good)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOptimize('eco')}
                disabled={activeAction !== null}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>Eco (High Compression)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Smart Crop */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                <Crop className="h-4 w-4 text-sky-600" />
                <span>Smart Crop (g_auto)</span>
              </div>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                Content-Aware
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Crops using Cloudinary AI gravity to keep detected subjects and faces in frame.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSmartCrop('1:1')}
                disabled={activeAction !== null}
                className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>1:1</span>
                <span className="text-[10px] text-zinc-400 font-normal">Square</span>
              </button>

              <button
                type="button"
                onClick={() => handleSmartCrop('4:5')}
                disabled={activeAction !== null}
                className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>4:5</span>
                <span className="text-[10px] text-zinc-400 font-normal">Portrait</span>
              </button>

              <button
                type="button"
                onClick={() => handleSmartCrop('16:9')}
                disabled={activeAction !== null}
                className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>16:9</span>
                <span className="text-[10px] text-zinc-400 font-normal">Landscape</span>
              </button>
            </div>
          </div>

          {/* Card 3: Format Conversion */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                <FileCode className="h-4 w-4 text-emerald-600" />
                <span>Format Transcoding</span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Original: <strong className="uppercase text-zinc-600 dark:text-zinc-300">{originalFormat}</strong>
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Convert on-the-fly to modern formats via edge transformation.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(['auto', 'webp', 'avif', 'jpg', 'png'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleConvertFormat(fmt)}
                  disabled={activeAction !== null}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-98 cursor-pointer border ${
                    selectedFormat === fmt
                      ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                  } disabled:opacity-50`}
                >
                  {fmt === 'auto' ? 'Auto' : fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Card 4: Background Removal */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>AI Background Removal</span>
              </div>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                e_background_removal
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Extract main foreground subjects with transparent background output.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={activeAction !== null}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Layers className="h-3 w-3 text-indigo-600" />
                <span>Remove Background</span>
              </button>
            </div>
          </div>
        </div>

        {/* Biometric & Privacy Redaction Section */}
        <div className="mt-6 rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                <Shield className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>Privacy & Biometric Redaction Actions</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {facesDetectedCount > 0
                  ? `${facesDetectedCount} unmasked face(s) identified for biometric obfuscation.`
                  : 'No faces identified in this image. EXIF/GPS profile scrubbing will still remove device coordinates.'}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${
                facesDetectedCount > 0
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {facesDetectedCount > 0 ? `${facesDetectedCount} Face(s)` : 'Clean Faces'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrivacyAction('pixelate')}
              disabled={activeAction !== null}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Shield className="h-3 w-3 text-sky-600" />
              <span>AI Face Pixelate</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrivacyAction('blur')}
              disabled={activeAction !== null}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <span>Gaussian Blur</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrivacyAction('mask')}
              disabled={activeAction !== null}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <span>Heavy Mask</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: TRANSFORMATION RESULTS LEDGER
          ========================================================================= */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Transformation Results ({results.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Real Cloudinary generated assets. Click any result to inspect in the comparison studio or download.
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No transformations generated yet. Choose an action above to create an optimized or protected asset.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {results.map((result) => {
              const isSelected = result.id === selectedResultId;
              const isProcessing = result.status === 'processing';
              const isUnavailable = result.status === 'unavailable';
              const isFailed = result.status === 'failed';
              const isSuccess = result.status === 'success';

              return (
                <div
                  key={result.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/40 dark:border-sky-500/80 dark:bg-sky-950/20 shadow-xs'
                      : 'border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60'
                  }`}
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-3.5 overflow-hidden">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800">
                      {isProcessing ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={result.url}
                          alt={result.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {result.name}
                        </span>

                        {/* Status Badge */}
                        {isSuccess && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Ready
                          </span>
                        )}
                        {isProcessing && (
                          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            Processing
                          </span>
                        )}
                        {isUnavailable && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Not Configured
                          </span>
                        )}
                        {isFailed && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Failed
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {result.description}
                      </p>

                      {/* Transformation Tag */}
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                        <span className="truncate max-w-[280px]" title={result.transformationString}>
                          {result.transformationString}
                        </span>
                        {result.metadata.resultSize && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            • {formatBytes(result.metadata.resultSize)}
                            {result.metadata.percentageSaved && result.metadata.percentageSaved > 0
                              ? ` (-${result.metadata.percentageSaved}%)`
                              : ''}
                          </span>
                        )}
                      </div>

                      {result.errorMessage && (
                        <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          {result.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                    {isSuccess && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectResult(result.id)}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-98 cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <Columns2 className="h-3.5 w-3.5" />
                          <span>{isSelected ? 'Viewing' : 'Compare'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyUrl(result.id, result.url)}
                          className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer shadow-2xs"
                          title="Copy Cloudinary CDN URL"
                        >
                          {copiedId === result.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {copiedId === result.id ? 'Copied' : 'URL'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(result)}
                          disabled={downloadingId === result.id}
                          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
                        >
                          {downloadingId === result.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          <span>Download</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
