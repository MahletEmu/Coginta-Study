"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ActivityItem } from "@/types";
import { Clock, HelpCircle, FileText, CheckCircle2, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const { t } = useLanguage();

  const iconMap = {
    quiz: HelpCircle,
    material: FileText,
    task: CheckCircle2,
    chat: MessageSquare,
  };

  const colorMap = {
    quiz: "bg-emerald-50 text-emerald-600",
    material: "bg-indigo-50 text-indigo-600",
    task: "bg-violet-50 text-violet-600",
    chat: "bg-amber-50 text-amber-600",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-600" />
          <CardTitle className="text-sm">{t("dash.recentActivity")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-stone-100 p-0">
        {activities.slice(0, 3).map((act) => {
          const Icon = iconMap[act.type] || Clock;
          return (
            <div
              key={act.id}
              className="p-3.5 hover:bg-stone-50/70 transition-colors flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${colorMap[act.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1">
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {act.timestamp}
                </span>
                {act.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-slate-600">
                    {act.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
