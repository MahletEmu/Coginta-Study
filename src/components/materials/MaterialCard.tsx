"use client";

import React from "react";
import Link from "next/link";
import { StudyMaterial } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Clock,
  HelpCircle,
  MessageSquare,
  Trash2,
  BookOpen,
  FileCode,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface MaterialCardProps {
  material: StudyMaterial;
  onPreview: (material: StudyMaterial) => void;
  onSummarize?: (material: StudyMaterial) => void;
  onDelete: (material: StudyMaterial) => void;
}

export function MaterialCard({ material, onPreview, onSummarize, onDelete }: MaterialCardProps) {
  const { language, t } = useLanguage();

  const isPdf = material.fileType === "pdf";
  const isTxt = material.fileType === "txt";

  return (
    <Card hoverEffect className="flex flex-col justify-between transition-all group">
      <CardHeader className="items-start pb-2">
        <div className="flex items-start gap-3 min-w-0">
          {/* File Format Icon */}
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-colors ${
              isPdf
                ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100"
                : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
            }`}
          >
            {isPdf ? (
              <FileText className="h-5 w-5" />
            ) : (
              <FileCode className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm">
                {material.subject}
              </Badge>
              <span className="text-[10px] uppercase font-mono font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                {material.fileType}
              </span>
              {material.pageCount && (
                <span className="text-[11px] text-slate-400">
                  {material.pageCount} {language === "am" ? "ገጾች" : "pages"}
                </span>
              )}
            </div>

            <CardTitle
              className="text-sm mt-1 truncate block font-semibold hover:text-violet-700 cursor-pointer transition-colors"
              title={material.title}
              onClick={() => onPreview(material)}
            >
              {material.title}
            </CardTitle>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 border border-emerald-100">
          {t("common.ready")}
        </span>
      </CardHeader>

      <CardContent className="py-2 space-y-2">
        {/* Short Summary or topics */}
        {material.summaryPreview && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {material.summaryPreview}
          </p>
        )}

        {/* Key topics pills */}
        {material.keyTopics && material.keyTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {material.keyTopics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[10px] bg-stone-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}

        {/* File Metadata Info */}
        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 pt-1 border-t border-stone-100">
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(material.fileSize)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(material.uploadedAt)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="py-2 bg-stone-50/50 flex items-center justify-between gap-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Read / Preview Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(material)}
            className="gap-1.5 text-xs h-7 px-2.5 bg-white hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
          >
            <BookOpen className="h-3.5 w-3.5 text-violet-600" />
            <span>{language === "am" ? "አንብብ" : "Preview"}</span>
          </Button>

          {/* AI Summarize Button */}
          {onSummarize && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSummarize(material)}
              className="gap-1 text-xs h-7 px-2.5 bg-white hover:bg-violet-50 text-violet-700 hover:border-violet-300"
            >
              <Sparkles className="h-3 w-3 text-violet-600" />
              <span>{language === "am" ? "ማጠቃለያ" : "Summary"}</span>
            </Button>
          )}

          {/* Quick links to Chat and Quiz */}
          <Link href="/chat">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7 px-2.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{t("mat.chatAction")}</span>
            </Button>
          </Link>
          <Link href="/quiz">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7 px-2.5"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t("mat.quizAction")}</span>
            </Button>
          </Link>
        </div>

        {/* Delete button triggering confirmation modal */}
        <button
          onClick={() => onDelete(material)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          title={language === "am" ? "አጥፋ" : "Delete material"}
          aria-label="Delete material"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardFooter>
    </Card>
  );
}
