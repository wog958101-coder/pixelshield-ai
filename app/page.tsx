'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { ImageUploader } from '@/components/ImageUploader';
import { MediaSafetyReportView } from '@/components/MediaSafetyReportView';
import { ProtectAndTransformPanel } from '@/components/ProtectAndTransformPanel';
import { BeforeAfterViewer } from '@/components/BeforeAfterViewer';
import { ResultExportBar } from '@/components/ResultExportBar';
import { MediaSafetyReport, ProtectionOptions, TransformationResult } from '@/types/media';
import { buildCloudinaryTransformationUrl } from '@/lib/cloudinary/transformations';
import { buildOptimizedDeliveryUrl, buildSmartCropUrl, buildFormatConversionUrl } from '@/lib/cloudinary';
import { prepareImageForUpload } from '@/lib/image-compress';
import { ExternalLink } from 'lucide-react';

const DEFAULT_PROTECTION_OPTIONS: ProtectionOptions = {
  facePrivacy: 'pixelate',
  facePixelateIntensity: 15,
  stripMetadata: true,
  backgroundPrivacy: 'none',
  backgroundBlurIntensity: 700,
  smartCrop: 'none',
  optimization: 'auto',
  deliveryFormat: 'auto',
  watermarkShield: false,
};

let resultCounter = 0;

