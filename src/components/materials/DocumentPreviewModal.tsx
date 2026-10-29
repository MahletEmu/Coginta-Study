"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StudyMaterial } from "@/types";
import { getDocumentBlob, storeDocumentBlob } from "@/lib/file-storage";
import { downloadDocumentFromStorage } from "@/lib/cloud-storage";
import { formatFileSize, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileText,
  Download,
  ExternalLink,
  Clock,
  HardDrive,
  Info,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: StudyMaterial | null;
  onSummarize?: (material: StudyMaterial) => void;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  material,
  onSummarize,
}: DocumentPreviewModalProps) {
  const { language } = useLanguage();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let activeUrl: string | null = null;
    let isMounted = true;

    async function loadContent() {
      if (!material || !isOpen) {
        setBlob(null);
        setTextContent(null);
        setPdfUrl(null);
        return;
      }

      setIsLoading(true);
      try {
        let storedBlob = await getDocumentBlob(material.id);

        // If not in local IndexedDB but has cloud storage path, download from Supabase Storage
        if (!storedBlob && material.storagePath) {
          const downloadRes = await downloadDocumentFromStorage(material.storagePath);
          if (downloadRes.blob) {
            storedBlob = downloadRes.blob;
            // Cache in local IndexedDB for instant future reads
            await storeDocumentBlob(material.id, storedBlob);
          }
        }

        if (!isMounted) return;

        setBlob(storedBlob);

        if (material.fileType === "txt") {
          if (storedBlob) {
            const text = await storedBlob.text();
            if (isMounted) setTextContent(text);
          } else if (material.sampleContent) {
            if (isMounted) setTextContent(material.sampleContent);
          } else {
            if (isMounted) {
              setTextContent(
                language === "am"
                  ? "የዚህ ፋይል ይዘት በአካባቢው ማከማቻ ውስጥ አልተገኘም።"
                  : "No text content found for this document in local browser storage."
              );
            }
          }
        } else if (material.fileType === "pdf") {
          if (storedBlob) {
            activeUrl = URL.createObjectURL(storedBlob);
            if (isMounted) setPdfUrl(activeUrl);
          }
        }
      } catch (err) {
        console.error("Failed to load document content:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadContent();

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [material, isOpen, language]);

  if (!material) return null;

  const handleDownload = () => {
    let downloadBlob = blob;
    if (!downloadBlob && textContent) {
      downloadBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    }

    if (downloadBlob) {
      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = material.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert(
        language === "am"
          ? "ይህ የሙከራ (Demo) ፋይል ስለሆነ የሚወርድ እውነተኛ ፒዲኤፍ የለውም። እባክዎ ከኮምፒውተርዎ ፋይል ጭነው ይሞክሩ።"
          : "This is a sample demo material. Real uploaded files can be downloaded directly."
      );
    }
  };

  const handleOpenPdfTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  const isPdf = material.fileType === "pdf";
  const isTxt = material.fileType === "txt";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={material.title}
      description={
        language === "am"
          ? "የጥናት ማስታወሻ ቅድመ-እይታ (Local Document Preview)"
          : "Local Document Reader & Preview"
      }
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Document Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{material.subject}</Badge>
            <span className="uppercase font-mono font-bold text-[11px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md">
              {material.fileType}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 flex items-center gap-1 font-medium">
              <HardDrive className="h-3.5 w-3.5 text-slate-400" />
              {formatFileSize(material.fileSize)}
            </span>
            {material.pageCount && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  {material.pageCount} {language === "am" ? "ገጾች" : "pages"}
                </span>
              </>
            )}
            <span className="text-slate-400">•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(material.uploadedAt)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPdfTab}
                className="gap-1.5 text-xs h-7"
              >
                <ExternalLink className="h-3 w-3" />
                <span>{language === "am" ? "በአዲስ ገጽ ክፈት" : "Open in Tab"}</span>
              </Button>
            )}
            {onSummarize && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onSummarize(material);
                }}
                className="gap-1.5 text-xs h-7 text-violet-700 hover:bg-violet-50"
              >
                <Sparkles className="h-3 w-3" />
                <span>{language === "am" ? "ማጠቃለያ" : "Summarize"}</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 text-xs h-7"
            >
              <Download className="h-3 w-3" />
              <span>{language === "am" ? "አውርድ" : "Download"}</span>
            </Button>
          </div>
        </div>

        {/* Preview Viewer Body */}
        <div className="min-h-[320px] max-h-[500px] overflow-y-auto bg-stone-900 rounded-xl border border-stone-800 text-stone-100 p-4 sm:p-6 font-mono text-xs shadow-inner">
          {isLoading ? (
            <div className="py-20 text-center text-stone-400 space-y-2">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">
                {language === "am"
                  ? "ማስታወሻውን ከብራውዘር ማከማቻ በማንበብ ላይ..."
                  : "Loading document from browser storage..."}
              </p>
            </div>
          ) : isTxt && textContent ? (
            /* Safe TXT Reader View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-[11px] text-stone-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                  <span>
                    {language === "am" ? "ጽሑፍ አንባቢ (Safe TXT Reader)" : "Safe TXT Document Viewer"}
                  </span>
                </span>
                <span>
                  {textContent.length} {language === "am" ? "ፊደላት" : "characters"}
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-[13px] leading-relaxed text-stone-200 select-text">
                {textContent}
              </pre>
            </div>
          ) : isPdf && pdfUrl ? (
            /* Embedded PDF Viewer */
            <div className="w-full h-[450px] rounded-lg overflow-hidden bg-white">
              <iframe
                src={`${pdfUrl}#toolbar=1`}
                title={material.title}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            /* Fallback state for Demo PDFs or unavailable blobs */
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-800 text-violet-400 mx-auto flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-200">
                  {language === "am"
                    ? "የሙከራ ናሙና ዶክመንት (Sample Demo)"
                    : "Sample Demo Document"}
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {material.summaryPreview ||
                    (language === "am"
                      ? "ይህ ፋይል ለዲዛይን ማሳያ የተቀመጠ ናሙና ነው። ከኮምፒውተርዎ ላይ አዲስ PDF ወይም TXT ሲጭኑ ሙሉ ይዘቱ በዚህ ሳጥን ውስጥ በቀጥታ ይነበባል።"
                      : "This is a built-in demo sample. Any PDF or TXT you upload from your computer in Stage 2 can be previewed directly here.")}
                </p>
              </div>

              {material.keyTopics && material.keyTopics.length > 0 && (
                <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                  {material.keyTopics.map((top) => (
                    <span
                      key={top}
                      className="text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md"
                    >
                      #{top}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-3 bg-stone-800/80 rounded-lg text-[11px] text-stone-300 flex items-start gap-2 text-left mt-3">
                <Info className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  {language === "am"
                    ? "በቀጣዩ ምዕራፍ የ AI ሞዴሉ እነዚህን ፋይሎች ሙሉ በሙሉ አንብቦ ማጠቃለያና ጥያቄዎችን በራስ-ሰር ያመነጫል።"
                    : "In future stages, real AI models will extract concepts, chapter summaries, and auto-generate quizzes from these uploaded documents."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>
            {language === "am"
              ? "🔒 ፋይሎች በኮምፒውተርዎ ብራውዘር ውስጥ ብቻ ይቀመጣሉ (Browser Local Storage)"
              : "🔒 Files are stored securely in browser storage on this device only."}
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            {language === "am" ? "ዝጋ" : "Close"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
