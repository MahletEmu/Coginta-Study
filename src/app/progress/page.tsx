"use client";

import React from "react";
import {
  DEMO_USER_STATS,
  DEMO_SUBJECT_MASTERY,
  WEEKLY_STUDY_HOURS,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProgressPage() {
  const { t, language } = useLanguage();
  const maxHours = Math.max(...WEEKLY_STUDY_HOURS.map((d) => d.hours));

  const achievements = [
    {
      title: language === "am" ? "የጥናት ሻምፒዮን" : "Active Recall Master",
      desc: language === "am" ? "10+ ፈተናዎችን በከፍተኛ ውጤት አጠናቋል" : "10+ practice quizzes completed with >80% accuracy",
      icon: Award,
      unlocked: true,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: language === "am" ? "የ6-ቀናት ፅናት" : "6-Day Streak",
      desc: language === "am" ? "ለ6 ተከታታይ ቀናት አጥንቷል" : "Studied consecutively for 6 days",
      icon: Zap,
      unlocked: true,
      color: "text-violet-600 bg-violet-50 border-violet-200",
    },
    {
      title: language === "am" ? "ትኩረት ሰብሳቢ" : "Deep Focus",
      desc: language === "am" ? "ዋና ዋና ማስታወሻዎችን አጠቃሏል" : "Synthesized core subject textbooks",
      icon: Sparkles,
      unlocked: true,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: language === "am" ? "ለፈተና ዝግጁ" : "Exam Ready",
      desc: language === "am" ? "በባዮሎጂ >90% የመረዳት አቅም" : ">90% subject mastery in Biology",
      icon: CheckCircle2,
      unlocked: false,
      color: "text-slate-400 bg-stone-100 border-stone-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t("prog.title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t("prog.subtitle")}
        </p>
      </div>

      {/* Top 3 KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {t("prog.totalHours")}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {DEMO_USER_STATS.totalHoursStudied}h
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              +14% {t("prog.thisWeek")}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {t("prog.currentStreak")}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {DEMO_USER_STATS.studyStreakDays} {t("common.streak")}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Record: 12 days
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {t("prog.retentionScore")}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {DEMO_USER_STATS.retentionRate}%
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              Top 10%
            </p>
          </div>
        </Card>
      </div>

      {/* Grid: Weekly Study Chart & Subject Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-sm">{t("prog.weeklyHours")}</CardTitle>
            </div>
            <span className="text-xs text-slate-400 font-medium">{t("prog.thisWeek")}</span>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-48 flex items-end justify-between gap-2.5 pt-4 pb-1 px-1">
              {WEEKLY_STUDY_HOURS.map((item) => {
                const heightPercent = Math.round((item.hours / maxHours) * 100);
                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                  >
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-violet-600 transition-colors">
                      {item.hours}h
                    </span>
                    <div className="w-full max-w-[32px] bg-stone-100 rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-violet-600 group-hover:bg-violet-700 transition-all duration-300 rounded-t-md"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Subject Mastery Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-sm">{t("prog.subjectMastery")}</CardTitle>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              4 Active
            </span>
          </CardHeader>

          <CardContent className="space-y-3.5 pt-2">
            {DEMO_SUBJECT_MASTERY.map((sub) => (
              <div key={sub.subject} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    {sub.subject}
                  </span>
                  <span className="font-bold text-slate-900">{sub.progress}%</span>
                </div>

                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sub.progress}%`,
                      backgroundColor: sub.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{sub.tasksCompleted} {t("plan.done")}</span>
                  <span>{sub.quizzesPassed} {t("dash.quizzesTaken")}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-violet-600" />
            <CardTitle className="text-sm">{t("prog.milestones")}</CardTitle>
          </div>
          <Badge variant="secondary">3 {t("prog.unlocked")}</Badge>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.title}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  ach.unlocked
                    ? "bg-white border-stone-200/90 shadow-2xs"
                    : "bg-stone-50/50 border-stone-200/50 opacity-60"
                }`}
              >
                <div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border mb-2.5 ${ach.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    {ach.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {ach.desc}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-stone-100">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      ach.unlocked ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {ach.unlocked ? `✓ ${t("prog.unlocked")}` : t("prog.inProgress")}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
