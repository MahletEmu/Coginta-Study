/**
 * Type definitions for Stage 3: Real AI Integration
 */

export interface AIStatusResponse {
  isConfigured: boolean;
  model: string;
  provider: "Google Gemini";
}

export interface ExtractTextResponse {
  success: boolean;
  text: string;
  totalPages: number;
  charCount: number;
  isScanned?: boolean;
  warning?: string;
  error?: string;
}

export interface ChatMessagePart {
  text: string;
}

export interface ChatHistoryItem {
  role: "user" | "model";
  parts: ChatMessagePart[];
}

export interface AIChatRequest {
  message: string;
  materialId?: string;
  materialTitle?: string;
  contextText?: string;
  history?: ChatHistoryItem[];
  language?: "en" | "am";
}

export interface AIChatResponse {
  success: boolean;
  reply: string;
  groundedInDocument: boolean;
  retrievedChunksCount?: number;
  materialTitle?: string;
  suggestedFollowUps?: string[];
  error?: string;
  requiresApiKey?: boolean;
}

export interface AISummarizeRequest {
  title: string;
  text: string;
  subject?: string;
  language?: "en" | "am";
}

export interface AISummarySection {
  title: string;
  content: string[];
}

export interface AISummarizeResponse {
  success: boolean;
  overview: string;
  sections: AISummarySection[];
  keyDefinitions: { term: string; definition: string }[];
  takeaways: string[];
  rawMarkdown?: string;
  error?: string;
  requiresApiKey?: boolean;
}

export interface AIQuizRequest {
  title: string;
  text: string;
  subject?: string;
  questionCount?: number;
  difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
  language?: "en" | "am";
}

export interface AIQuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string]; // exactly 4 options
  correctAnswerIndex: number; // 0 to 3
  explanation: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface AIQuizResponse {
  success: boolean;
  title: string;
  subject: string;
  questions: AIQuizQuestion[];
  error?: string;
  requiresApiKey?: boolean;
}
