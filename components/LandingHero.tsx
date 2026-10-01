'use client';

import React from 'react';
import {
  ShieldCheck,
  EyeOff,
  MapPinOff,
  Zap,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  Crop,
  FileCode,
  Shield,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  Server,
  Share2,
} from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
  onSelectSample: (preset: string) => void;
}

export function LandingHero({ onStart, onSelectSample }: LandingHeroProps) {
  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-400/15 via-indigo-500/10 to-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-sky-500/5 blur-2xl" />

      {/* =========================================================================
          HERO HEADER
          ========================================================================= */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center" aria-label="Hero">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-xs font-semibold text-sky-800 backdrop-blur-xs dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>HackIndia 2026 • Pixels to Products • Track 1: AI Media Pipelines</span>
        </div>

        {/* Headline & Tagline */}
        <h1 className="mt-6 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
          Protect every pixel <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            before you share it.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400 font-normal leading-relaxed">
          Analyze, optimize and transform your media with an AI-powered Cloudinary media pipeline.
          Detect unblurred bystander faces, strip sensitive EXIF GPS coordinates, and deliver lightweight,
          lossless assets to every screen.
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-zinc-900/15 transition-all hover:bg-zinc-800 active:scale-[0.98] sm:w-auto dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-zinc-950 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <span>Analyze an Image</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleScrollToSection('how-it-works')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] sm:w-auto cursor-pointer"
          >
            <span>See How It Works</span>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        {/* Quick Instant Test Presets */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Try instant preset:</span>
          <button
            type="button"
            onClick={() => onSelectSample('portrait_id')}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:border-sky-300 hover:bg-sky-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-sky-800 transition cursor-pointer"
          >
            Portrait Face ID
          </button>
          <button
            type="button"
            onClick={() => onSelectSample('street_crowd')}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:border-sky-300 hover:bg-sky-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-sky-800 transition cursor-pointer"
          >
            Street Bystanders
          </button>
          <button
            type="button"
            onClick={() => onSelectSample('document_privacy')}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:border-sky-300 hover:bg-sky-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-sky-800 transition cursor-pointer"
          >
            Camera Bloat
          </button>
        </div>

        {/* =========================================================================
            SIMPLIFIED PIPELINE VISUAL: UPLOAD -> ANALYZE -> PROTECT -> OPTIMIZE -> SHARE
            ========================================================================= */}
        <div className="mt-12 rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              AI Media Lifecycle Flow
            </span>
            <span className="text-[11px] text-zinc-400">Cloudinary Ingestion to Edge CDN</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 text-center">
            <div className="flex flex-col items-center rounded-2xl bg-zinc-50/80 p-3 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <UploadCloud className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                1. Upload
              </span>
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                Secure multipart streaming
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-zinc-50/80 p-3 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <EyeOff className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                2. Analyze
              </span>
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                Biometric & EXIF audit
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-zinc-50/80 p-3 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                3. Protect
              </span>
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                Face blur & GPS scrub
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-zinc-50/80 p-3 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Zap className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                4. Optimize
              </span>
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                f_auto & q_auto delivery
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col items-center rounded-2xl bg-zinc-50/80 p-3 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <Share2 className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                5. Share
              </span>
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                Safe CDN edge delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS
          ========================================================================= */}
      <section id="how-it-works" className="mt-20 scroll-mt-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Intelligent Media Defense
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            How PixelShield AI Works
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            From raw camera captures to production-safe delivery in three simple steps.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="relative rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
            <span className="text-3xl font-black text-sky-100 dark:text-sky-950 select-none">
              01
            </span>
            <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
              Scan & Detect
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Upload your image to Cloudinary. PixelShield instantly scans for biometric facial coordinates,
              embedded EXIF location profiles, and evaluates safety risks.
            </p>
          </div>

          <div className="relative rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
            <span className="text-3xl font-black text-indigo-100 dark:text-indigo-950 select-none">
              02
            </span>
            <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
              Anonymize & Transform
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Apply pixelation or Gaussian blur to detected faces. Strip sensitive GPS metadata and camera
              fingerprints while applying content-aware smart crops.
            </p>
          </div>

          <div className="relative rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
            <span className="text-3xl font-black text-emerald-100 dark:text-emerald-950 select-none">
              03
            </span>
            <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
              Optimize & Deliver
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Automatically negotiate modern formats (AVIF/WebP) and perceptual quality (<code className="text-emerald-600 dark:text-emerald-400">f_auto,q_auto</code>),
              reducing file sizes by up to 70% with zero visual fidelity loss.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CORE FEATURES MATRIX
          ========================================================================= */}
      <section id="features" className="mt-24 scroll-mt-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Engine Capabilities
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Built for Modern Privacy & Media Standards
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Every feature connects directly to Cloudinary’s server-side APIs and global edge transformations.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Card 1 */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">
              AI Face Pixelation & Blur
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Detects and redacts facial coordinates with customizable pixelation or Gaussian blur to safeguard bystander identity.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <MapPinOff className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">
              EXIF & GPS Sanitization
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Scrubs embedded GPS coordinates, camera serial numbers, and device hardware signatures via <code className="text-amber-600 font-mono">fl_strip_profile</code>.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">
              Perceptual CDN Optimization
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Combines format auto-negotiation (<code className="text-emerald-600 font-mono">f_auto</code>) and perceptual compression (<code className="text-emerald-600 font-mono">q_auto</code>) for massive bandwidth savings.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Crop className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">
              Smart Content-Aware Cropping
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Crops images to 1:1, 4:5, or 16:9 while using Cloudinary AI gravity (<code className="text-sky-600 font-mono">g_auto</code>) to maintain focal points.
            </p>
          </div>

          {/* Card 5 */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <FileCode className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">
              Format Transcoding
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Edge format transcoding to WebP, AVIF, JPG, or PNG with transparent alpha transparency warnings.
            </p>
          </div>

          {/* Card 6 */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">
              Transparent Operations Audit
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Full visibility into every applied Cloudinary URL transformation parameter, without invented statistics or fake metrics.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: CLOUDINARY INTEGRATION SPOTLIGHT
          ========================================================================= */}
      <section id="pipeline" className="mt-24 scroll-mt-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 via-white to-sky-50/40 p-6 sm:p-10 text-left shadow-xs dark:border-zinc-800 dark:from-zinc-900/40 dark:via-zinc-900/20 dark:to-sky-950/20">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Cloudinary Core Architecture
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
            Real Ingestion, Real Transformations, Real CDN Delivery
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
            PixelShield AI is built specifically for Track 1 (AI Media Pipelines).
            All media uploaded passes through the Cloudinary Upload API into <code className="font-mono text-sky-600 dark:text-sky-400">pixelshield/uploads/</code>,
            where biometric telemetry, moderation states, and dynamic on-the-fly transformations are executed directly on the Cloudinary CDN.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-2xs">
              Upload API Streaming
            </span>
            <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-2xs">
              faces: true detection
            </span>
            <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-2xs">
              image_metadata EXIF
            </span>
            <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-2xs">
              e_pixelate_faces
            </span>
            <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-2xs">
              fl_strip_profile
            </span>
            <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-2xs">
              f_auto, q_auto:good
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CTA BANNER
          ========================================================================= */}
      <section className="mt-24 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 p-8 sm:p-12 text-center text-white shadow-xl shadow-sky-600/10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to protect your media before publishing?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-sky-100 font-medium leading-relaxed">
            Run your images through PixelShield AI’s Cloudinary pipeline now.
            Detect vulnerabilities and generate protected, optimized assets in seconds.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-zinc-900 shadow-lg hover:bg-zinc-100 active:scale-[0.98] transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-sky-600" />
              <span>Start Free Media Audit</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
