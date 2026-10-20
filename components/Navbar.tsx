"use client";

import React from "react";
import { Sparkles, Key, ShieldCheck, FileCheck } from "lucide-react";

interface NavbarProps {
  onOpenApiKeyModal: () => void;
  hasDocument: boolean;
  documentName?: string;
  onClearDocument?: () => void;
}

export function Navbar({
  onOpenApiKeyModal,
  hasDocument,
  documentName,
  onClearDocument,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-600 shadow-md shadow-brand-500/20 text-white">
              <Sparkles className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  ResearchHub <span className="text-brand-600 dark:text-brand-400">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/60 dark:border-brand-900/40">
                  <ShieldCheck className="w-3 h-3 text-brand-600" />
                  Evidence checked
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                Intelligent Research & Document Knowledge Platform
              </p>
            </div>
          </div>

          {}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasDocument && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[200px] truncate font-medium">
                  {documentName}
                </span>
                {onClearDocument && (
                  <button
                    onClick={onClearDocument}
                    className="ml-1 text-[10px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 underline font-normal"
                  >
                    Change
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onOpenApiKeyModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shadow-sm"
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">API Setup</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
