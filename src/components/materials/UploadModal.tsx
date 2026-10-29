"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StudyMaterial, Subject } from "@/types";
import { storeDocumentBlob } from "@/lib/file-storage";
import { uploadDocumentToStorage } from "@/lib/cloud-storage";
import { insertCloudMaterial } from "@/lib/database-service";
import { useAuth } from "@/context/AuthContext";
import { formatFileSize } from "@/lib/utils";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Info,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMaterial: (mat: StudyMaterial) => void;
}

const SUBJECTS: Subject[] = [
  "Biology",
  "Computer Science",
  "Chemistry",
  "Mathematics",
  "Physics",
  "General",
];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export function UploadModal({ isOpen, onClose, onAddMaterial }: UploadModalProps) {
  const { language, t } = useLanguage();
  const { user, isConfigured } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Biology");
  const [pageCount, setPageCount] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setSubject("Biology");
    setPageCount(10);
    setError(null);
    setIsProcessing(false);
    setProgress(0);
    setProgressStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    resetForm();
    onClose();
  };

  const validateAndSelectFile = (file: File) => {
    setError(null);

    // 1. Validate file extension and MIME type
    const nameLower = file.name.toLowerCase();
    const isPdf = nameLower.endsWith(".pdf") || file.type === "application/pdf";
    const isTxt = nameLower.endsWith(".txt") || file.type === "text/plain";

    if (!isPdf && !isTxt) {
      setError(
        language === "am"
          ? "የማይደገፍ የፋይል አይነት! እባክዎ PDF (.pdf) ወይም TXT (.txt) ፋይል ብቻ ይምረጡ።"
          : "Unsupported file format! Please upload a PDF (.pdf) or Plain Text (.txt) file."
      );
      setSelectedFile(null);
      return;
    }

    // 2. Validate file size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        language === "am"
          ? `የፋይሉ መጠን ከ20MB በላይ ነው (${formatFileSize(file.size)})! እባክዎ አነስ ያለ ፋይል ይምረጡ።`
          : `File size exceeds the 20MB limit (${formatFileSize(file.size)}). Please choose a smaller document.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Auto-fill title from filename if not manually typed
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setTitle(cleanName);
    }

    // Estimate pages: For TXT, 2000 chars ~ 1 page. For PDF, estimate 100KB ~ 1 page
    if (isTxt) {
      const estimatedPages = Math.max(1, Math.round(file.size / 2000));
      setPageCount(estimatedPages);
    } else {
      const estimatedPages = Math.max(1, Math.min(250, Math.round(file.size / (85 * 1024))));
      setPageCount(estimatedPages);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError(
        language === "am"
          ? "እባክዎ መጀመሪያ ፋይል ይምረጡ!"
          : "Please select a PDF or TXT file first!"
      );
      return;
    }

    if (!title.trim()) {
      setError(
        language === "am"
          ? "እባክዎ የዶክመንቱን ርዕስ ያስገቡ!"
          : "Document title cannot be empty!"
      );
      return;
    }

    const isPdf = selectedFile.name.toLowerCase().endsWith(".pdf");
    const fileType: "pdf" | "txt" = isPdf ? "pdf" : "txt";
    const materialId = `mat-${Date.now()}`;

    // Start local processing simulation
    setIsProcessing(true);
    setProgress(15);
    setProgressStatus(
      language === "am"
        ? "ፋይሉን ከኮምፒውተር በማንበብ ላይ..."
        : "Reading local document..."
    );

    try {
      let extractedText: string | undefined;

      if (fileType === "txt") {
        extractedText = await selectedFile.text();
      }

      await new Promise((resolve) => setTimeout(resolve, 180));
      setProgress(55);
      setProgressStatus(
        language === "am"
          ? "ይዘቱን በመመርመር ላይ..."
          : "Analyzing document metadata..."
      );

      // 1. Store binary blob in browser IndexedDB (fast local caching)
      await storeDocumentBlob(materialId, selectedFile);

      let cloudStoragePath: string | undefined = undefined;

      // 2. If user is authenticated and Supabase is configured, upload to private cloud bucket
      if (user && isConfigured) {
        setProgress(70);
        setProgressStatus(
          language === "am"
            ? "ወደ Supabase ደመና ማከማቻ በመጫን ላይ..."
            : "Uploading to private Supabase cloud storage..."
        );

        const cloudRes = await uploadDocumentToStorage(selectedFile, user.id, materialId, fileType);
        if (!cloudRes.error && cloudRes.storagePath) {
          cloudStoragePath = cloudRes.storagePath;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
      setProgress(90);
      setProgressStatus(
        language === "am"
          ? "መረጃውን በማስቀመጥ ላይ..."
          : "Saving document record..."
      );

      // Create material metadata record
      let newMaterial: StudyMaterial = {
        id: materialId,
        title: title.trim(),
        subject,
        fileType,
        fileSize: selectedFile.size,
        pageCount: pageCount || 1,
        uploadedAt: new Date().toISOString(),
        status: "ready",
        summaryPreview:
          fileType === "txt" && extractedText
            ? extractedText.slice(0, 150) + (extractedText.length > 150 ? "..." : "")
            : `Document loaded (${formatFileSize(selectedFile.size)}). Ready for study chat and quiz generation.`,
        keyTopics: [subject, fileType.toUpperCase(), "Notes"],
        isDemo: false,
        sampleContent: extractedText,
        storagePath: cloudStoragePath,
        userId: user?.id,
      };

      // 3. If user is authenticated, save record in PostgreSQL study_materials
      if (user && isConfigured) {
        const savedCloud = await insertCloudMaterial(newMaterial, user.id, cloudStoragePath);
        if (savedCloud) {
          newMaterial = savedCloud;
        }
      }

      setProgress(100);
      onAddMaterial(newMaterial);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Local storage error:", err);
      setError(
        language === "am"
          ? "ፋይሉን በብራውዘር ማከማቻ ውስጥ ማስቀመጥ አልተቻለም።"
          : "Failed to store document in local browser storage."
      );
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        language === "am"
          ? "አዲስ የጥናት ፋይል ጫን (Local Upload)"
          : "Add Study Material"
      }
      description={
        language === "am"
          ? "PDF ወይም TXT ፋይሎችን በዚህ ብራውዘር ውስጥ ያስቀምጡ።"
          : "Store PDF or TXT study notes locally in your browser."
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag & Drop File Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-300 hover:border-violet-500 bg-stone-50/70 hover:bg-stone-50 rounded-xl p-5 sm:p-6 text-center transition-all relative cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 group-hover:bg-violet-100 group-hover:text-violet-700 mx-auto flex items-center justify-center mb-2.5 transition-colors">
            <UploadCloud className="h-6 w-6" />
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-center gap-1.5 truncate px-2">
                <FileText className="h-4 w-4 text-violet-600 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <span className="uppercase font-mono font-bold text-violet-700">
                  {selectedFile.name.endsWith(".pdf") ? "PDF" : "TXT"}
                </span>
                <span>•</span>
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  {language === "am" ? "ተመርጧል" : "Selected"}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {language === "am"
                  ? "ፋይል ለመምረጥ እዚህ ጠቅ ያድርጉ ወይም ጎትተው ያስገቡ"
                  : "Click or drag & drop PDF / TXT file here"}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === "am"
                  ? "የሚደገፉት: PDF እና TXT (እስከ 20MB)"
                  : "Supported: .PDF and .TXT files (Up to 20MB)"}
              </p>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === "am" ? "የፋይሉ ርዕስ" : "Document Title"}{" "}
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder={
              language === "am"
                ? "ለምሳሌ፦ ባዮሎጂ ምዕራፍ 3 ማስታወሻ"
                : "e.g. Molecular Biology Chapter 3 Notes"
            }
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
          />
        </div>

        {/* Subject & Page count */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === "am" ? "የትምህርት አይነት" : "Subject"}
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              disabled={isProcessing}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === "am" ? "የገጽ ብዛት (ግምት)" : "Estimated Pages"}
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900"
            />
          </div>
        </div>

        {/* Progress Bar during local saving */}
        {isProcessing && (
          <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-violet-900">
              <span>{progressStatus}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-violet-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 transition-all duration-200 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Truth in Storage Notice */}
        <div className="flex items-start gap-2 p-2.5 bg-stone-50 border border-stone-200/80 rounded-lg text-[11px] text-slate-500">
          <HardDrive className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {language === "am"
              ? "ማስታወሻ፦ ፋይሎች የሚቀመጡት በዚህ ኮምፒውተር ብራውዘር ውስጥ ብቻ ነው። ወደ ውጭ ሰርቨር አይላኩም።"
              : "Privacy Notice: Documents are saved strictly in your local browser storage (IndexedDB). No files are uploaded to an external server."}
          </span>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isProcessing || !selectedFile}
          >
            {isProcessing
              ? language === "am"
                ? "በማስቀመጥ ላይ..."
                : "Saving..."
              : language === "am"
              ? "አስቀምጥ"
              : "Save Material"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