export default function HomePage() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [cloudName, setCloudName] = useState<string>('demo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);

  // Active analysis state
  const [report, setReport] = useState<MediaSafetyReport | null>(null);
  const [protectionOptions, setProtectionOptions] = useState<ProtectionOptions>(DEFAULT_PROTECTION_OPTIONS);

  // Transformation results ledger & active selection
  const [transformationResults, setTransformationResults] = useState<TransformationResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string>('');

  const uploaderRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  // Check Cloudinary backend health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setIsConfigured(data.cloudinary?.configured ?? data.isConfigured ?? false);
          setCloudName(data.cloudinary?.cloudName || data.cloudName || 'demo');
        }
      } catch (err) {
        console.error('Health check failed:', err);
      }
    }
    checkHealth();
  }, []);

  // Compute live transformed URL whenever report or protection options change
  const transformationAudit = useMemo(() => {
    if (!report) return null;
    return buildCloudinaryTransformationUrl(
      report.cloudinaryDetails.cloudName || cloudName,
      report.cloudinaryDetails.publicId,
      protectionOptions
    );
  }, [report, protectionOptions, cloudName]);

  // Initialize baseline results when a report is loaded
  const initializeResultsForReport = (rep: MediaSafetyReport, baseTime: number) => {
    const activeCloudName = rep.cloudinaryDetails.cloudName || cloudName;
    const pubId = rep.cloudinaryDetails.publicId;
    const cleanId = pubId.replace(/\.[^/.]+$/, '');
    const origBytes = rep.technicalSpecs.originalBytes;

    const optUrl = buildOptimizedDeliveryUrl(activeCloudName, pubId);
    const cropUrl = buildSmartCropUrl(activeCloudName, pubId, '1:1', 800);
    const webpUrl = buildFormatConversionUrl(activeCloudName, pubId, 'webp');
    const facePrivacyUrl = `https://res.cloudinary.com/${activeCloudName}/image/upload/fl_strip_profile,e_pixelate_faces:15,f_auto,q_auto:good/${cleanId}`;

    resultCounter += 4;

    const defaultResults: TransformationResult[] = [
      {
        id: `opt_${resultCounter}_${baseTime}`,
        type: 'optimized',
        name: 'Cloudinary Optimized',
        description: 'Auto format selection (f_auto) and perceptual quality optimization (q_auto:good).',
        url: optUrl,
        transformationString: 'f_auto,q_auto:good',
        timestamp: baseTime,
        status: 'success',
        metadata: {
          format: 'Auto (AVIF/WebP)',
          appliedOperations: ['Format Negotiation (f_auto)', 'Perceptual Quality (q_auto:good)'],
          originalSize: origBytes,
          resultSize: rep.technicalSpecs.estimatedOptimizedBytes,
          savedSize: Math.max(0, origBytes - rep.technicalSpecs.estimatedOptimizedBytes),
          percentageSaved: rep.technicalSpecs.potentialSavingsPercent,
        },
      },
      {
        id: `crop_${resultCounter + 1}_${baseTime}`,
        type: 'smart_crop',
        name: 'Smart Crop (1:1)',
        description: 'Content-aware smart cropping focused on detected subjects and faces.',
        url: cropUrl,
        transformationString: 'c_fill,g_auto,ar_1:1,w_800,f_auto,q_auto',
        timestamp: baseTime + 1,
        status: 'success',
        metadata: {
          aspectRatio: '1:1',
          dimensions: '800 × 800 px',
          appliedOperations: ['Content-Aware Gravity (g_auto)', 'Square Crop (ar_1:1)'],
          originalSize: origBytes,
        },
      },
      {
        id: `format_${resultCounter + 2}_${baseTime}`,
        type: 'format',
        name: 'WebP Modern Format',
        description: 'Transcoded to WebP for smaller payload with high visual fidelity.',
        url: webpUrl,
        transformationString: 'f_webp,q_auto:good',
        timestamp: baseTime + 2,
        status: 'success',
        metadata: {
          format: 'WEBP',
          appliedOperations: ['Format Conversion (f_webp)', 'Perceptual Compression (q_auto)'],
          originalSize: origBytes,
        },
      },
      {
        id: `privacy_${resultCounter + 3}_${baseTime}`,
        type: 'privacy_protected',
        name: 'Privacy Redacted Copy',
        description: 'EXIF metadata sanitized with biometric face pixelation applied.',
        url: facePrivacyUrl,
        transformationString: 'fl_strip_profile,e_pixelate_faces:15,f_auto,q_auto',
        timestamp: baseTime + 3,
        status: 'success',
        metadata: {
          appliedOperations: [
            'EXIF & GPS Stripping (fl_strip_profile)',
            rep.privacyRisks.facesDetected > 0
              ? 'Face Pixelation (e_pixelate_faces:15)'
              : 'Face Anonymization (0 faces detected)',
          ],
          originalSize: origBytes,
        },
      },
    ];

    setTransformationResults(defaultResults);
    setSelectedResultId(defaultResults[0].id);
  };

  // Handle local image file upload
  const handleUploadFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setLastFailedFile(file);

    try {
      setProcessingStep('Preparing and optimizing image payload for upload...');
      const prepared = await prepareImageForUpload(file);
      const fileToUpload = prepared.file;

      const formData = new FormData();
      formData.append('file', fileToUpload);

      setProcessingStep('Uploading asset to Cloudinary folder pixelshield/uploads/ (inspecting faces & EXIF)...');

      let response: Response | null = null;
      let data: any = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch('/api/cloudinary/upload', {
            method: 'POST',
            body: formData,
          });
          const responseText = await response.text();
          try {
            data = JSON.parse(responseText);
          } catch {
            throw new Error(`Server returned unexpected response (${response.status})`);
          }
          break;
        } catch (fetchErr: any) {
          if (attempt === 0) {
            setProcessingStep('Network hiccup detected, retrying upload connection...');
            await new Promise((r) => setTimeout(r, 1000));
          } else {
            throw fetchErr;
          }
        }
      }

      if (!response || !data) {
        throw new Error('No response received from upload server');
      }

      if (!response.ok) {
        if (data.error === 'CLOUDINARY_NOT_CONFIGURED') {
          setError(
            'Cloudinary credentials are not configured. To process custom uploads, add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables. You can also try any of the 3 instant presets below to test the full pipeline right away!'
          );
        } else {
          setError(data.message || data.error || 'Upload could not be completed.');
        }
        setIsProcessing(false);
        return;
      }

      const now = Date.now();
      setLastFailedFile(null);
      setReport(data.report);
      setProtectionOptions({
        ...DEFAULT_PROTECTION_OPTIONS,
        facePrivacy: data.report.privacyRisks.facesDetected > 0 ? 'pixelate' : 'none',
        stripMetadata: data.report.privacyRisks.exifGpsExposed || data.report.privacyRisks.deviceFingerprintExposed,
      });

      // Populate initial results ledger
      initializeResultsForReport(data.report, now);
    } catch (err: any) {
      console.error('Upload error:', err);
      const rawMsg = err?.message || '';
      if (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('Load failed')) {
        setError(
          'Network connection interrupted during upload. The server took too long to respond or the connection dropped. Click "Try Again" below, or select a smaller photo.'
        );
      } else {
        setError(rawMsg || 'An unexpected error occurred during image processing.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sample image selection (fetches real sample photo and processes through Cloudinary)
  const handleSelectSample = async (sampleKey: string) => {
    setIsProcessing(true);
    setProcessingStep(`Loading sample image (${sampleKey}.jpg)...`);
    setError(null);
    setLastFailedFile(null);

    try {
      const res = await fetch(`/samples/${sampleKey}.jpg`);
      if (!res.ok) throw new Error(`Could not load sample image: ${sampleKey}.jpg`);
      const blob = await res.blob();
      const file = new File([blob], `${sampleKey}.jpg`, { type: 'image/jpeg' });
      await handleUploadFile(file);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sample image.');
      setIsProcessing(false);
    }
  };

  // Add new transformation result to list or replace existing
  const handleAddResult = (newResult: TransformationResult) => {
    setTransformationResults((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === newResult.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newResult;
        return copy;
      }
      return [newResult, ...prev];
    });
  };

  const handleSelectResult = (id: string) => {
    setSelectedResultId(id);
    comparisonRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRetry = () => {
    if (lastFailedFile) {
      handleUploadFile(lastFailedFile);
    }
  };

  const handleReset = () => {
    setReport(null);
    setProtectionOptions(DEFAULT_PROTECTION_OPTIONS);
    setTransformationResults([]);
    setSelectedResultId('');
    setError(null);
    setLastFailedFile(null);
    uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJumpToUpload = () => {
    uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalyzeMedia = () => {
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOptimizeMedia = () => {
    comparisonRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-sky-500 selection:text-white dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        isConfigured={isConfigured}
        cloudName={cloudName}
        onReset={handleReset}
        onJumpToUpload={handleJumpToUpload}
      />

      {/* Main Content Flow */}
      <main className="flex-1 pb-24">
        {/* Section 1: Hero & Pipeline Overview */}
        <LandingHero
          onStart={handleJumpToUpload}
          onSelectSample={handleSelectSample}
        />

        {/* Section 2: Analysis Dashboard Header */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  PixelShield AI Console
                </span>
                <span className="rounded-full bg-zinc-200/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  Interactive Studio
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-black text-zinc-900 dark:text-white sm:text-3xl">
                Media Analysis & Protection
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-right max-w-xs">
              Upload any photo to trigger real Cloudinary face detection, EXIF location stripping, and CDN delivery optimization.
            </p>
          </div>
        </div>

        {/* Section 3: Upload Area & Image Preview */}
        <div ref={uploaderRef}>
          <ImageUploader
            onUploadFile={handleUploadFile}
            onSelectSample={handleSelectSample}
            isProcessing={isProcessing}
            processingStep={processingStep}
            error={error}
            onDismissError={() => setError(null)}
            onRetry={handleRetry}
            canRetry={Boolean(lastFailedFile)}
            uploadedReport={report}
            onAnalyzeMedia={handleAnalyzeMedia}
            onOptimizeMedia={handleOptimizeMedia}
            onStartOver={handleReset}
          />
        </div>

        {/* Section 4: Active Analysis, Transform Actions, Before/After & Export */}
        {report && (
          <div ref={studioRef} className="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
            {/* Component 1: Media Safety Report (Status, Tags, Metadata, Cloudinary Processing) */}
            <MediaSafetyReportView report={report} />

            {/* Component 2: Protect & Transform (Actions & Transformation Results Ledger) */}
            <ProtectAndTransformPanel
              publicId={report.cloudinaryDetails.publicId}
              cloudName={report.cloudinaryDetails.cloudName || cloudName}
              originalUrl={report.cloudinaryDetails.secureUrl}
              originalBytes={report.technicalSpecs.originalBytes}
              originalFormat={report.technicalSpecs.format}
              facesDetectedCount={report.privacyRisks.facesDetected}
              results={transformationResults}
              onAddResult={handleAddResult}
              onSelectResult={handleSelectResult}
              selectedResultId={selectedResultId}
            />

            {/* Component 3: Results (Before / After Comparison) */}
            <div ref={comparisonRef}>
              <BeforeAfterViewer
                originalUrl={report.cloudinaryDetails.secureUrl}
                results={transformationResults}
                activeResultId={selectedResultId}
                onSelectResult={handleSelectResult}
                protectedUrl={transformationAudit?.finalUrl}
                metadata={{
                  originalFormat: report.technicalSpecs.format.toUpperCase(),
                  optimizedFormat: 'Auto (AVIF / WebP via f_auto)',
                  width: report.technicalSpecs.width,
                  height: report.technicalSpecs.height,
                  originalBytes: report.technicalSpecs.originalBytes,
                  estimatedOptimizedBytes: report.technicalSpecs.estimatedOptimizedBytes,
                  optimizationStatus: 'Active (f_auto, q_auto:good)',
                }}
              />
            </div>

            {/* Component 4: Download & Transformation Audit Ledger */}
            {transformationAudit && (
              <ResultExportBar
                transformationAudit={transformationAudit}
                onReset={handleReset}
                publicId={report.cloudinaryDetails.publicId}
              />
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          SECTION 7: STARTUP FOOTER
          ========================================================================= */}
      <footer className="border-t border-zinc-200/80 bg-white/70 py-12 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-zinc-100 pb-8 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white font-black text-xs">
                  PS
                </div>
                <span className="text-base font-bold text-zinc-900 dark:text-white">
                  PixelShield AI
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                Protect every pixel before you share it. AI-powered media privacy, content moderation, and edge delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer"
              >
                Back to Top
              </button>
              <button
                type="button"
                onClick={handleJumpToUpload}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer"
              >
                Analyze Media
              </button>
              <a
                href="https://cloudinary.com/documentation"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center gap-1"
              >
                <span>Cloudinary Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-zinc-400">
            <p>
              Built for <strong className="text-zinc-700 dark:text-zinc-300">HackIndia: Pixels to Products — Cloudinary AI Hackathon 2026</strong> (Track 1: AI Media Pipelines).
            </p>
            <p className="flex items-center gap-1">
              <span>Powered by Cloudinary APIs & Transformations</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
