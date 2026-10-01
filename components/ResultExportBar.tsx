'use client';

import React, { useState } from 'react';
import { Download, Copy, Check, ExternalLink, RotateCcw, Terminal, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { TransformationAudit } from '@/types/media';
import { downloadCloudinaryAsset } from '@/lib/cloudinary';

interface ResultExportBarProps {
  transformationAudit: TransformationAudit;
  onReset: () => void;
  publicId: string;
}

export function ResultExportBar({
  transformationAudit,
  onReset,
  publicId,
}: ResultExportBarProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(transformationAudit.finalUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const filename = `pixelshield-${publicId.replace(/\//g, '_') || 'protected'}.${transformationAudit.formatChosen.toLowerCase()}`;
    await downloadCloudinaryAsset(transformationAudit.finalUrl, filename);
    setIsDownloading(false);
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
      {/* Action Header & Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Protected Asset Ready for Secure Delivery
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Delivered directly from Cloudinary CDN edge with verified privacy safeguards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Analyze Another Image</span>
          </button>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedUrl ? 'Copied URL!' : 'Copy Cloudinary URL'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 active:scale-98 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Protected Media</span>
          </button>
        </div>
      </div>

      {/* Applied Cloudinary Operations Ledger */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Applied Cloudinary Operations ({transformationAudit.appliedOperations.length})
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Estimated payload savings: {transformationAudit.bytesSavingsEstimate}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {transformationAudit.appliedOperations.map((op, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-lg border border-sky-100 bg-sky-50/80 px-2.5 py-1 text-xs font-medium text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300"
            >
              {op}
            </span>
          ))}
        </div>
      </div>

      {/* Cloudinary Live URL & Transformation String Inspector */}
      <div className="mt-5 rounded-2xl border border-zinc-900/80 bg-zinc-950 p-4 text-xs font-mono text-zinc-300 shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pb-2 border-b border-zinc-800">
          <span className="flex items-center gap-1 text-sky-400">
            <Terminal className="h-3 w-3" />
            Cloudinary Dynamic Delivery URL
          </span>
          <a
            href={transformationAudit.finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-white"
          >
            <span>Open in new tab</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="mt-2.5 break-all text-xs text-emerald-400 select-all">
          {transformationAudit.finalUrl}
        </p>
      </div>
    </div>
  );
}
