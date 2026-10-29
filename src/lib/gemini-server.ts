import { GoogleGenAI } from "@google/genai";

/**
 * Server-only helper for Google Gemini API communication.
 *
 * Security & Reliability Rules:
 * 1. process.env.GEMINI_API_KEY is read strictly on the server; NEVER expose via NEXT_PUBLIC.
 * 2. If the API key is missing, throws a typed GeminiConfigError so endpoints can return
 *    clear setup instructions without crashing.
 * 3. Never leaks API keys, system paths, or raw provider tokens in errors or logs.
 */

export class GeminiConfigError extends Error {
  constructor(message = "GEMINI_API_KEY is not configured on the server.") {
    super(message);
    this.name = "GeminiConfigError";
  }
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes("your_gemini_api_key"));
}

export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim() || apiKey.includes("your_gemini_api_key")) {
    throw new GeminiConfigError();
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  return cachedClient;
}

/**
 * Sanitizes errors so provider secrets or internal connection tokens are never exposed.
 */
export function sanitizeGeminiError(error: unknown): string {
  if (error instanceof GeminiConfigError) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const errObj = error as { status?: number; message?: string; code?: string };

    if (errObj.status === 429 || (errObj.message && errObj.message.includes("429"))) {
      return "Gemini API rate limit exceeded. Please wait a few moments before sending another request.";
    }

    if (errObj.status === 403 || errObj.status === 401) {
      return "Invalid or unauthorized Gemini API key. Please check your GEMINI_API_KEY in .env.local.";
    }

    if (errObj.message && typeof errObj.message === "string") {
      // Strip any potential apiKey strings or URLs from the message
      const sanitized = errObj.message
        .replace(/key=[a-zA-Z0-9_\-]+/gi, "key=***")
        .replace(/apiKey=[a-zA-Z0-9_\-]+/gi, "apiKey=***");
      return sanitized;
    }
  }

  return "An unexpected error occurred while communicating with the AI provider. Please try again.";
}
