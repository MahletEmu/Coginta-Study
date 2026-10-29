import { NextRequest, NextResponse } from "next/server";
import {
  getGeminiClient,
  getGeminiModelName,
  isGeminiConfigured,
  sanitizeGeminiError,
  GeminiConfigError,
} from "@/lib/gemini-server";
import { generateAutonomousSummary } from "@/lib/autonomous-study-engine";
import { AISummarizeRequest, AISummarizeResponse } from "@/types/ai";

export async function POST(req: NextRequest) {
  let requestData: AISummarizeRequest | null = null;
  try {
    const body = (await req.json()) as AISummarizeRequest;
    requestData = body;
    const { title, text, subject, language = "en" } = body;

    if (!title || !text || text.trim().length < 30) {
      return NextResponse.json<AISummarizeResponse>(
        {
          success: false,
          overview: "",
          sections: [],
          keyDefinitions: [],
          takeaways: [],
          error: "Document text is too short or empty to summarize.",
        },
        { status: 400 }
      );
    }

    if (!isGeminiConfigured()) {
      const autonomousSummary = generateAutonomousSummary({
        title,
        text,
        subject,
        language: language as "en" | "am",
      });
      return NextResponse.json<AISummarizeResponse>(autonomousSummary);
    }

    const ai = getGeminiClient();
    const model = getGeminiModelName();

    // Limit text to ~60,000 characters to maintain low latency and stay well within limits
    const safeText = text.slice(0, 60000);

    const prompt = `You are Cognita's academic text summarizer for university and high school students.
Summarize the following study document: "${title}" (Subject: ${subject || "General"}).

Document Content:
"""
${safeText}
"""

Language requirement: ${language === "am" ? "Respond in Amharic (አማርኛ)" : "Respond in English"}.

You MUST return a valid JSON object matching this exact structure:
{
  "overview": "A concise 2-3 sentence executive summary explaining what this document is about and its main academic purpose.",
  "sections": [
    {
      "title": "Major Concept 1 Name",
      "content": [
        "Key point A explaining this concept clearly",
        "Key point B with practical detail or formula"
      ]
    },
    {
      "title": "Major Concept 2 Name",
      "content": [
        "Key point A",
        "Key point B"
      ]
    }
  ],
  "keyDefinitions": [
    {
      "term": "Key Term 1",
      "definition": "Clear concise definition or explanation"
    },
    {
      "term": "Key Term 2",
      "definition": "Clear concise definition"
    }
  ],
  "takeaways": [
    "High-priority takeaway 1 for exam revision",
    "High-priority takeaway 2",
    "High-priority takeaway 3"
  ]
}

Return ONLY the raw JSON object. Do not wrap in markdown quotes.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = response.text || "";

    // Clean any markdown code blocks if returned
    const cleanJson = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanJson);

      return NextResponse.json<AISummarizeResponse>({
        success: true,
        overview: parsed.overview || "Document summary generated successfully.",
        sections: Array.isArray(parsed.sections) ? parsed.sections : [],
        keyDefinitions: Array.isArray(parsed.keyDefinitions) ? parsed.keyDefinitions : [],
        takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways : [],
        rawMarkdown: responseText,
      });
    } catch {
      // Fallback if model returned formatted markdown instead of strict JSON
      return NextResponse.json<AISummarizeResponse>({
        success: true,
        overview: responseText.slice(0, 300) + "...",
        sections: [
          {
            title: language === "am" ? "ዋና ዋና ነጥቦች" : "Key Concepts",
            content: [responseText],
          },
        ],
        keyDefinitions: [],
        takeaways: [],
        rawMarkdown: responseText,
      });
    }
  } catch (error) {
    if (error instanceof GeminiConfigError) {
      return NextResponse.json<AISummarizeResponse>(
        {
          success: false,
          overview: "",
          sections: [],
          keyDefinitions: [],
          takeaways: [],
          requiresApiKey: true,
          error: error.message,
        },
        { status: 503 }
      );
    }

    console.error("AI Summarize API Error:", error);
    const sanitized = sanitizeGeminiError(error);

    return NextResponse.json<AISummarizeResponse>(
      {
        success: false,
        overview: "",
        sections: [],
        keyDefinitions: [],
        takeaways: [],
        error: sanitized,
      },
      { status: 500 }
    );
  }
}
