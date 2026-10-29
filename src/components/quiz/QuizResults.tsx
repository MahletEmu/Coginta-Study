"use client";

import React, { useState } from "react";
import { Quiz } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle, RotateCcw, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface QuizResultsProps {
  quiz: Quiz;
  userAnswers: Record<string, number>;
  onRetake: () => void;
  onSelectAnother: () => void;
}

export function QuizResults({
  quiz,
  userAnswers,
  onRetake,
  onSelectAnother,
}: QuizResultsProps) {
  const { t, language } = useLanguage();
  const [showDetailedReview, setShowDetailedReview] = useState(true);

  // Calculate score
  let correctCount = 0;
  quiz.questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  const getFeedbackMessage = (pct: number) => {
    if (language === "am") {
      if (pct === 100) return { title: "አስደናቂ ውጤት!", desc: "ሁሉንም ጥያቄዎች በትክክል መልሰሃል።" };
      if (pct >= 80) return { title: "በጣም ጥሩ ውጤት!", desc: "ጽንሰ-ሀሳቡን በሚገባ ተረድተሃል።" };
      if (pct >= 60) return { title: "ጥሩ ጅምር!", desc: "ጥሩ መሰረት አለህ፤ ጥቂት ማስታወሻዎችን ደግመህ ብታይ ይረዳሃል።" };
      return { title: "ተጨማሪ ንባብ ያስፈልጋል", desc: "እንደገና ከመሞከርህ በፊት ማስታወሻህን ደግመህ አንብብ።" };
    }
    if (pct === 100) return { title: "Outstanding Mastery!", desc: "You answered every question correctly." };
    if (pct >= 80) return { title: "Great Job!", desc: "Solid conceptual grasp. Review minor gaps below." };
    if (pct >= 60) return { title: "Good Foundation", desc: "You have basic familiarity. Re-reading will boost recall." };
    return { title: "Needs Revision", desc: "Review the source notes before trying again." };
  };

  const feedback = getFeedbackMessage(percentage);

  return (
    <div className="space-y-6">
      {/* Score Summary Card */}
      <Card className="text-center p-6 sm:p-8 bg-gradient-to-b from-white to-violet-50/30">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3 shadow-xs">
          <Award className="h-7 w-7" />
        </div>

        <Badge variant="violet" size="md" className="mb-2">
          {quiz.subject}
        </Badge>

        <h3 className="text-xl font-bold text-slate-900">
          {feedback.title}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
          {feedback.desc}
        </p>

        <div className="flex items-center justify-center gap-6 my-5 py-3 border-y border-stone-200/80 max-w-xs mx-auto">
          <div>
            <p className="text-3xl font-extrabold text-violet-600">{percentage}%</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              {t("quiz.score")}
            </p>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              {correctCount}/{quiz.questions.length}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              {t("quiz.correct")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onRetake} variant="primary" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>{t("quiz.retake")}</span>
          </Button>
          <Button onClick={onSelectAnother} variant="outline" size="sm">
            <span>{t("quiz.chooseAnother")}</span>
          </Button>
        </div>
      </Card>

      {/* Detailed Breakdown Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">
          {t("quiz.reviewTitle")}
        </h4>
        <button
          onClick={() => setShowDetailedReview(!showDetailedReview)}
          className="text-xs text-violet-700 hover:text-violet-900 font-medium flex items-center gap-1 cursor-pointer"
        >
          {showDetailedReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Question Review List */}
      {showDetailedReview && (
        <div className="space-y-3.5">
          {quiz.questions.map((question, idx) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswerIndex;

            return (
              <Card key={question.id} className="overflow-hidden">
                <div
                  className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-semibold ${
                    isCorrect
                      ? "bg-emerald-50/70 text-emerald-800 border-emerald-100"
                      : "bg-rose-50/70 text-rose-800 border-rose-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600" />
                    )}
                    <span>
                      {t("quiz.question")} {idx + 1}: {isCorrect ? t("quiz.correct") : (language === "am" ? "ስህተት" : "Incorrect")}
                    </span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500">
                    {question.topic}
                  </span>
                </div>

                <CardContent className="p-4 space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-slate-900">
                    {question.question}
                  </p>

                  <div className="space-y-1.5">
                    {question.options.map((option, optIdx) => {
                      const isUserChoice = userAnswer === optIdx;
                      const isCorrectChoice = optIdx === question.correctAnswerIndex;

                      let stateClass = "border-stone-200 bg-stone-50/40 text-slate-700";
                      if (isCorrectChoice) {
                        stateClass = "border-emerald-300 bg-emerald-50 text-emerald-900 font-medium";
                      } else if (isUserChoice && !isCorrect) {
                        stateClass = "border-rose-300 bg-rose-50 text-rose-900";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${stateClass}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px]">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                            {isCorrectChoice && (
                              <span className="font-semibold text-emerald-700">
                                ✓ {t("quiz.correctAnswer")}
                              </span>
                            )}
                            {isUserChoice && !isCorrectChoice && (
                              <span className="font-semibold text-rose-700">
                                ✗ {t("quiz.yourAnswer")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Callout */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                    <p className="text-slate-600 leading-relaxed">
                      💡 {question.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
