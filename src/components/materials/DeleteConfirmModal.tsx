"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StudyMaterial } from "@/types";
import { AlertTriangle, Trash2, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: StudyMaterial | null;
  onConfirm: (id: string) => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  material,
  onConfirm,
}: DeleteConfirmModalProps) {
  const { language } = useLanguage();

  if (!material) return null;

  const handleDelete = () => {
    onConfirm(material.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === "am"
          ? "ይህ ማስታወሻ ይሰረዝ?"
          : "Delete Study Material?"
      }
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Warning Badge & Message */}
        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-900">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold">
              {language === "am"
                ? "ይህ እርምጃ መልሶ አይመለስም"
                : "This action cannot be undone"}
            </p>
            <p className="text-rose-700">
              {language === "am"
                ? "ይህ ፋይል ከብራውዘርዎ አካባቢያዊ ማከማቻ (Local Storage) ላይ ሙሉ በሙሉ ይወገዳል።"
                : "This document and its cached data will be permanently removed from your browser storage."}
            </p>
          </div>
        </div>

        {/* Material Details Card */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-stone-200 text-violet-700 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {material.title}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span className="uppercase font-mono font-bold text-violet-700">
                {material.fileType}
              </span>
              <span>•</span>
              <span>{formatFileSize(material.fileSize)}</span>
              <span>•</span>
              <span>{material.subject}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {language === "am" ? "ይቅር / ተመለስ" : "Cancel"}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{language === "am" ? "አጥፋ (Delete)" : "Delete"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
