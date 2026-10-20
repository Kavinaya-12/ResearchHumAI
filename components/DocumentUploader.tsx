"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { DocumentData, ExtractPdfResponse } from "@/lib/types";

interface DocumentUploaderProps {
  onDocumentLoaded: (doc: DocumentData) => void;
  label?: string;
  sublabel?: string;
}

export function DocumentUploader({
  onDocumentLoaded,
  label = "Upload Research Document",
  sublabel = "Drop your text-based PDF here, or browse files",
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Unsupported file type. ResearchHub AI supports text-based PDF documents (.pdf).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller PDF.`
      );
      return;
    }

    if (file.size === 0) {
      setErrorMessage("The selected file is empty (0 bytes). Please select a valid PDF.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const data: ExtractPdfResponse = await res.json();

      if (!res.ok || !data.success || !data.metadata || !data.text) {
        throw new Error(
          data.error || "Failed to extract readable text. The document may be a scanned image-only PDF without OCR."
        );
      }

      const documentData: DocumentData = {
        id: `doc-${Date.now()}`,
        metadata: data.metadata,
        fullText: data.text,
        previewText: data.preview || data.text.slice(0, 800),
        pages: data.pages || [],
        chunks: data.chunks || [],
      };

      onDocumentLoaded(documentData);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(
        error.message || "An unexpected error occurred during PDF text extraction."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      {}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-brand-500 bg-brand-50/70 dark:border-brand-400 dark:bg-brand-950/30 scale-[1.01]"
            : "border-slate-300 hover:border-brand-400 hover:bg-slate-50/60 dark:border-slate-700 dark:hover:border-brand-500/60 dark:hover:bg-slate-900/50 bg-white dark:bg-slate-900"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                Extracting Document Content...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Parsing PDF structure, indexing pages, and mapping semantic chunks
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:scale-105 transition-transform duration-200">
              <UploadCloud className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {sublabel}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                Supported: Text-based PDFs up to 10MB • Scanned image PDFs require OCR
              </p>
            </div>
          </div>
        )}
      </div>

      {}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-300 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-[11px] opacity-90">
              Note: ResearchHub AI reads text streams directly from PDF documents. If your document was scanned as an image from a physical paper, please convert it using OCR before uploading.
            </p>
          </div>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
            Document-based answers
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
            Checked source excerpts
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
            Deterministic BM25 Retrieval
          </span>
        </div>
      </div>
    </div>
  );
}
