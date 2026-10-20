import { extractText, getDocumentProxy } from "unpdf";
import { DocumentMetadata, DocumentChunk } from "./types";
import { createDocumentChunks } from "./retrieval";

export const MAX_DOCUMENT_CHARACTERS = 80000; // ~16,000-20,000 words (~35-40 pages)
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface ExtractedPdfResult {
  text: string;
  preview: string;
  pages: { pageNumber: number; text: string }[];
  chunks: DocumentChunk[];
  metadata: DocumentMetadata;
}


export async function parsePdfBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  fileSize: number
): Promise<ExtractedPdfResult> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const pageCount = pdf.numPages;

  const { text: pageTexts } = await extractText(pdf, { mergePages: false });

  const pages: { pageNumber: number; text: string }[] = [];
  let combinedText = "";

  const pageList = Array.isArray(pageTexts) ? pageTexts : [pageTexts];

  pageList.forEach((rawText, idx) => {
    const pageNum = idx + 1;
    const cleanText = (rawText || "").trim();
    if (cleanText) {
      pages.push({
        pageNumber: pageNum,
        text: cleanText,
      });
      combinedText += `\n--- Page ${pageNum} ---\n${cleanText}\n`;
    }
  });

  combinedText = combinedText.trim();

  if (!combinedText) {
    throw new Error(
      "No readable text found in this PDF. It appears to be an image-only scan or password-protected document. Please provide a text-based PDF."
    );
  }
  const rawCharCount = combinedText.length;
  const isTruncated = rawCharCount > MAX_DOCUMENT_CHARACTERS;
  let remaining = MAX_DOCUMENT_CHARACTERS;
  const indexedPages: { pageNumber: number; text: string }[] = [];
  for (const page of pages) {
    if (remaining <= 0) break;
    const text = page.text.slice(0, remaining);
    if (text) indexedPages.push({ pageNumber: page.pageNumber, text });
    remaining -= text.length;
  }
  const finalText = indexedPages
    .map((page) => `--- Page ${page.pageNumber} ---\n${page.text}`)
    .join("\n\n");
  const extractedContent = indexedPages.map((page) => page.text).join("\n");
  const wordCount = extractedContent
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const metadata: DocumentMetadata = {
    fileName,
    fileSize,
    pageCount,
    wordCount,
    charCount: extractedContent.length,
    extractedAt: new Date().toISOString(),
    isTruncated,
    maxCharLimit: MAX_DOCUMENT_CHARACTERS,
  };
  const chunks = createDocumentChunks(indexedPages);
  const preview =
    finalText.length > 800 ? `${finalText.slice(0, 800)}...` : finalText;

  return {
    text: finalText,
    preview,
    pages: indexedPages,
    chunks,
    metadata,
  };
}
