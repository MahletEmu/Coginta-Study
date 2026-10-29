"use client";

import React from "react";
import Link from "next/link";
import { StudyMaterial } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  FileCode,
  Clock,
  HardDrive,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Trash2,
  Sparkles,
} from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface MaterialListItemProps {
  material: StudyMaterial;
  onPreview: (material: StudyMaterial) => void;
  onSummarize?: (material: StudyMaterial) => void;
  onDelete: (material: StudyMaterial) => void;
}

export function MaterialListItem({
  material,
  onPreview,
  onSummarize,
  onDelete,
}: MaterialListItemProps) {
  const { language, t } = useLanguage();

  const isPdf = material.fileType === "pdf";

  return (
    <div className="bg-white border border-stone-200/90 rounded-xl p-3 sm:p-4 hover:shadow-xs hover:border-violet-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      {/* Left: Icon & Title info */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
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
          <div className="flex items-center gap-2 flex-wrap">
            <span
              onClick={() => onPreview(material)}
              className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-violet-700 cursor-pointer transition-colors truncate"
              title={material.title}
            >
              {material.title}
            </span>
            <Badge variant="secondary" size="sm">
              {material.subject}
            </Badge>
            <span className="text-[10px] uppercase font-mono font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
              {material.fileType}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(material.fileSize)}
            </span>
            <span>•</span>
            {material.pageCount && (
              <>
                <span>
                  {material.pageCount} {language === "am" ? "ገጾች" : "pages"}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(material.uploadedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(material)}
          className="gap-1.5 text-xs h-7 px-2.5 bg-stone-50 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
        >
          <BookOpen className="h-3.5 w-3.5 text-violet-600" />
          <span>{language === "am" ? "አንብብ" : "Preview"}</span>
        </Button>

        {onSummarize && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSummarize(material)}
            className="gap-1 text-xs h-7 px-2.5 bg-stone-50 hover:bg-violet-50 text-violet-700 hover:border-violet-200"
          >
            <Sparkles className="h-3 w-3 text-violet-600" />
            <span>{language === "am" ? "ማጠቃለያ" : "Summary"}</span>
          </Button>
        )}

        <Link href="/chat">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7 px-2.5 hidden md:inline-flex"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t("mat.chatAction")}</span>
          </Button>
        </Link>

        <Link href="/quiz">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7 px-2.5 hidden md:inline-flex"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t("mat.quizAction")}</span>
          </Button>
        </Link>

        <button
          onClick={() => onDelete(material)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
          title={language === "am" ? "አጥፋ" : "Delete material"}
          aria-label="Delete material"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
