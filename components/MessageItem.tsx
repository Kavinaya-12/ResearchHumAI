"use client";

import React, { useState } from "react";
import { ChatMessage } from "@/lib/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ExcerptCard } from "./ExcerptCard";
import {
  Sparkles,
  User,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileSearch,
} from "lucide-react";

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [showExcerpts, setShowExcerpts] = useState(true);

  const isAssistant = message.role === "assistant";
  const isPending = message.status === "pending";
  const isError = message.status === "error";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message", err);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
        isAssistant
          ? "bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
          : "bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60"
      }`}
    >
      {}
      <div className="shrink-0">
        {isAssistant ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-medium text-xs">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {}
      <div className="flex-1 min-w-0 space-y-2.5">
        {}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
              {isAssistant ? "ResearchHub AI" : "You"}
            </span>

            {}
            {isAssistant && !isPending && !isError && (
              <>
                {message.isFoundInDocument !== false ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Document-Grounded
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Not in Document
                  </span>
                )}
              </>
            )}

            <span className="text-[11px] text-slate-400">{formattedTime}</span>
          </div>

          {}
          {!isPending && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {}
        {isPending ? (
          <div className="flex items-center gap-2.5 py-2 text-slate-500 dark:text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Searching the document and preparing an evidence-based answer...</span>
          </div>
        ) : isError ? (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to process query</p>
              <p className="text-[11px] mt-0.5">{message.errorMessage || message.content}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm">
            <MarkdownRenderer content={message.content} />
          </div>
        )}

        {}
        {isAssistant && message.excerpts && message.excerpts.length > 0 && !isPending && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={() => setShowExcerpts(!showExcerpts)}
              className="flex items-center justify-between w-full text-left py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-brand-500" />
                <span>Verified source excerpts ({message.excerpts.length})</span>
              </div>
              {showExcerpts ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showExcerpts && (
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 animate-fade-in">
                {message.excerpts.map((excerpt, idx) => (
                  <ExcerptCard key={`excerpt-${idx}`} excerpt={excerpt} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
