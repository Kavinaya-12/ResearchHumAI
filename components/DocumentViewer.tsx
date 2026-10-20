"use client";

import React, { useState } from "react";
import { DocumentData } from "@/lib/types";
import {
  FileText,
  Copy,
  Check,
  Search,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Layers,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DocumentViewerProps {
  document: DocumentData;
  onClearDocument: () => void;
}

export function DocumentViewer({ document, onClearDocument }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "raw">("pages");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchPage, setActiveMatchPage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const { metadata, fullText, pages } = document;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const matchingPages = pages?.filter((p) =>
    searchQuery.trim() === ""
      ? true
      : p.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const matchCount = searchQuery.trim()
    ? (fullText.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length
    : 0;
  const goToMatchPage = (direction: number) => {
    if (!matchingPages?.length) return;
    setActiveMatchPage((current) => (current + direction + matchingPages.length) % matchingPages.length);
  };
  const highlight = (text: string) => {
    if (!searchQuery.trim()) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.split(new RegExp(`(${escaped})`, "gi")).map((part, index) =>
      part.toLowerCase() === searchQuery.trim().toLowerCase()
        ? <mark key={index} className="rounded bg-amber-200 px-0.5 text-slate-900">{part}</mark>
        : part
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-full max-h-[820px]">
      {}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-brand-100/80 text-brand-700 dark:bg-brand-950 dark:text-brand-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={metadata.fileName}>
                {metadata.fileName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatFileSize(metadata.fileSize)} • Indexed {new Date(metadata.extractedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isExpanded ? "Collapse viewer" : "Expand viewer"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onClearDocument}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Replace or remove document"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
          <div className="rounded-lg bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
              <Layers className="w-3 h-3 text-brand-500" />
              Pages
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {metadata.pageCount}
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-500" />
              Words
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {metadata.wordCount.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
              <Hash className="w-3 h-3 text-emerald-500" />
              Characters
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {metadata.charCount.toLocaleString()}
            </div>
          </div>
        </div>

        {}
        {metadata.isTruncated && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Text Limit Applied:</span> To keep AI analysis cost-conscious and lightning-fast, the document text was truncated to the first {metadata.maxCharLimit?.toLocaleString() || "80,000"} characters.
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          {}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            {}
            <div className="relative flex-1 max-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search text..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveMatchPage(0); }}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {searchQuery.trim() && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500" aria-live="polite">
                <span>{matchCount} {matchCount === 1 ? "match" : "matches"}</span>
                <button type="button" onClick={() => goToMatchPage(-1)} disabled={!matchingPages?.length} className="px-1.5 py-1 rounded hover:bg-slate-100 disabled:opacity-40" aria-label="Previous matching page">↑</button>
                <button type="button" onClick={() => goToMatchPage(1)} disabled={!matchingPages?.length} className="px-1.5 py-1 rounded hover:bg-slate-100 disabled:opacity-40" aria-label="Next matching page">↓</button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {}
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px]">
                <button
                  onClick={() => setActiveTab("pages")}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    activeTab === "pages"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Pages
                </button>
                <button
                  onClick={() => setActiveTab("raw")}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    activeTab === "raw"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Raw
                </button>
              </div>

              {}
              <button
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 transition-colors"
                title="Copy full extracted text"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-4 text-xs font-mono leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300">
            {activeTab === "pages" && pages && pages.length > 0 ? (
              <div className="space-y-4">
                {matchingPages && matchingPages.length > 0 ? (
                  matchingPages.map((page, index) => (
                    <div
                      key={`page-${page.pageNumber}`}
                      ref={index === activeMatchPage ? (el) => el?.scrollIntoView({ block: "nearest" }) : undefined}
                      className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-3.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
                        <span>Page {page.pageNumber}</span>
                        <span>{page.text.length} chars</span>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {highlight(page.text)}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    No matching text found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {highlight(fullText)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  );
}
