"use client";

import React, { useState } from "react";
import { DocumentData, InsightItem, InsightsResponseBody } from "@/lib/types";
import {
  Lightbulb,
  Loader2,
  Quote,
  ShieldCheck,
  RotateCw,
  Copy,
  Check,
  AlertTriangle,
  BarChart3,
  Award,
} from "lucide-react";

interface InsightsViewProps {
  document: DocumentData | null;
}

export function InsightsView({ document }: InsightsViewProps) {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleExtractInsights = async () => {
    if (!document || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: document.fullText,
          documentName: document.metadata.fileName,
        }),
      });

      const data: InsightsResponseBody = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract document insights.");
      }

      setInsights(data.insights || []);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Failed to extract insights.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEvidence = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const getCategoryBadge = (category: InsightItem["category"]) => {
    switch (category) {
      case "finding":
        return { label: "Empirical Finding", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60", icon: Award };
      case "claim":
        return { label: "Author Claim", bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60", icon: ShieldCheck };
      case "methodology":
        return { label: "Methodology", bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60", icon: Lightbulb };
      case "limitation":
        return { label: "Limitation / Constraint", bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60", icon: AlertTriangle };
      case "metric":
        return { label: "Key Metric", bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60", icon: BarChart3 };
      default:
        return { label: "Insight", bg: "bg-slate-100 text-slate-700", icon: Lightbulb };
    }
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Lightbulb className="w-10 h-10 mb-2 opacity-50" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-300">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Upload a research document to extract evidence-backed claims and findings.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[600px]">
      {}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Key Insights, Claims & Evidence
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Extract verified findings, methodology claims, and limitations from {document.metadata.fileName}.
          </p>
        </div>

        <button
          onClick={handleExtractInsights}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Extracting...</span>
            </>
          ) : (
            <>
              <RotateCw className="w-3.5 h-3.5" />
              <span>{insights.length > 0 ? "Re-extract Insights" : "Extract Key Insights"}</span>
            </>
          )}
        </button>
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
            <p className="text-xs font-medium">Scanning document for claims, metrics, and empirical findings...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>{insights.length} Evidence-Backed Insights Extracted</span>
              {modelUsed && <span>Model: {modelUsed}</span>}
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {insights.map((item, idx) => {
                const badge = getCategoryBadge(item.category);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={`ins-${idx}`}
                    className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    {item.evidence && (
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 font-semibold uppercase">
                          <div className="flex items-center gap-1">
                            <Quote className="w-3 h-3 rotate-180 text-brand-500" />
                            <span>Direct Document Evidence:</span>
                          </div>
                          <button
                            onClick={() => handleCopyEvidence(item.evidence, idx)}
                            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1 lowercase font-normal"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                                <span>copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>copy quote</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                          &ldquo;{item.evidence}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
            <p className="text-xs">Click <strong>Extract Key Insights</strong> above to discover the key empirical findings and verified claims in this document.</p>
          </div>
        )}
      </div>
    </div>
  );
}
