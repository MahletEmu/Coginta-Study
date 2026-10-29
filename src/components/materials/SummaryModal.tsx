"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StudyMaterial } from "@/types";
import { getMaterialText } from "@/lib/document-text-service";
import { saveCloudSummary } from "@/lib/database-service";
import { useAuth } from "@/context/AuthContext";
import { AISummarizeResponse } from "@/types/ai";
import {
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  KeyRound,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: StudyMaterial | null;
}

export function SummaryModal({ isOpen, onClose, material }: SummaryModalProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isConfigured } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresKey, setRequiresKey] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummarizeResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    if (!material) return;

    setIsLoading(true);
    setError(null);
    setRequiresKey(false);

    try {
      // 1. Extract or retrieve text
      const extracted = await getMaterialText(material);
      if (!extracted.text || extracted.text.trim().length < 30) {
        setError(
          extracted.error ||
            (language === "am"
              ? "ይህ ፋይል በቂ ሊነበብ የሚችል ጽሑፍ አልያዘም።"
              : "This document does not contain enough extractable text to summarize.")
        );
        setIsLoading(false);
        return;
      }

      // 2. Call server-side /api/ai/summarize
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: material.title,
          text: extracted.text,
          subject: material.subject,
          language,
        }),
      });

      const data = (await res.json()) as AISummarizeResponse;

      if (!res.ok || !data.success) {
        if (data.requiresApiKey) {
          setRequiresKey(true);
        }
        setError(
          data.error ||
            (language === "am"
              ? "የማጠቃለያ ሂደቱ አልተሳካም።"
              : "Failed to generate document summary.")
        );
        return;
      }

      setSummaryData(data);

      // Persist to Supabase if authenticated
      if (user && isConfigured) {
        saveCloudSummary(
          data,
          material.id,
          material.title,
          material.subject,
          user.id,
          language
        ).catch(() => {});
      }
    } catch (err) {
      console.error("Summary error:", err);
      setError(
        language === "am"
          ? "የግንኙነት ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።"
          : "Network error occurred while generating summary."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && material) {
      setSummaryData(null);
      generateSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, material]);

  if (!material) return null;

  const handleCopy = () => {
    if (!summaryData) return;

    let textToCopy = `ACADEMIC SUMMARY: ${material.title}\nSubject: ${material.subject}\n\nOVERVIEW:\n${summaryData.overview}\n\n`;

    if (summaryData.sections.length > 0) {
      textToCopy += `KEY CONCEPTS:\n`;
      summaryData.sections.forEach((sec) => {
        textToCopy += `• ${sec.title}:\n`;
        sec.content.forEach((pt) => {
          textToCopy += `   - ${pt}\n`;
        });
      });
      textToCopy += `\n`;
    }

    if (summaryData.keyDefinitions.length > 0) {
      textToCopy += `DEFINITIONS:\n`;
      summaryData.keyDefinitions.forEach((d) => {
        textToCopy += `• ${d.term}: ${d.definition}\n`;
      });
      textToCopy += `\n`;
    }

    if (summaryData.takeaways.length > 0) {
      textToCopy += `EXAM REVISION TAKEAWAYS:\n`;
      summaryData.takeaways.forEach((t) => {
        textToCopy += `• ${t}\n`;
      });
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summaryData) return;
    const blob = new Blob(
      [
        `ACADEMIC SUMMARY: ${material.title}\n\nOVERVIEW:\n${summaryData.overview}\n\n`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${material.title.replace(/\.[^/.]+$/, "")}_Summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenQuiz = () => {
    onClose();
    router.push(`/quiz?materialId=${material.id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === "am"
          ? "የ AI ማጠቃለያ (Document Summary)"
          : "AI Document Summary"
      }
      description={
        language === "am"
          ? `የ "${material.title}" ዋና ዋና ነጥቦች ማጠቃለያ`
          : `Grounded key concepts and takeaways for "${material.title}"`
      }
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{material.subject}</Badge>
            <span className="font-semibold text-slate-800 truncate max-w-xs">
              {material.title}
            </span>
          </div>

          {summaryData && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>{language === "am" ? "ተቀድቷል" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>{language === "am" ? "ቅዳ" : "Copy"}</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                <Download className="h-3 w-3" />
                <span>{language === "am" ? "አውርድ" : "Download"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="min-h-[350px] max-h-[500px] overflow-y-auto p-4 sm:p-5 bg-white border border-stone-200 rounded-xl space-y-4 text-xs sm:text-sm">
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {language === "am"
                    ? "ሰነዱን በ AI በማጠቃለል ላይ..."
                    : "Analyzing document with Gemini AI..."}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === "am"
                    ? "ዋና ዋና ፅንሰ-ሀሳቦችንና ቁልፍ ትርጓሜዎችን በማዘጋጀት ላይ..."
                    : "Extracting core concepts, definitions, and takeaways..."}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                {requiresKey ? (
                  <KeyRound className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {requiresKey
                  ? language === "am"
                    ? "የ Gemini API ቁልፍ አልተዘጋጀም"
                    : "Gemini API Key Required"
                  : language === "am"
                  ? "ማጠቃለያውን ማመንጨት አልተቻለም"
                  : "Failed to Generate Summary"}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">{error}</p>

              {requiresKey ? (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-left text-xs space-y-1 mt-2">
                  <p className="font-semibold text-slate-700">
                    {language === "am" ? "እንዴት ማስተካከል ይቻላል?" : "Quick Fix:"}
                  </p>
                  <p className="text-slate-500">
                    {language === "am"
                      ? "በ .env.local ፋይል ውስጥ GEMINI_API_KEY=your_key ብለው ያስገቡ።"
                      : "Add GEMINI_API_KEY=your_key to your .env.local file and refresh."}
                  </p>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateSummary}
                  className="gap-1.5 mt-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{language === "am" ? "እንደገና ሞክር" : "Try Again"}</span>
                </Button>
              )}
            </div>
          ) : summaryData ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Executive Overview */}
              <div className="p-3.5 bg-violet-50/60 border border-violet-100 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-violet-700 tracking-wider">
                  {language === "am" ? "አጠቃላይ ማጠቃለያ (Overview)" : "Executive Overview"}
                </span>
                <p className="text-slate-800 font-medium mt-1 leading-relaxed">
                  {summaryData.overview}
                </p>
              </div>

              {/* Sections / Concepts */}
              {summaryData.sections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === "am" ? "ዋና ዋና ፅንሰ-ሀሳቦች (Core Concepts)" : "Core Concepts"}
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {summaryData.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-50 border border-stone-200/90 rounded-xl space-y-1.5"
                      >
                        <h5 className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-violet-200 text-violet-800 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{sec.title}</span>
                        </h5>
                        <ul className="space-y-1 pl-5 list-disc text-slate-600 text-xs">
                          {sec.content.map((pt, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Definitions */}
              {summaryData.keyDefinitions.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === "am" ? "ቁልፍ ቃላትና ትርጓሜዎች (Key Definitions)" : "Key Definitions"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summaryData.keyDefinitions.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-stone-50/70 border border-stone-200 rounded-lg space-y-0.5"
                      >
                        <span className="font-bold text-violet-900 text-xs">
                          {def.term}
                        </span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {def.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {summaryData.takeaways.length > 0 && (
                <div className="space-y-2 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {language === "am" ? "የፈተና ክለሳ ነጥቦች (Exam Takeaways)" : "Exam Revision Takeaways"}
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-emerald-950 text-xs">
                    {summaryData.takeaways.map((takeaway, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenQuiz}
            className="gap-1.5 text-violet-700 hover:bg-violet-50"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>
              {language === "am"
                ? "በዚህ ማቴሪያል የ AI ፈተና ውሰድ"
                : "Practice with AI Quiz"}
            </span>
          </Button>

          <Button size="sm" onClick={onClose}>
            {language === "am" ? "ዝጋ" : "Close"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
