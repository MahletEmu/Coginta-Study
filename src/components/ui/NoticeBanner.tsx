import React from "react";
import { cn } from "@/lib/utils";
import { Info, Sparkles, AlertCircle } from "lucide-react";

export interface NoticeBannerProps {
  type?: "info" | "stage-badge" | "warning";
  title: string;
  description: string;
  className?: string;
  actionText?: string;
  onAction?: () => void;
}

export function NoticeBanner({
  type = "stage-badge",
  title,
  description,
  className,
  actionText,
  onAction,
}: NoticeBannerProps) {
  const isStage = type === "stage-badge";
  const isWarning = type === "warning";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm",
        isStage && "bg-violet-50/70 border-violet-200/80 text-violet-950",
        type === "info" && "bg-sky-50/70 border-sky-200/80 text-sky-950",
        isWarning && "bg-amber-50/70 border-amber-200/80 text-amber-950",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-1.5 rounded-lg shrink-0 mt-0.5",
            isStage && "bg-violet-100 text-violet-700",
            type === "info" && "bg-sky-100 text-sky-700",
            isWarning && "bg-amber-100 text-amber-700"
          )}
        >
          {isStage ? (
            <Sparkles className="h-4 w-4" />
          ) : isWarning ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
        </div>
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                isStage && "bg-violet-200/70 text-violet-800",
                type === "info" && "bg-sky-200/70 text-sky-800",
                isWarning && "bg-amber-200/70 text-amber-800"
              )}
            >
              Stage 1 Preview
            </span>
          </div>
          <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {actionText && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-violet-700 hover:text-violet-900 underline underline-offset-4 shrink-0 cursor-pointer self-start sm:self-center"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
