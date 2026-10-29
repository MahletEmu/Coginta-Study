"use client";

import React, { useState } from "react";
import { Quiz } from "@/types";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (userAnswers: Record<string, number>) => void;
  onExit: () => void;
}

export function QuizPlayer({ quiz, onComplete, onExit }: QuizPlayerProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const currentSelection = selectedAnswers[currentQuestion.id];
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(selectedAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasSelected = currentSelection !== undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Progress bar and Question Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <button
          onClick={onExit}
          className="hover:text-slate-800 underline underline-offset-4 cursor-pointer"
        >
          ← {t("quiz.exit")}
        </button>

        <div className="flex items-center gap-2">
          <span>
            {t("quiz.question")} <strong className="text-slate-900">{currentIndex + 1}</strong> {t("quiz.of")} {totalQuestions}
          </span>
          <span className="text-stone-300">•</span>
          <span>{progressPercent}% {t("quiz.complete")}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-violet-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-stone-100 flex items-center justify-between">
          <Badge variant="violet" size="sm">
            {quiz.subject}
          </Badge>
          <span className="text-xs text-slate-400 font-medium">
            {currentQuestion.topic}
          </span>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = currentSelection === optIdx;
              const letter = String.fromCharCode(65 + optIdx);

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? "border-violet-600 bg-violet-50/70 text-violet-950 font-medium ring-1 ring-violet-600"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                        isSelected
                          ? "bg-violet-600 text-white"
                          : "bg-stone-100 text-slate-500 group-hover:bg-stone-200"
                      }`}
                    >
                      {letter}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="py-3.5 px-5 bg-stone-50/50 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t("quiz.previous")}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            disabled={!hasSelected}
            className="gap-1.5"
          >
            <span>{isLastQuestion ? t("quiz.submit") : t("quiz.next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
