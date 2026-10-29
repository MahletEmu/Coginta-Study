import React from "react";
import { Sparkles } from "lucide-react";

interface PromptPillProps {
  label: string;
  onClick: (text: string) => void;
}

export function PromptPill({ label, onClick }: PromptPillProps) {
  return (
    <button
      onClick={() => onClick(label)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-900 border border-stone-200/90 hover:border-violet-300 transition-all shadow-2xs cursor-pointer text-left"
    >
      <Sparkles className="h-3 w-3 text-violet-500 shrink-0" />
      <span className="truncate max-w-xs">{label}</span>
    </button>
  );
}
