import { NextResponse } from "next/server";
import { runGeminiDiagnostic } from "@/lib/gemini";
import { ConnectionDiagnosticResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<ConnectionDiagnosticResult>> {
  try {
    const result = await runGeminiDiagnostic();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        status: "error",
        modelUsed: "none",
        availableModelsCount: 0,
        supportedModels: [],
        latencyMs: 0,
        message: err.message || "Diagnostic check failed.",
      },
      { status: 500 }
    );
  }
}
