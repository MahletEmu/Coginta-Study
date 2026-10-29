import { NextRequest, NextResponse } from "next/server";
import {
  getGeminiClient,
  getGeminiModelName,
  isGeminiConfigured,
  sanitizeGeminiError,
  GeminiConfigError,
} from "@/lib/gemini-server";
import { generateAutonomousQuiz } from "@/lib/autonomous-study-engine";
import { AIQuizRequest, AIQuizResponse, AIQuizQuestion } from "@/types/ai";

export async function POST(req: NextRequest) {
  let requestData: AIQuizRequest | null = null;
  try {
    const body = (await req.json()) as AIQuizRequest;
    requestData = body;
    const {
      title,
      text,
      subject = "General",
      questionCount = 5,
      difficulty = "Mixed",
      language = "en",
    } = body;

    if (!text || text.trim().length < 50) {
      return NextResponse.json<AIQuizResponse>(
        {
          success: false,
          title: title || "Quiz",
          subject,
          questions: [],
          error: "Document text is too short to generate a meaningful quiz.",
        },
        { status: 400 }
      );
    }

    if (!isGeminiConfigured()) {
      const autonomousQuiz = generateAutonomousQuiz({
        title,
        text,
        subject,
        questionCount,
        difficulty,
        language: language as "en" | "am",
      });
      return NextResponse.json<AIQuizResponse>(autonomousQuiz);
    }

    const ai = getGeminiClient();
    const model = getGeminiModelName();

    const count = Math.max(3, Math.min(10, questionCount));
    const safeText = text.slice(0, 50000);

    const prompt = `You are an expert university professor and exam creator.
Generate an active recall multiple-choice study quiz based STRICTLY on the provided study document: "${title}" (Subject: ${subject}).

Document Content:
"""
${safeText}
"""

QUIZ SPECIFICATIONS:
- Number of questions: exactly ${count}
- Difficulty level: ${difficulty}
- Language requirement: ${language === "am" ? "Write in Amharic (አማርኛ)" : "Write in English"}

RULES FOR QUESTIONS:
1. Every question must test a real concept, pathway, definition, or analytical deduction from the document.
2. Each question MUST have exactly 4 choices (options).
3. Exactly ONE choice must be correct, designated by 'correctAnswerIndex' (an integer from 0 to 3).
4. Provide a detailed, pedagogically helpful 'explanation' stating why the correct choice is true and citing concepts from the text.
5. Provide a specific 'topic' tag and 'difficulty' ("Easy", "Medium", or "Hard").

You MUST return a valid JSON object matching this schema:
{
  "title": "${title} - AI Quiz",
  "subject": "${subject}",
  "questions": [
    {
      "id": "q1",
      "question": "Clear, precise question stem?",
      "options": [
        "Choice A",
        "Choice B",
        "Choice C",
        "Choice D"
      ],
      "correctAnswerIndex": 0,
      "explanation": "Clear explanation of why this answer is correct based on the text.",
      "topic": "Core Topic Name",
      "difficulty": "Medium"
    }
  ]
}

Return ONLY the raw JSON object. Do not include markdown code block backticks.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = response.text || "";

    const cleanJson = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanJson);

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("AI did not return a valid list of questions.");
    }

    // Validate and sanitize every question
    const validatedQuestions: AIQuizQuestion[] = parsed.questions
      .slice(0, count)
      .map((q: Partial<AIQuizQuestion>, idx: number) => {
        const options = Array.isArray(q.options) && q.options.length === 4
          ? (q.options.map((opt) => String(opt || "").trim()) as [string, string, string, string])
          : [
              "Option A",
              "Option B",
              "Option C",
              "Option D",
            ] as [string, string, string, string];

        const rawIndex = Number(q.correctAnswerIndex);
        const correctAnswerIndex =
          !isNaN(rawIndex) && rawIndex >= 0 && rawIndex <= 3 ? rawIndex : 0;

        return {
          id: `ai-q-${idx + 1}-${Date.now()}`,
          question: String(q.question || `Question ${idx + 1}`).trim(),
          options,
          correctAnswerIndex,
          explanation: String(q.explanation || "Correct based on study document.").trim(),
          topic: String(q.topic || subject).trim(),
          difficulty:
            q.difficulty === "Easy" || q.difficulty === "Medium" || q.difficulty === "Hard"
              ? q.difficulty
              : "Medium",
        };
      });

    return NextResponse.json<AIQuizResponse>({
      success: true,
      title: parsed.title || `${title} - AI Quiz`,
      subject: parsed.subject || subject,
      questions: validatedQuestions,
    });
  } catch (error) {
    if (error instanceof GeminiConfigError) {
      return NextResponse.json<AIQuizResponse>(
        {
          success: false,
          title: "Quiz",
          subject: "General",
          questions: [],
          requiresApiKey: true,
          error: error.message,
        },
        { status: 503 }
      );
    }

    console.error("AI Quiz API Error:", error);
    const sanitized = sanitizeGeminiError(error);

    return NextResponse.json<AIQuizResponse>(
      {
        success: false,
        title: "Quiz",
        subject: "General",
        questions: [],
        error: sanitized,
      },
      { status: 500 }
    );
  }
}
