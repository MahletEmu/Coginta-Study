"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DEMO_QUIZZES, INITIAL_DEMO_MATERIALS } from "@/lib/mock-data";
import { Quiz, StudyMaterial } from "@/types";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getMaterialText } from "@/lib/document-text-service";
import { saveCloudQuiz, saveCloudQuizAttempt } from "@/lib/database-service";
import { useAuth } from "@/context/AuthContext";
import { AIQuizResponse } from "@/types/ai";
import {
  Clock,
  Play,
  HelpCircle,
  Sparkles,
  BookOpen,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function QuizPageContent() {
  const searchParams = useSearchParams();
  const initialMaterialId = searchParams.get("materialId");
  const { user, isConfigured } = useAuth();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Medium");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [requiresKey, setRequiresKey] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [completedAnswers, setCompletedAnswers] = useState<Record<string, number> | null>(null);
  const [aiGeneratedQuizzes, setAiGeneratedQuizzes] = useState<Quiz[]>([]);

  const { language, t } = useLanguage();

  // Load materials from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ai_study_materials");
        if (stored) {
          const parsed = JSON.parse(stored) as StudyMaterial[];
          setMaterials(parsed);
          if (initialMaterialId) {
            setSelectedMaterialId(initialMaterialId);
          } else if (parsed.length > 0) {
            setSelectedMaterialId(parsed[0].id);
          }
          return;
        }
      }
    } catch {
      // ignore
    }

    setMaterials(INITIAL_DEMO_MATERIALS);
    if (initialMaterialId) {
      setSelectedMaterialId(initialMaterialId);
    } else if (INITIAL_DEMO_MATERIALS.length > 0) {
      setSelectedMaterialId(INITIAL_DEMO_MATERIALS[0].id);
    }
  }, [initialMaterialId]);

  const handleGenerateAIQuiz = async () => {
    const targetMaterial = materials.find((m) => m.id === selectedMaterialId);
    if (!targetMaterial) {
      setGenerateError(
        language === "am"
          ? "እባክዎ መጀመሪያ ማቴሪያል ይምረጡ።"
          : "Please select a study material to generate questions from."
      );
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setRequiresKey(false);

    try {
      // 1. Get document text
      const extracted = await getMaterialText(targetMaterial);
      if (!extracted.text || extracted.text.trim().length < 50) {
        setGenerateError(
          extracted.error ||
            (language === "am"
              ? "ይህ ማቴሪያል ፈተና ለማመንጨት የሚያስችል በቂ ጽሑፍ አልያዘም።"
              : "This material does not contain enough extractable text to generate a quiz.")
        );
        setIsGenerating(false);
        return;
      }

      // 2. Call server-side /api/ai/quiz
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetMaterial.title,
          text: extracted.text,
          subject: targetMaterial.subject,
          questionCount,
          difficulty,
          language,
        }),
      });

      const data = (await res.json()) as AIQuizResponse;

      if (!res.ok || !data.success) {
        if (data.requiresApiKey) {
          setRequiresKey(true);
        }
        setGenerateError(
          data.error ||
            (language === "am"
              ? "የ AI ፈተናውን ማመንጨት አልተቻለም።"
              : "Failed to generate AI quiz.")
        );
        return;
      }

      // 3. Convert to Quiz structure
      const newQuiz: Quiz = {
        id: `ai-quiz-${Date.now()}`,
        title: data.title || `${targetMaterial.title} - AI Practice Quiz`,
        subject: targetMaterial.subject,
        description:
          language === "am"
            ? `ከ "${targetMaterial.title}" ማስታወሻ በቀጥታ በ Gemini AI የተዘጋጁ ${data.questions.length} ጥያቄዎች።`
            : `AI-generated active recall quiz grounded in "${targetMaterial.title}" with detailed explanations.`,
        timeLimitMinutes: Math.max(5, data.questions.length * 2),
        createdAt: new Date().toISOString(),
        isDemo: false,
        questions: data.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
          topic: q.topic,
        })),
      };

      // Persist to Supabase if authenticated
      if (user && isConfigured) {
        saveCloudQuiz(newQuiz, user.id).then((savedId) => {
          if (savedId) {
            newQuiz.id = savedId;
          }
        }).catch(() => {});
      }

      setAiGeneratedQuizzes((prev) => [newQuiz, ...prev]);
      // Immediately start the newly generated quiz!
      setSelectedQuiz(newQuiz);
      setCompletedAnswers(null);
    } catch (err) {
      console.error("AI quiz generation error:", err);
      setGenerateError(
        language === "am"
          ? "የግንኙነት ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።"
          : "Network error occurred while communicating with the AI service."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCompletedAnswers(null);
  };

  const handleCompleteQuiz = (answers: Record<string, number>) => {
    setCompletedAnswers(answers);
    if (selectedQuiz && user && isConfigured) {
      let score = 0;
      selectedQuiz.questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswerIndex) {
          score++;
        }
      });
      saveCloudQuizAttempt(
        {
          quizId: selectedQuiz.id,
          userAnswers: answers,
          score,
          totalQuestions: selectedQuiz.questions.length,
          completedAt: new Date().toISOString(),
        },
        user.id
      ).catch(() => {});
    }
  };

  const handleRetake = () => {
    setCompletedAnswers(null);
  };

  const handleSelectAnother = () => {
    setSelectedQuiz(null);
    setCompletedAnswers(null);
  };

  return (
    <div className="space-y-6">
      {/* Screen 1: Active Quiz Player */}
      {selectedQuiz && !completedAnswers && (
        <QuizPlayer
          quiz={selectedQuiz}
          onComplete={handleCompleteQuiz}
          onExit={handleSelectAnother}
        />
      )}

      {/* Screen 2: Quiz Results & Explanations */}
      {selectedQuiz && completedAnswers && (
        <QuizResults
          quiz={selectedQuiz}
          userAnswers={completedAnswers}
          onRetake={handleRetake}
          onSelectAnother={handleSelectAnother}
        />
      )}

      {/* Screen 3: Quiz Selection & AI Generator (Initial State) */}
      {!selectedQuiz && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t("quiz.title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {language === "am"
                  ? "ያነበቡትን እንዳይረሱ በ AI በተዘጋጁ ወይም በናሙና ፈተናዎች ራስዎን ይፈትኑ።"
                  : "Practice active recall with grounded AI quizzes generated from your study documents."}
              </p>
            </div>
          </div>

          {/* AI Quiz Generator Card */}
          <Card className="p-4 sm:p-5 bg-gradient-to-br from-violet-50/70 to-white border-violet-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-violet-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600 text-white shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {language === "am"
                      ? "በ AI ፈተና አፍልቅ (AI Quiz Generator)"
                      : "Generate AI Quiz with Gemini"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === "am"
                      ? "ማቴሪያልዎን ይምረጡ፤ AIው ከይዘቱ ላይ ፈተና ከነማብራሪያው ያዘጋጃል።"
                      : "Select a document to automatically generate questions grounded in its concepts."}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-violet-700 bg-white border border-violet-200 px-2.5 py-1 rounded-full self-start sm:self-center shadow-2xs">
                Gemini 2.5 Flash
              </span>
            </div>

            {/* Generator Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Document Selector */}
              <div className="sm:col-span-1 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === "am" ? "የጥናት ማቴሪያል ምረጥ" : "Select Study Material"}
                </label>
                <div className="relative">
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    disabled={isGenerating}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-900 truncate"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === "am" ? "የጥያቄዎች ብዛት" : "Question Count"}
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-900"
                >
                  <option value={3}>3 {language === "am" ? "ጥያቄዎች (ፈጣን)" : "Questions (Quick)"}</option>
                  <option value={5}>5 {language === "am" ? "ጥያቄዎች (መደበኛ)" : "Questions (Standard)"}</option>
                  <option value={8}>8 {language === "am" ? "ጥያቄዎች (ጥልቅ)" : "Questions (Deep Revision)"}</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === "am" ? "የከበደነት ደረጃ" : "Difficulty Level"}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as "Easy" | "Medium" | "Hard" | "Mixed")
                  }
                  disabled={isGenerating}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-900"
                >
                  <option value="Mixed">{language === "am" ? "የተደባለቀ (Mixed)" : "Mixed Difficulty"}</option>
                  <option value="Easy">{language === "am" ? "ቀላል (Easy)" : "Easy"}</option>
                  <option value="Medium">{language === "am" ? "መካከለኛ (Medium)" : "Medium"}</option>
                  <option value="Hard">{language === "am" ? "ከባድ (Hard)" : "Hard"}</option>
                </select>
              </div>
            </div>

            {/* Error or Missing Key Banner */}
            {generateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{generateError}</span>
                </div>
                {requiresKey && (
                  <p className="pl-6 text-[11px] text-rose-700">
                    {language === "am"
                      ? "የ Gemini API ቁልፍ በ .env.local ፋይል ውስጥ GEMINI_API_KEY=your_key ተብሎ መመዝገብ አለበት።"
                      : "Please add GEMINI_API_KEY to your .env.local file to enable live AI quiz generation."}
                  </p>
                )}
              </div>
            )}

            {/* Generate Action Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {language === "am"
                  ? "ጥያቄዎች ከመልሶቻቸው ማብራሪያ ጋር አብረው ይዘጋጃሉ።"
                  : "Questions include step-by-step explanations for wrong and right choices."}
              </span>

              <Button
                onClick={handleGenerateAIQuiz}
                disabled={isGenerating || materials.length === 0}
                isLoading={isGenerating}
                className="gap-2"
                size="sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {isGenerating
                    ? language === "am"
                      ? "ፈተናውን በማመንጨት ላይ..."
                      : "Generating AI Quiz..."
                    : language === "am"
                    ? "የ AI ፈተና አፍልቅ"
                    : "Generate AI Quiz"}
                </span>
              </Button>
            </div>
          </Card>

          {/* Section: Recently Generated AI Quizzes */}
          {aiGeneratedQuizzes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                <span>
                  {language === "am"
                    ? "በቅርቡ በ AI የተዘጋጁ ፈተናዎች"
                    : "Recently Generated AI Quizzes"}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiGeneratedQuizzes.map((quiz) => (
                  <Card key={quiz.id} hoverEffect className="flex flex-col justify-between border-violet-200/80">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="violet">{quiz.subject}</Badge>
                        <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                          AI Generated
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{quiz.timeLimitMinutes} {t("quiz.min")}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 py-2">
                      <CardTitle className="text-base text-slate-900">
                        {quiz.title}
                      </CardTitle>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {quiz.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
                        <HelpCircle className="h-3.5 w-3.5 text-violet-600" />
                        <span>{quiz.questions.length} {t("quiz.questions")}</span>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-1">
                      <Button
                        onClick={() => handleStartQuiz(quiz)}
                        className="w-full gap-2"
                        size="sm"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{t("quiz.start")}</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Section: Curated Demo Quizzes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {language === "am"
                  ? "የተዘጋጁ የናሙና ፈተናዎች (Sample Demo Quizzes)"
                  : "Curated Sample Demo Quizzes"}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_QUIZZES.map((quiz) => (
                <Card
                  key={quiz.id}
                  hoverEffect
                  className="flex flex-col justify-between"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{quiz.subject}</Badge>
                      <span className="text-[10px] font-semibold text-slate-500 bg-stone-100 px-2 py-0.5 rounded-full">
                        Demo
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{quiz.timeLimitMinutes} {t("quiz.min")}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 py-2">
                    <CardTitle className="text-base text-slate-900">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {quiz.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
                      <HelpCircle className="h-3.5 w-3.5 text-violet-600" />
                      <span>{quiz.questions.length} {t("quiz.questions")}</span>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-1">
                    <Button
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{t("quiz.start")}</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-slate-400">
          Loading quiz modules...
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
