import { NextRequest, NextResponse } from "next/server";
import {
  getGeminiClient,
  getGeminiModelName,
  isGeminiConfigured,
  sanitizeGeminiError,
  GeminiConfigError,
} from "@/lib/gemini-server";
import { chunkDocument, retrieveRelevantChunks } from "@/lib/document-retrieval";
import { generateAutonomousChatAnswer } from "@/lib/autonomous-study-engine";
import { AIChatRequest, AIChatResponse } from "@/types/ai";

export async function POST(req: NextRequest) {
  let requestBody: AIChatRequest | null = null;
  try {
    requestBody = (await req.json()) as AIChatRequest;
    const { message, materialTitle, contextText, history, language = "en" } = requestBody;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json<AIChatResponse>(
        {
          success: false,
          reply: "",
          groundedInDocument: false,
          error: "Message is required and cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (message.length > 2500) {
      return NextResponse.json<AIChatResponse>(
        {
          success: false,
          reply: "",
          groundedInDocument: false,
          error: "Message exceeds the maximum limit of 2,500 characters.",
        },
        { status: 400 }
      );
    }

    // If Gemini API is not configured, directly answer using the Autonomous Grounded Study Engine!
    if (!isGeminiConfigured()) {
      const autonomousAnswer = generateAutonomousChatAnswer({
        message,
        contextText,
        materialTitle,
        language: language as "en" | "am",
      });
      return NextResponse.json<AIChatResponse>(autonomousAnswer);
    }

    const ai = getGeminiClient();
    const model = getGeminiModelName();

    let groundedContext = "";
    let retrievedChunksCount = 0;
    let hasContext = false;

    // Run smart chunking & retrieval if document context is provided
    if (contextText && contextText.trim().length > 0) {
      const chunks = chunkDocument(contextText);
      const retrieval = retrieveRelevantChunks(message, chunks, 4);

      groundedContext = retrieval.combinedContext;
      retrievedChunksCount = retrieval.relevantChunks.length;
      hasContext = retrieval.hasSufficientContext;
    }

    // Build grounded prompt with ChatGPT-grade pedagogical instructions
    const systemPrompt = `You are Cognita, a world-class university professor and academic tutor similar to ChatGPT Plus at its best.
Your mission is to help university and high school students deeply understand, conceptualize, and master their academic subjects.

PEDAGOGICAL & WRITING STYLE GUIDELINES (CRITICAL):
1. Adopt the engaging, warm, articulate, and intuitive voice of ChatGPT.
2. NEVER output raw, dry bullet dumps or terse single-sentence lists. Students find raw lists dry and hard to retain.
3. Instead, provide in-depth, rich, multi-paragraph conceptual explanations:
   - **Engaging Opening:** Welcome the topic, setting the big picture and intuition of why this concept matters.
   - **Analogies & Mental Models:** Use relatable real-world analogies (e.g. bioenergetics as an electrical power plant, graphs as flight networks, reactions as partner swaps) so abstract ideas make immediate sense.
   - **Step-by-Step Mechanisms:** Walk through the underlying logic, stages, or chemical/mathematical pathways in fluid, connected paragraphs with bolded transitions and terms.
   - **Deep Contextual Definitions:** When introducing key terms, don't just give a 1-line dictionary phrase; define what it is, its biological/mathematical function, and why it is critical.
   - **Exam Pitfalls & High-Yield Traps:** Highlight what students frequently confuse on university exams.
   - **Interactive Wrap-up:** End with an encouraging check-for-understanding question or an offer to explore a specific sub-topic further.
4. Language Requirement:
   - If language is "am" (Amharic): Respond in natural, articulate, highly educated academic Amharic (አማርኛ), keeping key English technical terms in parentheses for student reference (e.g., "ሴሉላር ሬስፒሬሽን (Cellular Respiration)").
   - If language is "en" (English): Respond in polished, engaging, articulate academic English.

RULES FOR GROUNDING IN STUDY MATERIALS:
${
  materialTitle && groundedContext
    ? `The student has selected their study document: "${materialTitle}".
Here are the most relevant excerpts retrieved from their document:
"""
${groundedContext}
"""

GROUNDING INSTRUCTIONS:
1. Ground your explanation deeply in the above document excerpts, citing concepts and terminology directly from the student's material.
2. If the excerpts DO NOT contain enough information to answer the question, you MUST start your reply by stating:
   ${
     language === "am"
       ? `"[ማስታወሻ፦ የተመረጠው ማቴሪያል ('${materialTitle}') ለዚህ ጥያቄ በቂ መረጃ አልያዘም።]"`
       : `"[Note: The selected document ('${materialTitle}') does not contain sufficient details to answer this question directly.]"`
   }
   Then, provide an in-depth ChatGPT-style explanation using your general academic knowledge under the header:
   "### ${language === "am" ? "አጠቃላይ የትምህርት ማብራሪያ" : "General Academic Explanation"}:"
3. Clearly distinguish facts that come directly from the document from broader pedagogical background.`
    : `No specific study document is selected. Provide an in-depth, pedagogical ChatGPT-style tutorial using general academic knowledge.`
}`;

    // Construct conversation turns for Gemini
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // System prompt as initial model context
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });
    contents.push({
      role: "model",
      parts: [
        {
          text:
            language === "am"
              ? "ገባኝ። የተማሪውን የጥናት ማቴሪያል መሰረት በማድረግ ግልጽና ትክክለኛ የጥናት ማብራሪያ እሰጣለሁ።"
              : "Understood. I will provide clear, grounded academic explanations based on the student's study materials.",
        },
      ],
    });

    // Append recent history if valid
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.parts?.[0]?.text) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.parts[0].text.slice(0, 1000) }],
          });
        }
      }
    }

    // Append latest student question
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const response = await ai.models.generateContent({
      model,
      contents,
    });

    const reply = response.text || "";

    return NextResponse.json<AIChatResponse>({
      success: true,
      reply,
      groundedInDocument: Boolean(materialTitle && hasContext),
      retrievedChunksCount,
    });
  } catch (error) {
    if (error instanceof GeminiConfigError) {
      return NextResponse.json<AIChatResponse>(
        {
          success: false,
          reply: "",
          groundedInDocument: false,
          requiresApiKey: true,
          error: error.message,
        },
        { status: 503 }
      );
    }

    console.error("AI Chat API Error (falling back to Autonomous Engine):", error);
    if (requestBody && requestBody.message) {
      try {
        const fallback = generateAutonomousChatAnswer({
          message: requestBody.message,
          contextText: requestBody.contextText,
          materialTitle: requestBody.materialTitle,
          language: requestBody.language as "en" | "am",
        });
        return NextResponse.json<AIChatResponse>(fallback);
      } catch {
        // Continue to error return
      }
    }
    const sanitized = sanitizeGeminiError(error);
    return NextResponse.json<AIChatResponse>(
      {
        success: false,
        reply: "",
        groundedInDocument: false,
        error: sanitized,
      },
      { status: 500 }
    );
  }
}
