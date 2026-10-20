"use client";

import { useState } from "react";
import { DocumentData } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { DocumentUploader } from "@/components/DocumentUploader";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ChatInterface } from "@/components/ChatInterface";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { BookOpen, ShieldCheck } from "lucide-react";

export default function Home() {
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleDocumentLoaded = (doc: DocumentData) => setCurrentDocument(doc);
  const handleClearDocument = () => setCurrentDocument(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasDocument={!!currentDocument}
        documentName={currentDocument?.metadata.fileName}
        onClearDocument={handleClearDocument}
      />
      <main className="flex-1 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <section className="mb-9 max-w-3xl animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            <BookOpen className="w-4 h-4" /> Research workspace
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-slate-950">
            {currentDocument ? currentDocument.metadata.fileName : "Bring your research into focus."}
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            {currentDocument
              ? "Explore the extracted text, search for evidence, and ask questions grounded in this document."
              : "Upload a text-based PDF to inspect its contents, search locally, and ask evidence-based questions."}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Document text is processed for this workspace and is not saved by the app.
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-7 items-stretch">
          <section className="xl:col-span-6 space-y-3 animate-slide-up">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Document</h2>
            {currentDocument ? (
              <DocumentViewer document={currentDocument} onClearDocument={handleClearDocument} />
            ) : (
              <DocumentUploader onDocumentLoaded={handleDocumentLoaded} />
            )}
          </section>
          <section className="xl:col-span-6 space-y-3 animate-slide-up">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ask about your document</h2>
            <ChatInterface
              document={currentDocument}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          </section>
        </div>
      </main>
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        ResearchHub AI - PDF text extraction and local document search
      </footer>
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
    </div>
  );
}
