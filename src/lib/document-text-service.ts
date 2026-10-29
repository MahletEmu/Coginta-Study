import { StudyMaterial } from "@/types";
import { getDocumentBlob } from "@/lib/file-storage";
import { ExtractTextResponse } from "@/types/ai";

export interface ExtractedDocumentContent {
  text: string;
  totalPages?: number;
  isScanned?: boolean;
  warning?: string;
  error?: string;
}

// In-memory cache for extracted text to prevent re-extracting same PDF multiple times in session
const textCache = new Map<string, string>();

/**
 * Retrieves the readable text of a study material.
 * - Uses sampleContent for built-in demo materials.
 * - For local TXT files, reads directly in the browser via Blob.text().
 * - For local PDF files, sends the blob to the server /api/ai/extract-text endpoint.
 */
export async function getMaterialText(
  material: StudyMaterial
): Promise<ExtractedDocumentContent> {
  // 1. Check in-memory cache
  if (textCache.has(material.id)) {
    return {
      text: textCache.get(material.id)!,
      totalPages: material.pageCount,
      isScanned: false,
    };
  }

  // 2. Check sampleContent (Demo materials or small notes)
  if (material.sampleContent && material.sampleContent.trim().length > 0) {
    textCache.set(material.id, material.sampleContent);
    return {
      text: material.sampleContent,
      totalPages: material.pageCount || 1,
      isScanned: false,
    };
  }

  // 3. Retrieve Blob from local browser IndexedDB
  const blob = await getDocumentBlob(material.id);

  if (!blob) {
    // If it's a demo material without raw blob, generate a rich representative text from summary & topics
    if (material.isDemo) {
      const demoText = `STUDY MATERIAL: ${material.title}
Subject: ${material.subject}
Pages: ${material.pageCount || 10}

KEY SUMMARY:
${material.summaryPreview || "Comprehensive academic revision notes."}

CORE TOPICS & CONCEPTS COVERED:
${(material.keyTopics || []).map((t) => `- ${t}: Detailed analytical principles, exam mechanisms, and practical problem breakdowns.`).join("\n")}

ACADEMIC NOTES:
This document covers fundamental theoretical foundations and applied problem sets for ${material.subject}. Students should focus on understanding the core mechanisms rather than rote memorization.`;

      textCache.set(material.id, demoText);
      return {
        text: demoText,
        totalPages: material.pageCount || 10,
        isScanned: false,
      };
    }

    return {
      text: "",
      error: "No local file content found in browser storage for this document.",
    };
  }

  // 4. Handle TXT directly in browser
  if (material.fileType === "txt") {
    try {
      const text = await blob.text();
      textCache.set(material.id, text);
      return {
        text,
        totalPages: material.pageCount || 1,
        isScanned: false,
      };
    } catch (err) {
      console.error("Error reading TXT blob:", err);
      return {
        text: "",
        error: "Failed to read local text file.",
      };
    }
  }

  // 5. Handle PDF via /api/ai/extract-text
  try {
    const formData = new FormData();
    formData.append("file", blob, material.title);

    const res = await fetch("/api/ai/extract-text", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as ExtractTextResponse;
      return {
        text: "",
        error: data.error || `Server extraction failed with status ${res.status}`,
      };
    }

    const data = (await res.json()) as ExtractTextResponse;

    if (data.success && data.text) {
      textCache.set(material.id, data.text);
    }

    return {
      text: data.text,
      totalPages: data.totalPages,
      isScanned: data.isScanned,
      warning: data.warning,
      error: data.error,
    };
  } catch (err) {
    console.error("Error sending PDF to extract-text endpoint:", err);
    return {
      text: "",
      error: "Network error while extracting text from PDF.",
    };
  }
}
