import { NextRequest, NextResponse } from "next/server";
import { summarizeDocument, MissingApiKeyError } from "@/lib/gemini";
import { SummaryRequestBody, SummaryResponseBody } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<SummaryResponseBody>> {
  try {
    const body: SummaryRequestBody = await req.json();
    const { documentText, documentName, mode } = body;

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json(
        {
          summary: "",
          mode: mode || "executive",
          modelUsed: "none",
          error: "Document text is required to generate a summary.",
        },
        { status: 400 }
      );
    }

    const result = await summarizeDocument({
      documentText,
      documentName: documentName || "Document",
      mode: mode || "executive",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Summarization error:", err);

    if (error instanceof MissingApiKeyError || err.name === "MissingApiKeyError") {
      return NextResponse.json(
        {
          summary: "API key required. Configure GEMINI_API_KEY in .env.local.",
          mode: "executive",
          modelUsed: "none",
          error: "Missing GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        summary: `Failed to summarize document: ${err.message}`,
        mode: "executive",
        modelUsed: "none",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
