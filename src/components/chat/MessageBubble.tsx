"use client";

import React from "react";
import { ChatMessage } from "@/types";
import { Sparkles, User, Bot } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  onSetupKeyClick?: () => void;
}

function renderInline(text: string): React.ReactNode[] {
  // Matches **bold**, `code`, $math$, and *italic*
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$|\*[^*]+\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="font-mono text-[11px] sm:text-xs bg-stone-100 text-violet-700 px-1 py-0.5 rounded border border-stone-200/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <span
          key={index}
          className="font-serif italic font-medium text-violet-900 bg-violet-50/70 px-1 py-0.5 rounded"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function FormattedAcademicContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let keyIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      nodes.push(<div key={`sp-${keyIndex++}`} className="h-2" />);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3
          key={`h3-${keyIndex++}`}
          className="text-sm sm:text-base font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5"
        >
          {renderInline(trimmed.replace("### ", ""))}
        </h3>
      );
    } else if (trimmed.startsWith("#### ")) {
      nodes.push(
        <h4
          key={`h4-${keyIndex++}`}
          className="text-xs sm:text-sm font-semibold text-violet-950 mt-2.5 mb-1"
        >
          {renderInline(trimmed.replace("#### ", ""))}
        </h4>
      );
    } else if (trimmed === "---") {
      nodes.push(
        <hr key={`hr-${keyIndex++}`} className="border-t border-stone-200/80 my-3" />
      );
    } else if (
      trimmed.startsWith("💡") ||
      trimmed.startsWith("📌") ||
      trimmed.startsWith("⚠️")
    ) {
      nodes.push(
        <div
          key={`callout-${keyIndex++}`}
          className="p-3 my-2 rounded-xl bg-violet-50/70 border border-violet-100/90 text-slate-800 text-xs sm:text-sm leading-relaxed"
        >
          {renderInline(trimmed)}
        </div>
      );
    } else if (
      trimmed.startsWith("• ") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ")
    ) {
      nodes.push(
        <div
          key={`li-${keyIndex++}`}
          className="flex items-start gap-2 my-1 pl-1 text-slate-800"
        >
          <span className="text-violet-500 font-bold shrink-0 mt-0.5">•</span>
          <span className="leading-relaxed">
            {renderInline(trimmed.replace(/^[-*•]\s+/, ""))}
          </span>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
      nodes.push(
        <div
          key={`num-${keyIndex++}`}
          className="flex items-start gap-2 my-1.5 pl-1 text-slate-800"
        >
          <span className="text-violet-600 font-semibold shrink-0">
            {numMatch ? numMatch[1] : "1."}
          </span>
          <span className="leading-relaxed">
            {renderInline(numMatch ? numMatch[2] : trimmed)}
          </span>
        </div>
      );
    } else {
      nodes.push(
        <p key={`p-${keyIndex++}`} className="leading-relaxed my-1 text-slate-800">
          {renderInline(trimmed)}
        </p>
      );
    }
  }

  return <div className="space-y-0.5 text-xs sm:text-sm">{nodes}</div>;
}

export function MessageBubble({ message, onSuggestionClick, onSetupKeyClick }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { t, language } = useLanguage();
  const isKeyError =
    message.isError &&
    (message.content.includes("GEMINI_API_KEY") ||
      message.content.includes("Gemini API key") ||
      message.content.includes("API ቁልፍ"));

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-2xs ${
          isUser
            ? "bg-slate-900 text-white"
            : "bg-violet-600 text-white"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble Content */}
      <div
        className={`space-y-1.5 ${
          isUser ? "max-w-xl items-end text-right" : "max-w-3xl items-start text-left"
        }`}
      >
        <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-700">
            {isUser ? t("chat.you") : t("chat.ai")}
          </span>
          <span>•</span>
          <span>{message.timestamp}</span>
          {!isUser && message.groundedInDocument && message.materialTitle && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200/60 px-1.5 py-0.5 rounded-md">
                📄 {message.materialTitle}
              </span>
            </>
          )}
        </div>

        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
            isUser
              ? "bg-violet-600 text-white rounded-tr-xs whitespace-pre-line"
              : message.isError
              ? "bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs whitespace-pre-line"
              : "bg-white text-slate-800 border border-stone-200/80 rounded-tl-xs"
          }`}
        >
          {isUser || message.isError ? (
            message.content
          ) : (
            <FormattedAcademicContent content={message.content} />
          )}

          {isKeyError && onSetupKeyClick && (
            <div className="mt-3 pt-2.5 border-t border-rose-200/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-rose-700">
                {language === "am"
                  ? "የ API ቁልፍ ማስተካከያ መመሪያ ይመልከቱ፦"
                  : "Quick 2-minute setup guide:"}
              </span>
              <button
                type="button"
                onClick={onSetupKeyClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <span>{language === "am" ? "መመሪያውን ክፈት" : "Setup Instructions"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Suggested follow-ups */}
        {!isUser && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-1.5 justify-start">
            {message.suggestedFollowUps.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-stone-100 hover:bg-violet-50 text-slate-700 hover:text-violet-900 border border-stone-200 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-violet-500" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

