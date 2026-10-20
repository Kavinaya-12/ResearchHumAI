import { NextRequest, NextResponse } from "next/server";
import { queryDocumentWithGemini, MissingApiKeyError } from "@/lib/gemini";
import { QueryRequestBody, QueryResponseBody } from "@/lib/types";
import { MAX_DOCUMENT_CHARACTERS } from "@/lib/pdf";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<QueryResponseBody>> {
  try {
    const body: QueryRequestBody = await req.json();

    const { documentText, documentName, question, history } = body;
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        {
          answer: "",
          excerpts: [],
          isFoundInDocument: false,
          modelUsed: "none",
          error: "Question cannot be empty. Please ask a specific question about the document.",
        },
        { status: 400 }
      );
    }
    if (!documentText || typeof documentText !== "string" || documentText.trim().length === 0) {
      return NextResponse.json(
        {
          answer: "",
          excerpts: [],
          isFoundInDocument: false,
          modelUsed: "none",
          error: "No document text was provided. Please upload a PDF document before asking questions.",
        },
        { status: 400 }
      );
    }

    if (documentText.length > MAX_DOCUMENT_CHARACTERS + 2000 || question.length > 4000) {
      return NextResponse.json(
        { answer: "", excerpts: [], isFoundInDocument: false, modelUsed: "none", error: "The document or question exceeds the supported request size." },
        { status: 413 }
      );
    }
    const response = await queryDocumentWithGemini({
      documentText,
      documentName: documentName || "Uploaded Document",
      question: question.trim(),
      history: Array.isArray(history) ? history : [],
      chunks: Array.isArray(body.chunks) ? body.chunks : [],
      signal: req.signal,
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Document query failed:", err.name);

    if (error instanceof MissingApiKeyError || err.name === "MissingApiKeyError") {
      return NextResponse.json(
        {
          answer: "",
          excerpts: [],
          isFoundInDocument: false,
          modelUsed: "none",
          error:
            "Missing GEMINI_API_KEY. Add GEMINI_API_KEY=your_key in .env.local and restart the server.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        answer: "",
        excerpts: [],
        isFoundInDocument: false,
        modelUsed: "none",
        error: err.message || "Internal server error occurred while querying the document.",
      },
      { status: 500 }
    );
  }
}
