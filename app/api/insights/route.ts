import { NextRequest, NextResponse } from "next/server";
import { extractKeyInsights, MissingApiKeyError } from "@/lib/gemini";
import { InsightsResponseBody } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<InsightsResponseBody>> {
  try {
    const { documentText, documentName } = await req.json();

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json(
        {
          insights: [],
          modelUsed: "none",
          error: "Document text is required to extract key insights.",
        },
        { status: 400 }
      );
    }

    const result = await extractKeyInsights({
      documentText,
      documentName: documentName || "Document",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Insights extraction error:", err);

    if (error instanceof MissingApiKeyError || err.name === "MissingApiKeyError") {
      return NextResponse.json(
        {
          insights: [],
          modelUsed: "none",
          error: "Missing GEMINI_API_KEY environment variable in .env.local.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        insights: [],
        modelUsed: "none",
        error: err.message || "Failed to extract insights from document.",
      },
      { status: 500 }
    );
  }
}
