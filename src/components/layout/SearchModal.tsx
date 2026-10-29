"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  HelpCircle,
  CalendarCheck,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  SearchX,
} from "lucide-react";
import { INITIAL_DEMO_MATERIALS, DEMO_QUIZZES, INITIAL_DEMO_TASKS } from "@/lib/mock-data";
import { StudyMaterial, StudyTask } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  category: "page" | "material" | "quiz" | "task";
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge: string;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load live data from localStorage
  const materials: StudyMaterial[] = useMemo(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ai_study_materials");
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_MATERIALS;
  }, [isOpen]);

  const tasks: StudyTask[] = useMemo(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ai_study_tasks");
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_TASKS;
  }, [isOpen]);

  // Quick navigation pages
  const pages: SearchResultItem[] = useMemo(() => [
    {
      id: "page-dash",
      category: "page",
      title: t("nav.dashboard"),
      subtitle: language === "am" ? "ዋናው ገጽና የጥናት ማጠቃለያ" : "Overview & study statistics",
      href: "/",
      icon: LayoutDashboard,
      badge: language === "am" ? "ገጽ" : "Page",
    },
    {
      id: "page-mat",
      category: "page",
      title: t("nav.materials"),
      subtitle: language === "am" ? "የመማሪያ መጻሕፍትና ማስታወሻዎች" : "Textbooks, notes & files",
      href: "/materials",
      icon: FileText,
      badge: language === "am" ? "ገጽ" : "Page",
    },
    {
      id: "page-chat",
      category: "page",
      title: t("nav.chat"),
      subtitle: language === "am" ? "የ AI የጥናት ረዳት" : "AI Concept Explanations",
      href: "/chat",
      icon: MessageSquare,
      badge: language === "am" ? "ገጽ" : "Page",
    },
    {
      id: "page-quiz",
      category: "page",
      title: t("nav.quiz"),
      subtitle: language === "am" ? "የልምምድ ፈተናዎች" : "Active recall practice",
      href: "/quiz",
      icon: HelpCircle,
      badge: language === "am" ? "ፈተና" : "Quiz",
    },
    {
      id: "page-plan",
      category: "page",
      title: t("nav.planner"),
      subtitle: language === "am" ? "የጥናት እቅድና ቀጠሮዎች" : "Deadlines & homework",
      href: "/planner",
      icon: CalendarCheck,
      badge: language === "am" ? "እቅድ" : "Task",
    },
    {
      id: "page-prog",
      category: "page",
      title: t("nav.progress"),
      subtitle: language === "am" ? "የጥናት ሰዓትና እድገት" : "Study hours & streaks",
      href: "/progress",
      icon: TrendingUp,
      badge: language === "am" ? "ገጽ" : "Page",
    },
  ], [t, language]);

  // Search filtering
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return pages.slice(0, 4);
    }

    const items: SearchResultItem[] = [];

    // Search Pages
    pages.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
        items.push(p);
      }
    });

    // Search Materials
    materials.forEach((m) => {
      const matchTitle = m.title?.toLowerCase().includes(q);
      const matchSubject = m.subject?.toLowerCase().includes(q);
      const matchTopics = m.keyTopics?.some((top) => top?.toLowerCase().includes(q));

      if (matchTitle || matchSubject || matchTopics) {
        items.push({
          id: `mat-${m.id}`,
          category: "material",
          title: m.title,
          subtitle: `${m.subject} • ${m.pageCount || 10} ${t("mat.pages")}`,
          href: "/materials",
          icon: FileText,
          badge: language === "am" ? "ፋይል" : "Document",
        });
      }
    });

    // Search Quizzes
    DEMO_QUIZZES.forEach((qz) => {
      const matchTitle = qz.title?.toLowerCase().includes(q);
      const matchSubject = qz.subject?.toLowerCase().includes(q);
      const matchDesc = qz.description?.toLowerCase().includes(q);

      if (matchTitle || matchSubject || matchDesc) {
        items.push({
          id: `quiz-${qz.id}`,
          category: "quiz",
          title: qz.title,
          subtitle: `${qz.subject} • ${qz.questions.length} ${t("quiz.questions")}`,
          href: "/quiz",
          icon: HelpCircle,
          badge: language === "am" ? "ፈተና" : "Quiz",
        });
      }
    });

    // Search Tasks
    tasks.forEach((tsk) => {
      const matchTitle = tsk.title?.toLowerCase().includes(q);
      const matchSubject = tsk.subject?.toLowerCase().includes(q);
      const matchNotes = tsk.notes?.toLowerCase().includes(q);

      if (matchTitle || matchSubject || matchNotes) {
        items.push({
          id: `task-${tsk.id}`,
          category: "task",
          title: tsk.title,
          subtitle: `${tsk.subject} • Due ${tsk.dueDate}`,
          href: "/planner",
          icon: CalendarCheck,
          badge: language === "am" ? "እቅድ" : "Task",
        });
      }
    });

    return items;
  }, [query, pages, materials, tasks, t, language]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  const isSearchEmpty = query.trim().length > 0 && results.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-3 sm:p-4">
      {/* Clickable Backdrop to easily exit */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150 cursor-pointer"
        onClick={onClose}
        aria-label={language === "am" ? "የፍለጋ መስኮቱን ዝጋ" : "Close search modal"}
      />

      {/* Search Dialog Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Search Header Bar with dedicated Close / Back actions */}
        <div className="flex items-center px-3.5 py-3 border-b border-stone-100 gap-2.5">
          {/* Back/Close Button for Mobile & Fast Return */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-stone-100 transition-colors cursor-pointer"
            title={language === "am" ? "ተመለስ / ዝጋ" : "Back / Close"}
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <Search className="h-4 w-4 text-violet-600 shrink-0 hidden sm:block" />

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "am"
                ? "ዶክመንቶችን፣ ፈተናዎችን፣ የጥናት እቅዶችን ፈልግ..."
                : "Search notes, quizzes, tasks, or jump to page..."
            }
            className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none placeholder-slate-400 text-slate-900"
          />

          {/* Clear Text button if text exists */}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-stone-100 cursor-pointer"
              title={language === "am" ? "ጽሁፉን አጥፋ" : "Clear text"}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Dedicated Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            title={language === "am" ? "ዝጋ" : "Close"}
          >
            <X className="h-3.5 w-3.5 text-slate-500" />
            <span>{language === "am" ? "ዝጋ" : "Close"}</span>
          </button>
        </div>

        {/* Results List / Empty State */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-stone-50">
          {isSearchEmpty ? (
            /* Explicit "Not Found" state as requested */
            <div className="py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-3 shadow-xs">
                <SearchX className="h-6 w-6" />
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100/70 text-rose-700 border border-rose-200 mb-2">
                Not Found
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === "am" ? "ምንም አልተገኘም (Not Found)" : "No Results Found"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {language === "am"
                  ? `"${query}" በሚል ርዕስ የተገኘ ማስታወሻ፣ ፈተና ወይም እቅድ አልተገኘም። እባክዎ ፊደሉን አስተካክለው ይሞክሩ።`
                  : `No materials, quizzes, or tasks found matching "${query}".`}
              </p>
              <button
                onClick={() => setQuery("")}
                className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{language === "am" ? "ፍለጋውን አጽዳ" : "Clear search"}</span>
              </button>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {query.trim()
                  ? language === "am"
                    ? `የፍለጋ ውጤቶች (${results.length})`
                    : `Results (${results.length})`
                  : language === "am"
                  ? "ፈጣን መዳረሻ"
                  : "Quick Navigation"}
              </div>
              <div className="space-y-0.5">
                {results.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-violet-100 text-slate-500 group-hover:text-violet-700 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-violet-700 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600">
                          {item.badge}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-violet-600 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
