"use client";

import React, { useState } from "react";
import { DocumentData, SummaryMode, SummaryResponseBody } from "@/lib/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  Download,
  RotateCw,
  Sparkles,
  BookOpen,
  ListOrdered,
  Smile,
} from "lucide-react";

interface SummaryViewProps {
  document: DocumentData | null;
}

export function SummaryView({ document }: SummaryViewProps) {
  const [selectedMode, setSelectedMode] = useState<SummaryMode>("executive");
  const [summary, setSummary] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const modes: { id: SummaryMode; label: string; desc: string; icon: React.ElementType }[] = [
    {
      id: "executive",
      label: "Executive Summary",
      desc: "High-level overview covering thesis, method, results, and impact.",
      icon: FileText,
    },
    {
      id: "section",
      label: "Section-wise Summary",
      desc: "Structured breakdown following the document's primary sections.",
      icon: BookOpen,
    },
    {
      id: "findings",
      label: "Key Findings",
      desc: "Quantitative discoveries, experimental results, and outcomes.",
      icon: ListOrdered,
    },
    {
      id: "simple",
      label: "Simple Explanation",
      desc: "Beginner-friendly explanation unpacking technical jargon.",
      icon: Smile,
    },
  ];

  const handleGenerateSummary = async (mode = selectedMode) => {
    if (!document || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: document.fullText,
          documentName: document.metadata.fileName,
          mode,
        }),
      });

      const data: SummaryResponseBody = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate document summary.");
      }

      setSummary(data.summary);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Failed to summarize document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!document || !summary) return;
    const content = `# Summary: ${document.metadata.fileName}\n**Mode:** ${selectedMode}\n**Date:** ${new Date().toLocaleString()}\n\n---\n\n${summary}`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `Summary-${selectedMode}-${document.metadata.fileName.replace(/\.pdf$/i, "")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <FileText className="w-10 h-10 mb-2 opacity-50" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-300">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Upload a research document to generate structured summaries.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[600px]">
      {}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Document Synthesis & Summarization
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select synthesis mode and generate multi-perspective summaries grounded in {document.metadata.fileName}.
            </p>
          </div>

          <button
            onClick={() => handleGenerateSummary(selectedMode)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>Generate Summary</span>
              </>
            )}
          </button>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMode(m.id);
                  if (summary) handleGenerateSummary(m.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/60 dark:border-brand-500/80 dark:bg-brand-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs text-slate-900 dark:text-white mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`} />
                  <span>{m.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {}
      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-xs font-medium">Analyzing document text and synthesizing {selectedMode} summary...</p>
          </div>
        ) : summary ? (
          <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Mode: {selectedMode} summary • {modelUsed && `Model: ${modelUsed}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
              <MarkdownRenderer content={summary} />
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
            <p className="text-xs">Click <strong>Generate Summary</strong> above to produce a structured synthesis of the document.</p>
          </div>
        )}
      </div>
    </div>
  );
}
