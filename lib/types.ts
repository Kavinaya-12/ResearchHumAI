export interface DocumentMetadata {
  fileName: string;
  fileSize: number; // in bytes
  pageCount: number;
  wordCount: number;
  charCount: number;
  extractedAt: string;
  isTruncated: boolean;
  maxCharLimit?: number;
}

export interface DocumentChunk {
  id: string;
  pageNumber: number;
  text: string;
  charCount: number;
  startChar: number;
  endChar: number;
}

export interface DocumentData {
  id: string;
  metadata: DocumentMetadata;
  fullText: string;
  previewText: string;
  pages?: {
    pageNumber: number;
    text: string;
  }[];
  chunks?: DocumentChunk[];
}

export interface DocumentExcerpt {
  quote: string;
  relevance?: string;
  pageNumber?: number;
  chunkId?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  excerpts?: DocumentExcerpt[];
  isFoundInDocument?: boolean;
  modelUsed?: string;
  status?: "pending" | "success" | "error";
  errorMessage?: string;
}

export interface QueryRequestBody {
  documentText: string;
  documentName: string;
  question: string;
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
  chunks?: DocumentChunk[];
}

export interface QueryResponseBody {
  answer: string;
  excerpts: DocumentExcerpt[];
  isFoundInDocument: boolean;
  modelUsed: string;
  error?: string;
}

export type SummaryMode = "executive" | "section" | "findings" | "simple";

export interface SummaryRequestBody {
  documentText: string;
  documentName: string;
  mode: SummaryMode;
}

export interface SummaryResponseBody {
  summary: string;
  mode: SummaryMode;
  modelUsed: string;
  error?: string;
}

export interface InsightItem {
  category: "finding" | "claim" | "methodology" | "limitation" | "metric";
  title: string;
  description: string;
  evidence: string;
  pageNumber?: number;
}

export interface InsightsResponseBody {
  insights: InsightItem[];
  modelUsed: string;
  error?: string;
}

export interface GenerateQuestionsResponseBody {
  questions: string[];
  modelUsed: string;
  error?: string;
}

export interface ExplainPassageRequestBody {
  passage: string;
  documentName: string;
}

export interface ExplainPassageResponseBody {
  explanation: string;
  simplifiedKeyPoints: string[];
  contextualNotes?: string;
  modelUsed: string;
  error?: string;
}

export interface StructuredExtractionResponseBody {
  objectives?: string[];
  methodology?: string[];
  results?: string[];
  limitations?: string[];
  conclusions?: string[];
  metrics?: { label: string; value: string; context?: string }[];
  modelUsed: string;
  error?: string;
}

export interface CompareDocumentsRequestBody {
  docA: { name: string; text: string };
  docB: { name: string; text: string };
}

export interface ComparisonPoint {
  topic: string;
  documentAStance: string;
  documentBStance: string;
  comparison: "agreement" | "contradiction" | "distinct";
  evidenceA?: string;
  evidenceB?: string;
}

export interface CompareDocumentsResponseBody {
  overview: string;
  commonThemes: string[];
  differences: string[];
  contradictions: string[];
  points: ComparisonPoint[];
  modelUsed: string;
  error?: string;
}

export interface ConnectionDiagnosticResult {
  status: "connected" | "overloaded" | "invalid_key" | "missing_key" | "error";
  modelUsed: string;
  availableModelsCount: number;
  supportedModels: string[];
  latencyMs: number;
  message: string;
}

export interface ExtractPdfResponse {
  success: boolean;
  metadata?: DocumentMetadata;
  text?: string;
  preview?: string;
  pages?: {
    pageNumber: number;
    text: string;
  }[];
  chunks?: DocumentChunk[];
  error?: string;
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  documentId?: string;
  documentName?: string;
  tags?: string[];
}
