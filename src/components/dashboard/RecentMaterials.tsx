"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileText, ArrowRight, BookOpen } from "lucide-react";
import { StudyMaterial } from "@/types";
import { formatFileSize } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface RecentMaterialsProps {
  materials: StudyMaterial[];
}

export function RecentMaterials({ materials }: RecentMaterialsProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet-600" />
          <CardTitle>{t("dash.recentMaterials")}</CardTitle>
        </div>
        <Link
          href="/materials"
          className="text-xs font-medium text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
        >
          <span>{t("dash.viewAll")} ({materials.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-stone-100 p-0">
        {materials.slice(0, 3).map((mat) => (
          <div
            key={mat.id}
            className="p-3.5 hover:bg-stone-50/70 transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-stone-100 text-slate-600 shrink-0 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <Link
                  href="/materials"
                  className="text-xs sm:text-sm font-medium text-slate-900 hover:text-violet-700 truncate block"
                >
                  {mat.title}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <Badge variant="secondary" size="sm">
                    {mat.subject}
                  </Badge>
                  <span>•</span>
                  <span>{mat.pageCount} {t("mat.pages")}</span>
                  <span>•</span>
                  <span>{formatFileSize(mat.fileSize)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/quiz"
                className="text-xs font-medium text-slate-600 hover:text-violet-700 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-violet-50 transition-colors"
              >
                {t("mat.quizAction")}
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
