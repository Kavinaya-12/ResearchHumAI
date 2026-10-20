import { NextRequest, NextResponse } from "next/server";
import { parsePdfBuffer, MAX_FILE_SIZE_BYTES } from "@/lib/pdf";
import { ExtractPdfResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<ExtractPdfResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file was provided in the upload request. Please select a PDF document.",
        },
        { status: 400 }
      );
    }
    const isPdfMime = file.type === "application/pdf" || file.type.includes("pdf");
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only text-based PDF documents (.pdf) are supported.",
        },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller PDF.`,
        },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded file is empty (0 bytes). Please upload a valid PDF document.",
        },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const signature = new TextDecoder().decode(new Uint8Array(arrayBuffer, 0, Math.min(5, arrayBuffer.byteLength)));
    if (signature !== "%PDF-") {
      return NextResponse.json(
        { success: false, error: "The uploaded file does not have a valid PDF signature." },
        { status: 400 }
      );
    }
    const result = await parsePdfBuffer(arrayBuffer, file.name, file.size);

    return NextResponse.json({
      success: true,
      metadata: result.metadata,
      text: result.text,
      preview: result.preview,
      pages: result.pages,
      chunks: result.chunks,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PDF extraction failed:", err.name);

    return NextResponse.json(
      {
        success: false,
        error:
          err.message ||
          "Failed to extract text from the PDF. The file may be corrupted or password-protected.",
      },
      { status: 500 }
    );
  }
}
