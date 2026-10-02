'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Columns2,
  SplitSquareVertical,
  Zap,
  Shield,
  Download,
  Copy,
  Check,
  Layers,
  Crop,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { TransformationResult } from '@/types/media';
import { formatBytes, downloadCloudinaryAsset } from '@/lib/cloudinary';

interface BeforeAfterViewerProps {
  originalUrl: string;
  results?: TransformationResult[];
  activeResultId?: string;
  onSelectResult?: (id: string) => void;
  // Fallback props for direct URL usage
  protectedUrl?: string;
  optimizedUrl?: string;
  metadata?: {
    originalFormat: string;
    optimizedFormat?: string;
    width: number;
    height: number;
    originalBytes: number;
    estimatedOptimizedBytes?: number;
    optimizationStatus?: string;
  };
}

export function BeforeAfterViewer({
  originalUrl,
  results = [],
  activeResultId,
  onSelectResult,
  protectedUrl,
  optimizedUrl,
  metadata,
}: BeforeAfterViewerProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [containerWidth, setContainerWidth] = useState(800);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active result from list if available
  const activeResult = results.find((r) => r.id === activeResultId) || results.find((r) => r.status === 'success') || results[0];

  // Right-hand comparison URL and Label
  const rightUrl = activeResult ? activeResult.url : (protectedUrl || originalUrl);
  const rightLabel = activeResult ? activeResult.name : 'PixelShield Protected';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handleMove(e.touches[0].clientX);
    };

    const handleGlobalMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging, handleMove]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(rightUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadActive = async () => {
    setIsDownloading(true);
    const filename = `pixelshield-${(activeResult?.type || 'transformed')}-${Date.now()}.png`;
    await downloadCloudinaryAsset(rightUrl, filename);
    setIsDownloading(false);
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Before & After Comparison
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Compare the original uploaded asset with Cloudinary generated results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Slider vs Side-by-Side toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                viewMode === 'slider'
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <SplitSquareVertical className="h-3.5 w-3.5" />
              <span>Split Slider</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Side by Side</span>
            </button>
          </div>
        </div>
      </div>

      {/* Switcher bar: choose which result to compare against original */}
      {results.length > 0 && onSelectResult && (
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-semibold text-zinc-400 shrink-0">Compare Against:</span>
          {results
            .filter((r) => r.status === 'success')
            .map((res) => {
              const isSelected = res.id === activeResult?.id;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => onSelectResult(res.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  {res.type === 'optimized' && <Zap className="h-3 w-3 text-amber-500" />}
                  {res.type === 'smart_crop' && <Crop className="h-3 w-3 text-sky-500" />}
                  {res.type === 'format' && <FileCode className="h-3 w-3 text-emerald-500" />}
                  {res.type === 'privacy_protected' && <Shield className="h-3 w-3 text-rose-500" />}
                  {res.type === 'background_removed' && <Layers className="h-3 w-3 text-indigo-500" />}
                  <span>{res.name}</span>
                </button>
              );
            })}
        </div>
      )}

      {/* Main Visual Display */}
      <div className="mt-4">
        {viewMode === 'slider' ? (
          <div
            ref={containerRef}
            className="relative mx-auto aspect-video max-h-[520px] w-full select-none overflow-hidden rounded-2xl bg-zinc-950 shadow-inner cursor-ew-resize border border-zinc-800"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {/* Right Image (Active Result) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rightUrl}
              alt={rightLabel}
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain"
            />

            {/* Left Image (Original overlay) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original Media"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain max-w-none"
                style={{ width: `${containerWidth}px` }}
              />
            </div>

            {/* Split Line & Handle */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-md pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -left-3.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-800 shadow-md">
                <div className="flex gap-0.5">
                  <div className="h-3 w-0.5 bg-zinc-400" />
                  <div className="h-3 w-0.5 bg-zinc-400" />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 rounded-md bg-zinc-900/80 px-2.5 py-1 text-[11px] font-semibold text-rose-300 backdrop-blur-xs border border-white/10">
              ORIGINAL (Raw)
            </div>
            <div className="absolute top-3 right-3 z-10 rounded-md bg-zinc-900/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-xs border border-white/10 max-w-[200px] truncate">
              {rightLabel.toUpperCase()}
            </div>

            {/* Drag instruction overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-xs pointer-events-none">
              Drag horizontal slider to compare
            </div>
          </div>
        ) : (
          /* Side by Side View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-950 shadow-inner border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
              <div className="absolute top-3 left-3 rounded-md bg-rose-950/80 px-2 py-0.5 text-[11px] font-semibold text-rose-300 backdrop-blur-xs border border-rose-800/40">
                ORIGINAL (Raw)
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-950 shadow-inner border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rightUrl}
                alt={rightLabel}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
              <div className="absolute top-3 left-3 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 backdrop-blur-xs border border-emerald-800/40 max-w-[220px] truncate">
                {rightLabel}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata & Action Bar for Active Result */}
      <div className="mt-5 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
          <div>
            <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span>{rightLabel} — Active Result Telemetry</span>
            </span>
            <p className="mt-0.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 break-all">
              {activeResult?.transformationString || 'Cloudinary Edge Delivery'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer shadow-2xs"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadActive}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Asset</span>
            </button>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <span className="text-[11px] text-zinc-400">Original Size</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
              {formatBytes(activeResult?.metadata?.originalSize || metadata?.originalBytes)}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400">Result Size</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {activeResult?.metadata?.resultSize
                ? formatBytes(activeResult.metadata.resultSize)
                : 'Edge Optimized (CDN)'}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400">Payload Savings</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {activeResult?.metadata?.percentageSaved && activeResult.metadata.percentageSaved > 0
                ? `${formatBytes(activeResult.metadata.savedSize)} (${activeResult.metadata.percentageSaved}%)`
                : 'Perceptual Quality (q_auto)'}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400">Status</span>
            <p className="font-semibold text-sky-600 dark:text-sky-400 mt-0.5 truncate">
              {activeResult?.status === 'success' ? 'Active on CDN' : activeResult?.status || 'Active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
