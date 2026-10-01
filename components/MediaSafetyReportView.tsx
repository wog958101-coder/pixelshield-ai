'use client';

import React from 'react';
import { MediaSafetyReport } from '@/types/media';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  MapPin,
  Camera,
  Layers,
  FileCheck2,
  HardDrive,
  Info,
  CheckCircle2,
  XCircle,
  Tag,
  Server,
} from 'lucide-react';
import { formatBytes } from '@/lib/cloudinary';

interface MediaSafetyReportViewProps {
  report: MediaSafetyReport;
}

export function MediaSafetyReportView({ report }: MediaSafetyReportViewProps) {
  const { overallScore, overallVerdict, contentModeration, privacyRisks, technicalSpecs, cloudinaryDetails } = report;

  const scoreBadgeStyle =
    overallScore >= 80
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
      : overallScore >= 50
      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

  const verdictLabel =
    overallVerdict === 'safe'
      ? 'Safe for Sharing'
      : overallVerdict === 'caution'
      ? 'Caution: Action Recommended'
      : 'High Privacy Risk Detected';

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 space-y-6">
      {/* 1. Header with Overall Safety Score & Verdict */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Media Safety Report
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Automated biometric, geolocation, and content audit powered by Cloudinary ingestion analysis.
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Safety Score
            </span>
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {verdictLabel}
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-black ${scoreBadgeStyle}`}
            aria-label={`Overall Safety Score: ${overallScore} out of 100`}
          >
            {overallScore}
          </div>
        </div>
      </div>

      {/* 2. Four Structured Sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Section A: Content Status */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
              <FileCheck2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Content Status</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                contentModeration.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : contentModeration.status === 'pending'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {contentModeration.status === 'approved' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              <span>{contentModeration.status}</span>
            </span>
          </div>

          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {contentModeration.details}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Info className="h-3 w-3" />
            <span>Filter engine: {contentModeration.provider || 'Cloudinary Ingestion Filter'}</span>
          </div>
        </div>

        {/* Section B: Detected Tags & Privacy Signals */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
              <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Detected Privacy Signals</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                privacyRisks.facesDetected > 0
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {privacyRisks.facesDetected > 0 ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              <span>{privacyRisks.facesDetected} Face(s)</span>
            </span>
          </div>

          <div className="mt-2 space-y-1">
            {privacyRisks.riskSummary.map((risk, index) => (
              <div key={index} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="text-rose-500 font-bold">•</span>
                <span>{risk}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              GPS: <strong className={privacyRisks.exifGpsExposed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{privacyRisks.exifGpsExposed ? 'Exposed in EXIF' : 'Clean'}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Hardware: <strong className={privacyRisks.deviceFingerprintExposed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>{privacyRisks.deviceFingerprintExposed ? 'Exposed' : 'Hidden'}</strong>
            </span>
          </div>
        </div>

        {/* Section C: Media Information */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
            <HardDrive className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Media Information</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-400">Format & Ratio</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">
                {technicalSpecs.format} • {technicalSpecs.aspectRatio}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">Resolution</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {technicalSpecs.width} × {technicalSpecs.height} px
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">Raw Size</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {formatBytes(technicalSpecs.originalBytes)}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">Optimized Potential</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                ~{formatBytes(technicalSpecs.estimatedOptimizedBytes)} (-{technicalSpecs.potentialSavingsPercent}%)
              </p>
            </div>
          </div>
        </div>

        {/* Section D: Cloudinary Processing Status */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
              <Server className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cloudinary Processing</span>
            </div>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active CDN
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Storage Folder:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                pixelshield/uploads/
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Public ID:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]" title={cloudinaryDetails.publicId}>
                {cloudinaryDetails.publicId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Delivery State:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Cached & Transformed at Edge
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
