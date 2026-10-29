import { NextResponse } from "next/server";
import { isGeminiConfigured, getGeminiModelName } from "@/lib/gemini-server";
import { AIStatusResponse } from "@/types/ai";

export async function GET() {
  const status: AIStatusResponse = {
    isConfigured: isGeminiConfigured(),
    model: getGeminiModelName(),
    provider: "Google Gemini",
  };

  return NextResponse.json(status);
}
