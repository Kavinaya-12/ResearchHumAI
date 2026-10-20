"use client";

import React, { useState } from "react";
import { Key, Copy, Check, ExternalLink, X, ShieldCheck, Terminal } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  const envSnippet = `GEMINI_API_KEY=your_actual_gemini_api_key_here\nGEMINI_MODEL=gemini-3.8-flash`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
        {}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Google Gemini API Key Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your server-side environment variable
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <div className="mt-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-800 dark:text-amber-300">
              Your API key is kept strictly on the server-side via Next.js App Router environment variables. It is never exposed to the client or browser.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <span>Step 1: Get a free Gemini API key</span>
            </h4>
            <p className="mb-2">
              Create a Gemini API key in Google AI Studio and configure it as a server environment variable.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-300 font-medium transition-colors"
            >
              <span>Open Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-brand-500" />
              <span>Step 2: Add key to your local environment</span>
            </h4>
            <p className="mb-2">
              Create a file named <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-semibold text-slate-800 dark:text-slate-200">.env.local</code> in the project root directory:
            </p>

            <div className="relative rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-200 border border-slate-800">
              <button
                onClick={copyEnvSnippet}
                className="absolute right-2.5 top-2.5 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] transition-colors"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre className="overflow-x-auto pr-16">{envSnippet}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
              Step 3: Deploying to Vercel
            </h4>
            <p>
              In your Vercel Project Dashboard, navigate to <strong>Settings → Environment Variables</strong>, and add <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-semibold">GEMINI_API_KEY</code> with your key.
            </p>
          </div>
        </div>

        {}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
