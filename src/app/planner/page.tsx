"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { INITIAL_DEMO_TASKS } from "@/lib/mock-data";
import { StudyTask } from "@/types";
import { TaskItem } from "@/components/planner/TaskItem";
import { TaskFormModal } from "@/components/planner/TaskFormModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import {
  fetchCloudTasks,
  insertCloudTask,
  updateCloudTask,
  deleteCloudTask,
} from "@/lib/database-service";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  CalendarCheck,
  X,
  Cloud,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PlannerPage() {
  const [tasks, setTasks] = useLocalStorage<StudyTask[]>(
    "ai_study_tasks",
    INITIAL_DEMO_TASKS
  );
  const { t, language } = useLanguage();
  const { user, isConfigured } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Load cloud tasks if authenticated
  useEffect(() => {
    async function loadCloud() {
      if (user && isConfigured) {
        const cloudTasks = await fetchCloudTasks(user.id);
        if (cloudTasks.length > 0) {
          setTasks(cloudTasks);
        }
      }
    }
    loadCloud();
  }, [user, isConfigured]);

  // Add Task
  const handleAddTask = async (newTaskData: Omit<StudyTask, "id" | "createdAt">) => {
    let newTask: StudyTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (user && isConfigured) {
      const saved = await insertCloudTask(newTask, user.id);
      if (saved) {
        newTask = saved;
      }
    }

    setTasks((prev) => [newTask, ...prev]);
  };

  // Toggle Task Completion
  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && user && isConfigured) {
      updateCloudTask(id, { completed: !task.completed }, user.id).catch(() => {});
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    if (user && isConfigured) {
      deleteCloudTask(id, user.id).catch(() => {});
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset to initial demo tasks
  const handleResetDemo = () => {
    setTasks(INITIAL_DEMO_TASKS);
  };

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter === "pending" && task.completed) return false;
      if (statusFilter === "completed" && !task.completed) return false;

      // Subject filter
      if (subjectFilter !== "all" && task.subject !== subjectFilter) return false;

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesNotes) return false;
      }

      return true;
    });
  }, [tasks, statusFilter, subjectFilter, priorityFilter, searchQuery]);

  // Derived statistics
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const remainingMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t("plan.title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("plan.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tasks.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("plan.restore")}</span>
            </Button>
          )}
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>{t("plan.addTask")}</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-violet-600" />
            <span>{t("plan.timeRemaining")}</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">
            {Math.round((remainingMinutes / 60) * 10) / 10}h
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <CalendarCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>{t("plan.pending")}</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">
            {pendingCount}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t("plan.done")}</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">
            {completedCount}
          </p>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t("plan.searchTasks")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              title={t("common.clear")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t("common.all")} ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t("plan.pending")} ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                statusFilter === "completed"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t("plan.done")} ({completedCount})
            </button>
          </div>

          {/* Subject dropdown */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">{t("mat.allSubjects")}</option>
            <option value="Biology">Biology / ባዮሎጂ</option>
            <option value="Computer Science">Computer Science / ኮምፒውተር</option>
            <option value="Chemistry">Chemistry / ኬሚስትሪ</option>
            <option value="Mathematics">Mathematics / ሒሳብ</option>
            <option value="Physics">Physics / ፊዚክስ</option>
          </select>

          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">{t("plan.allPriorities")}</option>
            <option value="high">{t("plan.high")}</option>
            <option value="medium">{t("plan.medium")}</option>
            <option value="low">{t("plan.low")}</option>
          </select>
        </div>
      </div>

      {/* Task List / Empty States */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={t("plan.emptyTitle")}
          description={t("plan.emptyDesc")}
          actionLabel={t("plan.addTask")}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <EmptyState
          icon={Filter}
          title={t("plan.noMatchTitle")}
          description={t("plan.noMatchDesc")}
          actionLabel={t("common.clear")}
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setSubjectFilter("all");
            setPriorityFilter("all");
          }}
        />
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
