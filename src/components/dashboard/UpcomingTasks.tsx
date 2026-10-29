"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CalendarCheck, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { StudyTask } from "@/types";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface UpcomingTasksProps {
  tasks: StudyTask[];
  onToggleTask?: (id: string) => void;
}

export function UpcomingTasks({ tasks, onToggleTask }: UpcomingTasksProps) {
  const { t } = useLanguage();

  const priorityBadges = {
    high: <Badge variant="danger">{t("plan.high")}</Badge>,
    medium: <Badge variant="warning">{t("plan.medium")}</Badge>,
    low: <Badge variant="secondary">{t("plan.low")}</Badge>,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-violet-600" />
          <CardTitle>{t("dash.upcomingTasks")}</CardTitle>
        </div>
        <Link
          href="/planner"
          className="text-xs font-medium text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
        >
          <span>{t("dash.openPlanner")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-stone-100 p-0">
        {tasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            className="p-3.5 hover:bg-stone-50/70 transition-colors flex items-center justify-between gap-3 group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => onToggleTask?.(task.id)}
                className="text-slate-400 hover:text-emerald-600 transition-colors mt-0.5 shrink-0 cursor-pointer"
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
              >
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-50" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>

              <div className="min-w-0">
                <p
                  className={`text-xs sm:text-sm font-medium truncate ${
                    task.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-900 group-hover:text-violet-900"
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">
                    {task.subject}
                  </span>
                  <span>•</span>
                  <span>{formatDate(task.dueDate)}</span>
                  <span>•</span>
                  <span>{task.estimatedMinutes} min</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">{priorityBadges[task.priority]}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
