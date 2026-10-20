import { DocumentChunk } from "./types";

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
  "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
  "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had",
  "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "it's", "its",
  "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of",
  "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
  "own", "same", "shan't", "she", "should", "shouldn't", "so", "some", "such", "than", "that",
  "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
  "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "were",
  "weren't", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "won't",
  "would", "wouldn't", "you", "your", "yours", "yourself", "yourselves",
]);


export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}


export function createDocumentChunks(
  pages: { pageNumber: number; text: string }[]
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let globalOffset = 0;

  for (const page of pages) {
    const pageNum = page.pageNumber;
    const paragraphs = page.text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    let currentChunkText = "";
    let chunkStartOffset = globalOffset;
    let chunkIndexInPage = 1;

    for (const para of paragraphs) {
      if ((currentChunkText + "\n\n" + para).length > 1600 && currentChunkText.length > 0) {
        chunks.push({
          id: `p${pageNum}-c${chunkIndexInPage++}`,
          pageNumber: pageNum,
          text: currentChunkText.trim(),
          charCount: currentChunkText.length,
          startChar: chunkStartOffset,
          endChar: chunkStartOffset + currentChunkText.length,
        });
        const overlap = currentChunkText.slice(-250);
        currentChunkText = overlap + "\n\n" + para;
        chunkStartOffset = globalOffset;
      } else {
        currentChunkText = currentChunkText ? currentChunkText + "\n\n" + para : para;
      }
      globalOffset += para.length + 2;
    }

    if (currentChunkText.trim()) {
      chunks.push({
        id: `p${pageNum}-c${chunkIndexInPage}`,
        pageNumber: pageNum,
        text: currentChunkText.trim(),
        charCount: currentChunkText.length,
        startChar: chunkStartOffset,
        endChar: chunkStartOffset + currentChunkText.length,
      });
    }
  }

  return chunks;
}


export function rankChunksForQuery(
  chunks: DocumentChunk[],
  query: string,
  topK = 6
): DocumentChunk[] {
  if (!chunks || chunks.length === 0) return [];
  if (chunks.length <= topK) return chunks;

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return chunks.slice(0, topK);
  }

  const N = chunks.length;
  const df: Record<string, number> = {};
  const chunkTokenized: { chunk: DocumentChunk; tokens: string[]; length: number }[] = [];
  let totalLength = 0;

  for (const chunk of chunks) {
    const tokens = tokenize(chunk.text);
    chunkTokenized.push({ chunk, tokens, length: tokens.length });
    totalLength += tokens.length;

    const uniqueTokens = new Set(tokens);
    for (const qToken of queryTokens) {
      if (uniqueTokens.has(qToken)) {
        df[qToken] = (df[qToken] || 0) + 1;
      }
    }
  }

  const avgdl = totalLength / N || 1;
  const k1 = 1.5;
  const b = 0.75;
  const scored = chunkTokenized.map(({ chunk, tokens, length }) => {
    const tf: Record<string, number> = {};
    for (const t of tokens) {
      tf[t] = (tf[t] || 0) + 1;
    }

    let score = 0;
    for (const qToken of queryTokens) {
      const docFreq = df[qToken] || 0;
      if (docFreq === 0) continue;
      const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
      const termFreq = tf[qToken] || 0;
      const numerator = termFreq * (k1 + 1);
      const denominator = termFreq + k1 * (1 - b + (b * length) / avgdl);
      score += idf * (numerator / denominator);
    }

    return { chunk, score };
  });
  scored.sort((a, b) => b.score - a.score || a.chunk.pageNumber - b.chunk.pageNumber);

  return scored.slice(0, topK).map((item) => item.chunk);
}


export function verifyCitation(
  quote: string,
  chunks: DocumentChunk[],
  fullText: string
): { verified: boolean; pageNumber?: number; chunkId?: string } {
  if (!quote || quote.trim().length < 5) {
    return { verified: false };
  }

  const cleanQuote = quote.trim();
  for (const chunk of chunks) {
    if (chunk.text.includes(cleanQuote)) {
      return { verified: true, pageNumber: chunk.pageNumber, chunkId: chunk.id };
    }
  }
  if (fullText.includes(cleanQuote)) {
    return { verified: true };
  }

  return { verified: false };
}
