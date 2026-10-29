"use client";

import React from "react";
import {
  INITIAL_DEMO_TASKS,
  INITIAL_DEMO_MATERIALS,
  DEMO_USER_STATS,
  DEMO_ACTIVITIES,
  DEMO_USER,
} from "@/lib/mock-data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentMaterials } from "@/components/dashboard/RecentMaterials";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Clock, BookOpen, HelpCircle, Award, Target, Flame } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const [tasks, setTasks] = useLocalStorage("ai_study_tasks", INITIAL_DEMO_TASKS);
  const [materials] = useLocalStorage("ai_study_materials", INITIAL_DEMO_MATERIALS);
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();

  const isAuthed = !!user;
  const displayName = profile?.fullName || user?.email?.split("@")[0];
  const pendingTasks = tasks.filter((t) => !t.completed);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isAuthed
                ? `${t("dash.welcome")}, ${displayName} 👋`
                : language === "am"
                ? "እንኳን ወደ Cognita በደህና መጡ 👋"
                : "Welcome to Cognita 👋"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAuthed ? (
              <>
                <span className="text-violet-700 font-semibold">{pendingTasks.length}</span>{" "}
                {t("dash.tasksDue")}
              </>
            ) : (
              <span>
                {language === "am"
                  ? "የግል የጥናት መረጃዎችዎን ለማስቀመጥ እባክዎ ይግቡ ወይም ይመዝገቡ"
                  : "Sign in or register to sync your private materials, tasks and AI quizzes"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-stone-200/80 px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>6 {t("common.streak")}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={t("dash.studyTime")}
          value={`${DEMO_USER_STATS.totalHoursStudied}h`}
          subtext={t("dash.hoursThisWeek")}
          trend="+18%"
          icon={Clock}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          label={t("dash.documents")}
          value={materials.length}
          subtext={t("dash.indexedNotes")}
          trend="+2"
          icon={BookOpen}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          label={t("dash.quizzesTaken")}
          value={DEMO_USER_STATS.quizzesCompleted}
          subtext={t("dash.practiceSessions")}
          icon={HelpCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label={t("dash.retention")}
          value={`${DEMO_USER_STATS.retentionRate}%`}
          subtext={t("dash.accuracyRate")}
          trend="+5%"
          icon={Award}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingTasks tasks={tasks} onToggleTask={handleToggleTask} />
          <RecentMaterials materials={materials} />
        </div>

        <div className="space-y-6">
          {/* Daily Goal Visual Widget */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 border-b-0">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-600" />
                <CardTitle className="text-sm">{t("dash.todayGoal")}</CardTitle>
              </div>
              <span className="text-xs font-bold text-violet-700">75%</span>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full transition-all" style={{ width: "75%" }} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{t("dash.hoursCompleted")}</span>
                <span className="font-medium text-slate-700">{t("dash.hoursLeft")}</span>
              </div>
            </CardContent>
          </Card>

          <RecentActivity activities={DEMO_ACTIVITIES} />
        </div>
      </div>
    </div>
  );
}
