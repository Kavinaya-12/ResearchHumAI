# ResearchHub AI

ResearchHub AI is a local document research workspace built with Next.js, TypeScript, and Google Gemini. Upload a text-based PDF to inspect extracted text, search it locally, and ask questions with source excerpts.

## Current capabilities

- Upload and extract text-based PDF files up to 10 MB.
- Inspect extracted pages, copy the extracted text, and search for highlighted matches.
- Ask document questions through the server-side Gemini API integration.
- Display quotations only when the complete quote is present in the extracted document text.
- Keep the active document and chat in browser memory; neither is persisted by this app.

Scanned PDFs require OCR, which is not implemented. Extraction is limited to 80,000 characters. AI output depends on model availability, credentials, and the quality of the PDF text; citations are checked against extracted text, but that check does not prove that an interpretation is correct.

## Run locally

Requirements: Node.js 18.17 or later.

```bash
npm install
```

Set these server-only variables in `.env.local` (do not commit that file):

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3.8-flash
```

`GEMINI_MODEL` defaults to `gemini-3.8-flash`. Use a model supported by your Google AI API key. The app does not store API keys in the browser.

```bash
npm run dev
```

Open http://localhost:3000. The API key diagnostic is available at `/api/diagnostics/gemini` and performs a real minimal generation request.

## Verification

```bash
npx tsc --noEmit
npm run build
```
