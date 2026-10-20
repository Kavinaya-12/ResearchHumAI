import { NextRequest, NextResponse } from "next/server";
import { compareDocuments, MissingApiKeyError } from "@/lib/gemini";
import { CompareDocumentsRequestBody, CompareDocumentsResponseBody } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<CompareDocumentsResponseBody>> {
  try {
    const body: CompareDocumentsRequestBody = await req.json();
    const { docA, docB } = body;

    if (!docA?.text || !docB?.text) {
      return NextResponse.json(
        {
          overview: "",
          commonThemes: [],
          differences: [],
          contradictions: [],
          points: [],
          modelUsed: "none",
          error: "Both Document A and Document B are required for comparative analysis.",
        },
        { status: 400 }
      );
    }

    const result = await compareDocuments({
      docA,
      docB,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Document comparison error:", err);

    if (error instanceof MissingApiKeyError || err.name === "MissingApiKeyError") {
      return NextResponse.json(
        {
          overview: "API key required. Configure GEMINI_API_KEY in .env.local.",
          commonThemes: [],
          differences: [],
          contradictions: [],
          points: [],
          modelUsed: "none",
          error: "Missing GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        overview: `Failed to compare documents: ${err.message}`,
        commonThemes: [],
        differences: [],
        contradictions: [],
        points: [],
        modelUsed: "none",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
