import { NextRequest, NextResponse } from "next/server";
import { explainPassage, MissingApiKeyError } from "@/lib/gemini";
import { ExplainPassageResponseBody } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<ExplainPassageResponseBody>> {
  try {
    const { passage, documentName } = await req.json();

    if (!passage || passage.trim().length === 0) {
      return NextResponse.json(
        {
          explanation: "",
          simplifiedKeyPoints: [],
          modelUsed: "none",
          error: "Passage text is required for beginner explanation.",
        },
        { status: 400 }
      );
    }

    const result = await explainPassage({
      passage,
      documentName: documentName || "Document",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Explain passage error:", err);

    if (error instanceof MissingApiKeyError || err.name === "MissingApiKeyError") {
      return NextResponse.json(
        {
          explanation: "API key required. Configure GEMINI_API_KEY in .env.local.",
          simplifiedKeyPoints: [],
          modelUsed: "none",
          error: "Missing GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        explanation: `Failed to explain passage: ${err.message}`,
        simplifiedKeyPoints: [],
        modelUsed: "none",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
