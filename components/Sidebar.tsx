"use client";

import React from "react";
import { DocumentData } from "@/lib/types";
import {
  Layers,
  BookOpen,
  MessageSquare,
  FileText,
  Lightbulb,
  GitCompare,
  StickyNote,
  Trash2,
  FileCheck,
  Cpu,
} from "lucide-react";

export type ActiveTab =
  | "workspace"
  | "reader"
  | "chat"
  | "summaries"
  | "insights"
  | "compare"
  | "notes";

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  document: DocumentData | null;
  onClearDocument: () => void;
  secondaryDocument?: DocumentData | null;
  diagnosticStatus?: string;
  activeModelName?: string;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  document,
  onClearDocument,
  secondaryDocument,
  diagnosticStatus,
  activeModelName,
}: SidebarProps) {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; requiresDoc?: boolean }[] = [
    { id: "workspace", label: "Workspace Overview", icon: Layers },
    { id: "reader", label: "Document Reader", icon: BookOpen, requiresDoc: true },
    { id: "chat", label: "Ask ResearchHub (Q&A)", icon: MessageSquare, requiresDoc: true },
    { id: "summaries", label: "Document Summaries", icon: FileText, requiresDoc: true },
    { id: "insights", label: "Key Insights & Evidence", icon: Lightbulb, requiresDoc: true },
    { id: "compare", label: "Document Comparison", icon: GitCompare },
    { id: "notes", label: "Research Notes", icon: StickyNote },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      {}
      <div className="p-3 space-y-1">
        <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Research Tools
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isDisabled = item.requiresDoc && !document;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onSelectTab(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-xs"
                  : isDisabled
                  ? "opacity-40 cursor-not-allowed text-slate-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-600 dark:text-brand-400" : ""}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {}
      <div className="mt-auto p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Active Document
        </p>

        {document ? (
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3 text-xs space-y-2">
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-100 truncate text-[11px]" title={document.metadata.fileName}>
                  {document.metadata.fileName}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm("Remove active document and reset research state?")) {
                    onClearDocument();
                  }
                }}
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                title="Remove document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              <div>
                <strong>Pages:</strong> {document.metadata.pageCount}
              </div>
              <div>
                <strong>Words:</strong> {document.metadata.wordCount.toLocaleString()}
              </div>
              <div>
                <strong>Size:</strong> {formatFileSize(document.metadata.fileSize)}
              </div>
              <div>
                <strong>Chunks:</strong> {document.chunks?.length || 1}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-3 text-center text-xs text-slate-400">
            No document loaded
          </div>
        )}

        {}
        {secondaryDocument && (
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 p-2 text-xs">
            <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 block truncate">
              Doc B: {secondaryDocument.metadata.fileName}
            </span>
          </div>
        )}

        {}
        <div className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-500" />
            <span className="truncate max-w-[120px] font-mono text-[10px]">
              {activeModelName || "Gemini"}
            </span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              diagnosticStatus === "connected"
                ? "bg-emerald-500"
                : diagnosticStatus === "overloaded"
                ? "bg-amber-500"
                : "bg-slate-400"
            }`}
            title={`Status: ${diagnosticStatus || "unknown"}`}
          />
        </div>
      </div>
    </aside>
  );
}
