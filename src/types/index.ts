/**
 * Core domain types for AI Study Assistant
 */

export type Priority = "low" | "medium" | "high";

export type Subject =
  | "Biology"
  | "Computer Science"
  | "Chemistry"
  | "Mathematics"
  | "Physics"
  | "General";

export interface StudyTask {
  id: string;
  title: string;
  subject: Subject;
  dueDate: string;
  priority: Priority;
  completed: boolean;
  estimatedMinutes: number;
  notes?: string;
  createdAt: string;
}

export type MaterialStatus = "ready" | "processing" | "indexing" | "error";

export interface StudyMaterial {
  id: string;
  title: string;
  subject: Subject;
  fileType: "pdf" | "docx" | "markdown" | "txt";
  fileSize: number; // in bytes
  pageCount?: number;
  uploadedAt: string;
  status: MaterialStatus;
  summaryPreview?: string;
  keyTopics?: string[];
  isDemo?: boolean;
  sampleContent?: string;
  storagePath?: string;
  userId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: Subject;
  description: string;
  questions: QuizQuestion[];
  timeLimitMinutes?: number;
  createdAt: string;
  isDemo?: boolean;
}

export interface QuizAttempt {
  quizId: string;
  userAnswers: Record<string, number>; // questionId -> selectedIndex
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  referencedMaterialId?: string;
  suggestedFollowUps?: string[];
  isDemo?: boolean;
  groundedInDocument?: boolean;
  materialTitle?: string;
  isError?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  major?: string;
  createdAt?: string;
}

export interface UserStats {
  totalHoursStudied: number;
  materialsCount: number;
  quizzesCompleted: number;
  retentionRate: number; // percentage 0-100
  studyStreakDays: number;
}

export interface ActivityItem {
  id: string;
  type: "quiz" | "material" | "task" | "chat";
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
}

export interface SubjectMastery {
  subject: Subject;
  progress: number; // 0 - 100
  tasksCompleted: number;
  quizzesPassed: number;
  color: string;
}
