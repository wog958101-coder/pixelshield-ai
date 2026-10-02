'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  isConfigured: boolean | null;
  cloudName: string;
  onReset: () => void;
  onJumpToUpload: () => void;
}

export function Navbar({ isConfigured, cloudName, onReset, onJumpToUpload }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={() => {
            onReset();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl p-1"
          aria-label="PixelShield AI Home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-sky-500/20">
            <ShieldCheck className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                PixelShield<span className="text-sky-600 dark:text-sky-400"> AI</span>
              </span>
              <span className="hidden rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 sm:inline-block">
                v2.0
              </span>
            </div>
            <p className="text-[10px] font-medium text-zinc-400 leading-none">
              Cloudinary Media Safety
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            Analyze
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            Features
          </button>
        </nav>

        {/* Right Status & Action */}
        <div className="flex items-center gap-2.5">
          {/* Cloudinary Integration Status Indicator */}
          <div
            className={`hidden lg:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
              isConfigured
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
            title={
              isConfigured
                ? `Active Cloudinary Account: ${cloudName}`
                : 'Cloudinary API credentials missing. Demo/Sandbox fallback active.'
            }
          >
            {isConfigured ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-mono text-[10px]">{cloudName}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Sandbox Mode</span>
              </>
            )}
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={onJumpToUpload}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-zinc-950 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Analyze Media</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white/95 px-4 pt-2 pb-4 dark:border-zinc-800 dark:bg-zinc-950/95 space-y-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="block w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="block w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            Analyze Media
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="block w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="block w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            Features
          </button>
        </div>
      )}
    </header>
  );
}
