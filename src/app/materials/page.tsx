"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { INITIAL_DEMO_MATERIALS } from "@/lib/mock-data";
import { StudyMaterial, Subject } from "@/types";
import { MaterialCard } from "@/components/materials/MaterialCard";
import { MaterialListItem } from "@/components/materials/MaterialListItem";
import { UploadModal } from "@/components/materials/UploadModal";
import { DocumentPreviewModal } from "@/components/materials/DocumentPreviewModal";
import { DeleteConfirmModal } from "@/components/materials/DeleteConfirmModal";
import { SummaryModal } from "@/components/materials/SummaryModal";
import { deleteDocumentBlob } from "@/lib/file-storage";
import { deleteDocumentFromStorage } from "@/lib/cloud-storage";
import {
  fetchCloudMaterials,
  deleteCloudMaterial,
  migrateLocalDataToCloud,
  MigrationProgress,
} from "@/lib/database-service";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Plus,
  Search,
  FolderOpen,
  Filter,
  RotateCcw,
  X,
  LayoutGrid,
  List,
  HardDrive,
  FileText,
  FileCode,
  Cloud,
  CloudUpload,
  CheckCircle2,
  Loader2,
  Database,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MaterialsPage() {
  const [materials, setMaterials] = useLocalStorage<StudyMaterial[]>(
    "ai_study_materials",
    INITIAL_DEMO_MATERIALS
  );
  const { language, t } = useLanguage();
  const { user, isConfigured } = useAuth();

  // Cloud migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);

  // Load cloud materials when authenticated
  useEffect(() => {
    async function loadCloud() {
      if (user && isConfigured) {
        const cloudItems = await fetchCloudMaterials(user.id);
        if (cloudItems.length > 0) {
          setMaterials((prev) => {
            const cloudIds = new Set(cloudItems.map((c) => c.id));
            const existingUnsynced = prev.filter((p) => !cloudIds.has(p.id) && !p.storagePath);
            return [...cloudItems, ...existingUnsynced];
          });
        }
      }
    }
    loadCloud();
  }, [user, isConfigured]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [summaryMaterial, setSummaryMaterial] = useState<StudyMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<StudyMaterial | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedFileType, setSelectedFileType] = useState<"all" | "pdf" | "txt">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const unmigratedCount = useMemo(() => {
    return materials.filter((m) => !m.isDemo && !m.storagePath).length;
  }, [materials]);

  const handleStartMigration = async () => {
    if (!user) return;
    setIsMigrating(true);
    setMigrationStatus(null);

    const res = await migrateLocalDataToCloud(user.id, (prog) => {
      setMigrationProgress(prog);
    });

    setIsMigrating(false);
    if (res.success) {
      setMigrationStatus(
        language === "am"
          ? `${res.migratedCount} ዶክመንቶች በተሳካ ሁኔታ ወደ ደመና ማከማቻ ተዛውረዋል!`
          : `Successfully synced ${res.migratedCount} document(s) to cloud storage!`
      );
      const refreshed = await fetchCloudMaterials(user.id);
      if (refreshed.length > 0) {
        setMaterials(refreshed);
      }
    } else {
      setMigrationStatus(
        res.errors[0] || (language === "am" ? "የማዛወር ሂደቱ አልተሳካም።" : "Migration encountered errors.")
      );
    }
  };

  const handleAddMaterial = (newMat: StudyMaterial) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  const handleConfirmDelete = async (id: string) => {
    const mat = materials.find((m) => m.id === id);
    // Delete file binary from browser IndexedDB
    await deleteDocumentBlob(id);
    // Delete from Supabase Storage & database if cloud-backed
    if (mat?.storagePath && user) {
      await deleteDocumentFromStorage(mat.storagePath);
      await deleteCloudMaterial(id, user.id);
    }
    // Delete metadata from state
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleResetDemo = () => {
    setMaterials(INITIAL_DEMO_MATERIALS);
    setSelectedSubject("all");
    setSelectedFileType("all");
    setSearchQuery("");
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      // 1. Subject filter
      if (selectedSubject !== "all" && item.subject !== selectedSubject) {
        return false;
      }

      // 2. File type filter (pdf / txt)
      if (selectedFileType !== "all" && item.fileType !== selectedFileType) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubject = item.subject.toLowerCase().includes(q);
        const matchesTopic =
          item.keyTopics?.some((top) => top.toLowerCase().includes(q)) ?? false;
        if (!matchesTitle && !matchesSubject && !matchesTopic) return false;
      }

      return true;
    });
  }, [materials, selectedSubject, selectedFileType, searchQuery]);

  const pdfCount = useMemo(
    () => materials.filter((m) => m.fileType === "pdf").length,
    [materials]
  );
  const txtCount = useMemo(
    () => materials.filter((m) => m.fileType === "txt").length,
    [materials]
  );

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t("mat.title")}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {materials.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === "am"
              ? "የጥናት መጻሕፍትን፣ ሌክቸሮችንና ማስታወሻዎችን በዚህ ብራውዘር ውስጥ ያስተዳድሩ።"
              : "Upload, organize, and preview your PDF textbooks and TXT study notes."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {materials.length === 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("mat.restore")}</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              title={
                language === "am"
                  ? "የመጀመሪያ ናሙናዎችን መልስ"
                  : "Restore default sample materials"
              }
              className="gap-1.5 hidden md:inline-flex"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("mat.restore")}</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>{t("mat.uploadBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Storage Truth & Cloud Sync Indicator */}
      <div className="space-y-3">
        <div className="bg-stone-50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                user && isConfigured ? "bg-violet-600" : "bg-emerald-500"
              } animate-pulse`}
            />
            <span className="font-semibold text-slate-800">
              {user && isConfigured
                ? language === "am"
                  ? "የደመና ማከማቻ ንቁ ነው (Supabase Cloud Storage)"
                  : "Cloud Storage Active (Supabase)"
                : language === "am"
                ? "አካባቢያዊ የብራውዘር ማከማቻ (Local Storage)"
                : "Local Storage Mode"}
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">
              {user && isConfigured
                ? language === "am"
                  ? "ማቴሪያሎች በግል የደመና ማከማቻዎ ውስጥ በጥንቃቄ ተቀምጠዋል።"
                  : "Materials are persisted in your private cloud bucket with Row Level Security."
                : language === "am"
                ? "ፋይሎች በዚህ መሣሪያ ላይ ብቻ ይቀመጣሉ፤ ወደ ውጭ ሰርቨር አይላኩም።"
                : "Documents are stored securely on this device's browser (IndexedDB)."}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>{pdfCount} PDFs</span>
            <span>•</span>
            <span>{txtCount} TXTs</span>
          </div>
        </div>

        {/* Cloud Migration Banner for Unsynced Local Documents */}
        {user && isConfigured && unmigratedCount > 0 && (
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <CloudUpload className="h-5 w-5 text-violet-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-semibold text-violet-950">
                  {language === "am"
                    ? `${unmigratedCount} ወደ ደመና ያልተዛወሩ አካባቢያዊ ዶክመንቶች አሉዎት`
                    : `You have ${unmigratedCount} local document(s) on this browser`}
                </p>
                <p className="text-[11px] text-violet-700">
                  {language === "am"
                    ? "ከማንኛውም መሣሪያ ሆነው እንዲያገኟቸው ወደ Supabase የግል ደመና ማከማቻዎ ይዛወሩ። የአካባቢው ቅጂዎች አይጠፉም።"
                    : "Sync them to your private cloud storage to access them on any device without losing local copies."}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleStartMigration}
              disabled={isMigrating}
              className="shrink-0 gap-1.5"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {migrationProgress
                      ? `${migrationProgress.completed}/${migrationProgress.total}`
                      : "Syncing..."}
                  </span>
                </>
              ) : (
                <>
                  <Cloud className="h-3.5 w-3.5" />
                  <span>{language === "am" ? "አሁን አዛውር" : "Sync to Cloud"}</span>
                </>
              )}
            </Button>
          </div>
        )}

        {migrationStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{migrationStatus}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "am"
                ? "በፋይል ስም፣ በርዕስ ወይም በትምህርት አይነት ፈልግ..."
                : "Search by filename, subject, or topics..."
            }
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

        {/* Filter Dropdowns and View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Type Filter */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
            <button
              onClick={() => setSelectedFileType("all")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                selectedFileType === "all"
                  ? "bg-white text-violet-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {language === "am" ? "ሁሉም" : "All"}
            </button>
            <button
              onClick={() => setSelectedFileType("pdf")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                selectedFileType === "pdf"
                  ? "bg-white text-violet-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="h-3 w-3" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => setSelectedFileType("txt")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                selectedFileType === "txt"
                  ? "bg-white text-violet-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileCode className="h-3 w-3" />
              <span>TXT</span>
            </button>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all">{t("mat.allSubjects")}</option>
            <option value="Biology">Biology / ባዮሎጂ</option>
            <option value="Computer Science">Computer Science / ኮምፒውተር</option>
            <option value="Chemistry">Chemistry / ኬሚስትሪ</option>
            <option value="Mathematics">Mathematics / ሒሳብ</option>
            <option value="Physics">Physics / ፊዚክስ</option>
            <option value="General">General / አጠቃላይ</option>
          </select>

          {/* Grid vs List View Toggle */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-violet-700 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title={language === "am" ? "የካርድ እይታ" : "Grid view"}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-violet-700 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title={language === "am" ? "የዝርዝር እይታ" : "List view"}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Materials Library Grid or List */}
      {filteredMaterials.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onPreview={(m) => setPreviewMaterial(m)}
                onSummarize={(m) => setSummaryMaterial(m)}
                onDelete={(m) => setMaterialToDelete(m)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMaterials.map((material) => (
              <MaterialListItem
                key={material.id}
                material={material}
                onPreview={(m) => setPreviewMaterial(m)}
                onSummarize={(m) => setSummaryMaterial(m)}
                onDelete={(m) => setMaterialToDelete(m)}
              />
            ))}
          </div>
        )
      ) : materials.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={t("mat.emptyTitle")}
          description={t("mat.emptyDesc")}
          actionLabel={t("mat.uploadBtn")}
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <EmptyState
          icon={Filter}
          title={language === "am" ? "ምንም አልተገኘም (Not Found)" : "Not Found"}
          description={
            language === "am"
              ? "የፍለጋ ቃሉን ወይም የትምህርት/የፋይል ምርጫውን ቀይረው ይሞክሩ።"
              : "No study materials match your active search or filters."
          }
          actionLabel={t("common.clear")}
          onAction={() => {
            setSearchQuery("");
            setSelectedSubject("all");
            setSelectedFileType("all");
          }}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddMaterial={handleAddMaterial}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        material={previewMaterial}
        onSummarize={(m) => setSummaryMaterial(m)}
      />

      {/* Document Summary Modal */}
      <SummaryModal
        isOpen={!!summaryMaterial}
        onClose={() => setSummaryMaterial(null)}
        material={summaryMaterial}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!materialToDelete}
        onClose={() => setMaterialToDelete(null)}
        material={materialToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
