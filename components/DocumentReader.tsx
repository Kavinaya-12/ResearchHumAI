"use client";

import React, { useState, useMemo } from "react";
import { DocumentData } from "@/lib/types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
} from "lucide-react";

interface DocumentReaderProps {
  document: DocumentData;
  onExplainPassage?: (passage: string) => void;
}

export function DocumentReader({ document, onExplainPassage }: DocumentReaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"pages" | "full">("pages");
  const [selectedText, setSelectedText] = useState("");

  const { pages = [], fullText } = document;
  const matchPositions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const matches: number[] = [];
    const lowerQuery = searchQuery.toLowerCase();
    const lowerText = fullText.toLowerCase();

    let pos = lowerText.indexOf(lowerQuery);
    while (pos !== -1) {
      matches.push(pos);
      pos = lowerText.indexOf(lowerQuery, pos + lowerQuery.length);
      if (matches.length > 500) break; // performance guard
    }
    return matches;
  }, [searchQuery, fullText]);

  const totalMatches = matchPositions.length;

  const handleNextMatch = () => {
    if (totalMatches === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % totalMatches);
  };

  const handlePrevMatch = () => {
    if (totalMatches === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + totalMatches) % totalMatches);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(selectedText || fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleSelection = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 10) {
      setSelectedText(sel);
    }
  };
  const renderHighlightedText = (text: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return text;
    }

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark
          key={`m-${i}`}
          className="bg-amber-200 dark:bg-amber-800/80 text-slate-900 dark:text-white rounded-xs px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      onMouseUp={handleSelection}
      className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[600px]"
    >
      {}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        {}
        <div className="flex items-center gap-1.5 flex-1 min-w-[240px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search document text..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentMatchIndex(0);
              }}
              className="w-full pl-8 pr-16 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {totalMatches > 0 && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                {currentMatchIndex + 1}/{totalMatches}
              </span>
            )}
          </div>

          {totalMatches > 0 && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrevMatch}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Previous match"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextMatch}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Next match"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {}
        <div className="flex items-center gap-2">
          {selectedText && onExplainPassage && (
            <button
              onClick={() => onExplainPassage(selectedText)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 transition-colors animate-fade-in"
              title="Explain selected text in simple terms"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Explain Selection</span>
            </button>
          )}

          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setViewMode("pages")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                viewMode === "pages"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Pages</span>
            </button>
            <button
              onClick={() => setViewMode("full")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                viewMode === "full"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Continuous</span>
            </button>
          </div>

          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
            title={selectedText ? "Copy highlighted passage" : "Copy full text"}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{selectedText ? "Copy Selection" : "Copy All"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50/30 dark:bg-slate-950/20">
        {viewMode === "pages" && pages.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {pages.map((page) => (
              <div
                key={`page-${page.pageNumber}`}
                className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 sm:p-6 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                    <span>Page {page.pageNumber}</span>
                  </div>
                  <span>{page.text.length.toLocaleString()} characters</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed select-text font-serif text-[13px] sm:text-sm">
                  {renderHighlightedText(page.text)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs">
            <div className="whitespace-pre-wrap leading-relaxed select-text font-serif text-[13px] sm:text-sm">
              {renderHighlightedText(fullText)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
