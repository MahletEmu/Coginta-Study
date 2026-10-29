"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, UploadCloud, HelpCircle, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function QuickActions() {
  const { t } = useLanguage();

  const actions = [
    {
      title: t("dash.quickNewTask"),
      desc: t("dash.quickNewTaskSub"),
      href: "/planner",
      icon: PlusCircle,
      iconColor: "text-violet-600 bg-violet-50",
      hoverBorder: "hover:border-violet-300",
    },
    {
      title: t("dash.quickUpload"),
      desc: t("dash.quickUploadSub"),
      href: "/materials",
      icon: UploadCloud,
      iconColor: "text-indigo-600 bg-indigo-50",
      hoverBorder: "hover:border-indigo-300",
    },
    {
      title: t("dash.quickQuiz"),
      desc: t("dash.quickQuizSub"),
      href: "/quiz",
      icon: HelpCircle,
      iconColor: "text-emerald-600 bg-emerald-50",
      hoverBorder: "hover:border-emerald-300",
    },
    {
      title: t("dash.quickChat"),
      desc: t("dash.quickChatSub"),
      href: "/chat",
      icon: MessageSquare,
      iconColor: "text-amber-600 bg-amber-50",
      hoverBorder: "hover:border-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.title}
            href={act.href}
            className={`p-3.5 bg-white border border-stone-200/80 rounded-xl transition-all duration-150 flex items-center gap-3 group shadow-xs hover:shadow-sm ${act.hoverBorder}`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${act.iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-900 group-hover:text-violet-900 truncate block">
                {act.title}
              </span>
              <p className="text-[11px] text-slate-400 truncate">{act.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
