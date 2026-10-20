import { NextRequest, NextResponse } from "next/server";
import { extractStructuredInformation, MissingApiKeyError } from "@/lib/gemini";
import { StructuredExtractionResponseBody } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<StructuredExtractionResponseBody>> {
  try {
    const { documentText, documentName } = await req.json();

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json(
        {
          modelUsed: "none",
          error: "Document text is required to extract structured information.",
        },
        { status: 400 }
      );
    }

    const result = await extractStructuredInformation({
      documentText,
      documentName: documentName || "Document",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Structured extraction error:", err);

    if (error instanceof MissingApiKeyError || err.name === "MissingApiKeyError") {
      return NextResponse.json(
        {
          modelUsed: "none",
          error: "Missing GEMINI_API_KEY environment variable in .env.local.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        modelUsed: "none",
        error: err.message || "Failed to extract structured information from document.",
      },
      { status: 500 }
    );
  }
}
