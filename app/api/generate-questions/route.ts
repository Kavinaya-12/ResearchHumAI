import { NextRequest, NextResponse } from "next/server";
import { generateSuggestedQuestions, MissingApiKeyError } from "@/lib/gemini";
import { GenerateQuestionsResponseBody } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<GenerateQuestionsResponseBody>> {
  try {
    const { documentText, documentName } = await req.json();

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json(
        {
          questions: [],
          modelUsed: "none",
          error: "Document text is required to generate suggested questions.",
        },
        { status: 400 }
      );
    }

    const result = await generateSuggestedQuestions({
      documentText,
      documentName: documentName || "Document",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Generate questions error:", err);

    if (error instanceof MissingApiKeyError || err.name === "MissingApiKeyError") {
      return NextResponse.json(
        {
          questions: [],
          modelUsed: "none",
          error: "Missing GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        questions: [],
        modelUsed: "none",
        error: err.message || "Failed to generate dynamic questions from the document.",
      },
      { status: 500 }
    );
  }
}
