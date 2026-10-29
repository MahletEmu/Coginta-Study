import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim().startsWith("AIzaSy")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Gemini API Key format. Google AI Studio keys typically start with 'AIzaSy'.",
        },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();

    // 1. Update runtime environment variable
    process.env.GEMINI_API_KEY = trimmedKey;

    // 2. Persist to .env.local file in project root
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
      if (envContent.includes("GEMINI_API_KEY=")) {
        envContent = envContent.replace(
          /GEMINI_API_KEY=.*/g,
          `GEMINI_API_KEY=${trimmedKey}`
        );
      } else {
        envContent += `\nGEMINI_API_KEY=${trimmedKey}\n`;
      }
    } else {
      envContent = `# Cognita AI Study Assistant - Local Environment Variables\nGEMINI_API_KEY=${trimmedKey}\nGEMINI_MODEL=gemini-2.5-flash\n`;
    }

    fs.writeFileSync(envPath, envContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Gemini API Key successfully saved and activated!",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save API key.",
      },
      { status: 500 }
    );
  }
}
