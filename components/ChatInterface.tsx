"use client";

import React, { useState, useRef, useEffect } from "react";
import { DocumentData, ChatMessage, QueryResponseBody, GenerateQuestionsResponseBody } from "@/lib/types";
import { MessageItem } from "./MessageItem";
import {
  Send,
  Loader2,
  Trash2,
  Download,
  Sparkles,
  HelpCircle,
  FileQuestion,
  Key,
  XCircle,
  RotateCw,
} from "lucide-react";

interface ChatInterfaceProps {
  document: DocumentData | null;
  onOpenApiKeyModal: () => void;
  onSelectExcerpt?: (quote: string) => void;
}

export function ChatInterface({ document, onOpenApiKeyModal }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isMissingApiKey, setIsMissingApiKey] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeDocumentIdRef = useRef(document?.id);
  const questionsRequestIdRef = useRef(0);
  const conversationGenerationRef = useRef(0);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [inputQuestion]);
  useEffect(() => {
    activeDocumentIdRef.current = document?.id;
    conversationGenerationRef.current += 1;
    questionsRequestIdRef.current += 1;
    setMessages([]);
    setDynamicQuestions([]);
    setErrorBanner(null);
    setIsMissingApiKey(false);
    setIsLoading(false);
    setIsGeneratingQuestions(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [document?.id]);

  const handleFetchSuggestedQuestions = async () => {
    if (!document || isGeneratingQuestions) return;
    const requestId = ++questionsRequestIdRef.current;
    const documentId = document.id;

    setIsGeneratingQuestions(true);
    setErrorBanner(null);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: document.fullText,
          documentName: document.metadata.fileName,
        }),
      });

      const data: GenerateQuestionsResponseBody = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate suggested inquiries.");
      }

      if (activeDocumentIdRef.current === documentId && questionsRequestIdRef.current === requestId) {
        setDynamicQuestions(data.questions || []);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn("Could not generate questions:", error.message);
      if (activeDocumentIdRef.current === documentId && questionsRequestIdRef.current === requestId) {
        setErrorBanner(error.message || "Failed to generate dynamic questions.");
      }
    } finally {
      if (activeDocumentIdRef.current === documentId && questionsRequestIdRef.current === requestId) {
        setIsGeneratingQuestions(false);
      }
    }
  };

  const handleSubmit = async (questionToAsk?: string) => {
    const question = (questionToAsk || inputQuestion).trim();
    if (!question || isLoading) return;

    if (!document) {
      setErrorBanner("Please upload or select an active document first.");
      return;
    }

    setErrorBanner(null);
    setIsMissingApiKey(false);
    setInputQuestion("");
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestDocumentId = document.id;
    const requestGeneration = ++conversationGenerationRef.current;
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: question,
      timestamp: Date.now(),
      status: "success",
    };
    const pendingAssistantId = `msg-${Date.now()}-assistant`;
    const pendingMessage: ChatMessage = {
      id: pendingAssistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "pending",
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setIsLoading(true);

    try {
      const historyContext = messages
        .filter((m) => m.status === "success")
        .slice(-4)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/query-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          documentText: document.fullText,
          documentName: document.metadata.fileName,
          question,
          history: historyContext,
          chunks: document.chunks || [],
        }),
      });

      const data: QueryResponseBody = await res.json();

      if (activeDocumentIdRef.current !== requestDocumentId || conversationGenerationRef.current !== requestGeneration) return;

      if (!res.ok) {
        if (data.error && data.error.includes("GEMINI_API_KEY")) {
          setIsMissingApiKey(true);
        }
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingAssistantId
            ? {
                ...m,
                content: data.answer,
                excerpts: data.excerpts || [],
                isFoundInDocument: data.isFoundInDocument,
                modelUsed: data.modelUsed,
                status: "success",
              }
            : m
        )
      );
    } catch (err: unknown) {
      if (activeDocumentIdRef.current !== requestDocumentId || conversationGenerationRef.current !== requestGeneration) return;
      const error = err as Error;
      if (error.name === "AbortError" || controller.signal.aborted) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingAssistantId
              ? {
                  ...m,
                  content: "Query was cancelled by the user.",
                  status: "error",
                  errorMessage: "Cancelled by user.",
                }
              : m
          )
        );
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingAssistantId
            ? {
                ...m,
                content:
                  error.message ||
                  "Failed to get an answer from the document. Please check your connection or API key.",
                status: "error",
                errorMessage: error.message,
              }
            : m
        )
      );
    } finally {
      if (activeDocumentIdRef.current === requestDocumentId && conversationGenerationRef.current === requestGeneration) {
        setIsLoading(false);
        if (abortControllerRef.current === controller) abortControllerRef.current = null;
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    }
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear the conversation history for this document?")) {
      conversationGenerationRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages([]);
      setErrorBanner(null);
    }
  };

  const handleRetryLastQuestion = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSubmit(lastUserMsg.content);
    }
  };

  const handleExportMarkdown = () => {
    if (!document || messages.length === 0) return;

    let md = `# ResearchHub AI — Grounded Research Report\n\n`;
    md += `**Document:** ${document.metadata.fileName}\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n`;
    md += `**Pages:** ${document.metadata.pageCount} | **Words:** ${document.metadata.wordCount.toLocaleString()} | **Characters:** ${document.metadata.charCount.toLocaleString()}\n\n---\n\n`;

    messages.forEach((m) => {
      if (m.role === "user") {
        md += `### Research Question:\n${m.content}\n\n`;
      } else if (m.status === "success") {
        md += `**Grounded Answer:**\n${m.content}\n\n`;
        if (m.modelUsed) {
          md += `*Model: ${m.modelUsed}*\n\n`;
        }
        if (m.excerpts && m.excerpts.length > 0) {
          md += `**Supporting Citations & Evidence:**\n`;
          m.excerpts.forEach((ex, i) => {
            md += `> "${ex.quote}" (Page ${ex.pageNumber || "N/A"})\n`;
            if (ex.relevance) md += `> *Relevance:* ${ex.relevance}\n\n`;
          });
        }
        md += `\n---\n\n`;
      }
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `ResearchHub-QA-${document.metadata.fileName.replace(/\.pdf$/i, "")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[580px]">
      {}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
              Ask ResearchHub (Grounded Q&A)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {document
                ? `Active Context: ${document.metadata.fileName}`
                : "Awaiting PDF document upload"}
            </p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 transition-colors"
                title="Export Q&A as Markdown report"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Report</span>
              </button>

              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {}
      {isMissingApiKey && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Google Gemini API key required. Configure <code className="font-mono font-semibold">GEMINI_API_KEY</code> in your <code className="font-mono">.env.local</code>.
            </span>
          </div>
          <button
            onClick={onOpenApiKeyModal}
            className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors shrink-0 text-[11px]"
          >
            Setup Guide
          </button>
        </div>
      )}

      {}
      {errorBanner && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
          <span>{errorBanner}</span>
          <button
            onClick={handleRetryLastQuestion}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 underline hover:no-underline"
          >
            <RotateCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!document ? (
          
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              No Document Uploaded Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Upload a research paper or PDF in the workspace panel to begin asking grounded questions.
            </p>
          </div>
        ) : messages.length === 0 ? (
          
          <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Document Indexed & Ready
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
              Ask any question about <strong>{document.metadata.fileName}</strong>. Supporting quotations are checked against extracted document text.
            </p>

            {}
            <div className="mt-6 w-full max-w-lg space-y-3">
              {dynamicQuestions.length === 0 ? (
                <button
                  onClick={handleFetchSuggestedQuestions}
                  disabled={isGeneratingQuestions}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/60 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-100/70 transition-all shadow-xs"
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Formulating research inquiries from document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                      <span>Generate Suggested Research Inquiries</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                    <span>Generated Inquiries from Text:</span>
                    <button
                      onClick={handleFetchSuggestedQuestions}
                      disabled={isGeneratingQuestions}
                      className="text-brand-600 hover:text-brand-700 font-normal lowercase flex items-center gap-1"
                    >
                      <RotateCw className="w-2.5 h-2.5" />
                      regenerate
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {dynamicQuestions.map((questionText, idx) => (
                      <button
                        key={`dq-${idx}`}
                        onClick={() => handleSubmit(questionText)}
                        disabled={isLoading}
                        className="group flex items-center justify-between text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-brand-50/70 hover:border-brand-200 dark:hover:bg-brand-950/40 dark:hover:border-brand-900/60 transition-all text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 font-medium">
                          &ldquo;{questionText}&rdquo;
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          
          <>
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {}
      <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative flex items-end gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              document
                ? "Ask a question about this document... (e.g. findings, methodology, metrics)"
                : "Upload a document to ask questions..."
            }
            disabled={!document || isLoading}
            className="flex-1 max-h-32 min-h-[38px] resize-none bg-transparent py-1.5 px-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
          />

          {isLoading ? (
            <button
              type="button"
              onClick={handleCancelRequest}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition-colors shrink-0"
              title="Cancel generation"
            >
              <XCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!document || !inputQuestion.trim() || isLoading}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
              title="Send question (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> to submit, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Shift+Enter</kbd> for newline
          </span>
          <span className="hidden sm:inline">
            Deterministic Grounding Baseline Active
          </span>
        </div>
      </div>
    </div>
  );
}
