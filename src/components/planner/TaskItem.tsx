"use client";

import React from "react";
import { StudyTask } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Circle, Trash2, Calendar, Clock, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TaskItemProps {
  task: StudyTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const { t } = useLanguage();

  const priorityVariant = {
    high: "danger" as const,
    medium: "warning" as const,
    low: "secondary" as const,
  };

  const priorityLabel = {
    high: t("plan.high"),
    medium: t("plan.medium"),
    low: t("plan.low"),
  };

  return (
    <div
      className={`p-3.5 bg-white rounded-xl border border-stone-200/80 transition-all duration-150 flex items-start justify-between gap-3 group hover:border-stone-300 shadow-xs ${
        task.completed ? "bg-stone-50/50" : ""
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button
          onClick={() => onToggle(task.id)}
          className="text-slate-400 hover:text-emerald-600 transition-colors mt-0.5 shrink-0 cursor-pointer"
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-50" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              task.completed
                ? "text-slate-400 line-through"
                : "text-slate-900 group-hover:text-violet-900"
            }`}
          >
            {task.title}
          </p>

          {task.notes && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {task.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-stone-100 px-2 py-0.5 rounded">
              <BookOpen className="h-3 w-3" />
              {task.subject}
            </span>

            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              {formatDate(task.dueDate)}
            </span>

            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {task.estimatedMinutes} min
            </span>

            <Badge variant={priorityVariant[task.priority]} size="sm">
              {priorityLabel[task.priority]}
            </Badge>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
        aria-label="Delete task"
        title="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
