import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { ExtractTextResponse } from "@/types/ai";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json<ExtractTextResponse>(
        {
          success: false,
          text: "",
          totalPages: 0,
          charCount: 0,
          error: "No file was uploaded. Please provide a PDF or TXT file.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ExtractTextResponse>(
        {
          success: false,
          text: "",
          totalPages: 0,
          charCount: 0,
          error: "File size exceeds the 20MB limit.",
        },
        { status: 400 }
      );
    }

    const fileName = (file as File).name?.toLowerCase() || "";
    const fileType = file.type?.toLowerCase() || "";

    const isPdf = fileName.endsWith(".pdf") || fileType.includes("pdf");
    const isTxt = fileName.endsWith(".txt") || fileType.includes("text");

    if (!isPdf && !isTxt) {
      return NextResponse.json<ExtractTextResponse>(
        {
          success: false,
          text: "",
          totalPages: 0,
          charCount: 0,
          error: "Unsupported file type. Only PDF and TXT files are supported.",
        },
        { status: 400 }
      );
    }

    // 1. Plain Text extraction
    if (isTxt) {
      const text = await file.text();
      const trimmed = text.trim();
      const estimatedPages = Math.max(1, Math.ceil(trimmed.length / 2000));

      return NextResponse.json<ExtractTextResponse>({
        success: true,
        text: trimmed,
        totalPages: estimatedPages,
        charCount: trimmed.length,
        isScanned: false,
      });
    }

    // 2. PDF extraction using unpdf
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let extracted;
    try {
      extracted = await extractText(uint8Array);
    } catch (parseError) {
      console.error("PDF extraction error:", parseError);
      return NextResponse.json<ExtractTextResponse>(
        {
          success: false,
          text: "",
          totalPages: 0,
          charCount: 0,
          error: "Could not read this PDF. It may be password-protected or corrupted.",
        },
        { status: 422 }
      );
    }

    const pages = extracted.text || [];
    const totalPages = extracted.totalPages || pages.length || 1;

    // Join pages with clean page markers
    const joinedText = pages
      .map((pageText, index) => {
        const clean = pageText.trim();
        return clean.length > 0 ? `--- Page ${index + 1} ---\n${clean}` : "";
      })
      .filter(Boolean)
      .join("\n\n");

    const charCount = joinedText.length;
    const isScanned = charCount < 30; // Scanned PDFs without OCR have little to no text layer

    return NextResponse.json<ExtractTextResponse>({
      success: true,
      text: joinedText,
      totalPages,
      charCount,
      isScanned,
      warning: isScanned
        ? "No readable text layer was detected. This PDF may contain scanned images or handwritten notes that require OCR."
        : undefined,
    });
  } catch (error) {
    console.error("Server extract-text error:", error);
    return NextResponse.json<ExtractTextResponse>(
      {
        success: false,
        text: "",
        totalPages: 0,
        charCount: 0,
        error: "Failed to extract text from document. Please try a different file.",
      },
      { status: 500 }
    );
  }
}
