"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StudyTask, Subject, Priority } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<StudyTask, "id" | "createdAt">) => void;
}

const SUBJECT_OPTIONS: Subject[] = [
  "Biology",
  "Computer Science",
  "Chemistry",
  "Mathematics",
  "Physics",
  "General",
];

export function TaskFormModal({ isOpen, onClose, onAddTask }: TaskFormModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Biology");
  const [dueDate, setDueDate] = useState("2026-11-02");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { title?: string; dueDate?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Title is required / ስም ማስገባት አስፈላጊ ነው።";
    }

    if (!dueDate) {
      newErrors.dueDate = "Select date / ቀን ምረጥ።";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddTask({
      title: title.trim(),
      subject,
      dueDate,
      priority,
      completed: false,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setTitle("");
    setNotes("");
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("plan.modalTitle")}
      description={t("plan.modalDesc")}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t("plan.taskTitle")} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Chapter 4 Review / የክፍል 4 ማስታወሻ"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white transition-all text-slate-900"
          />
          {errors.title && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">
              {errors.title}
            </p>
          )}
        </div>

        {/* Subject & Priority Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("mat.subject")}
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority / ደረጃ
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
            >
              <option value="low">{t("plan.low")}</option>
              <option value="medium">{t("plan.medium")}</option>
              <option value="high">{t("plan.high")}</option>
            </select>
          </div>
        </div>

        {/* Due Date & Duration Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("plan.dueDate")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
              }}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
            />
            {errors.dueDate && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">
                {errors.dueDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("plan.duration")}
            </label>
            <select
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hr</option>
              <option value={90}>1.5 hrs</option>
              <option value={120}>2 hrs</option>
            </select>
          </div>
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t("plan.notes")}
          </label>
          <textarea
            rows={2}
            placeholder="Key formulas, chapters, or homework notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" size="sm">
            {t("plan.addTask")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
