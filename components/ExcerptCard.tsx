"use client";

import React, { useState } from "react";
import { DocumentExcerpt } from "@/lib/types";
import { Quote, Copy, Check, FileText } from "lucide-react";

interface ExcerptCardProps {
  excerpt: DocumentExcerpt;
  index: number;
}

export function ExcerptCard({ excerpt, index }: ExcerptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(excerpt.quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy quote", err);
    }
  };

  return (
    <div className="group relative rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-3.5 text-xs transition-all hover:border-blue-200 hover:shadow-sm dark:border-blue-900/40 dark:from-blue-950/20 dark:to-indigo-950/10">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-400 font-semibold">
          <Quote className="w-3.5 h-3.5 rotate-180" />
          <span>Supporting Excerpt #{index + 1}</span>
          {excerpt.pageNumber && (
            <span className="inline-flex items-center gap-1 ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
              <FileText className="w-2.5 h-2.5" />
              Page {excerpt.pageNumber}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          title="Copy excerpt quote"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-blue-100/60 dark:border-blue-900/30 font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
        &ldquo;{excerpt.quote}&rdquo;
      </div>

      {excerpt.relevance && (
        <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
          <strong className="text-slate-700 dark:text-slate-300 font-medium">Relevance:</strong>{" "}
          {excerpt.relevance}
        </div>
      )}
    </div>
  );
}
