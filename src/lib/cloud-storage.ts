import { getSupabaseBrowserClient } from "./supabase/client";

export const STORAGE_BUCKET = "study-documents";
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB limit

const ALLOWED_MIME_TYPES = ["application/pdf", "text/plain", "text/markdown"];

/**
 * Validates a file before upload.
 */
export function validateStorageFile(file: File | Blob): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    // Some plain text files may have empty mime type or text/plain
    if (!file.type.startsWith("text/")) {
      return {
        valid: false,
        error: "Only PDF (.pdf) and plain text (.txt) documents are supported.",
      };
    }
  }

  return { valid: true };
}

/**
 * Uploads a document to the private 'study-documents' bucket under the user's folder.
 * Path format: <user_id>/<material_id>.<ext>
 */
export async function uploadDocumentToStorage(
  file: File | Blob,
  userId: string,
  materialId: string,
  fileType: string
): Promise<{ storagePath: string | null; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { storagePath: null, error: "Cloud storage is not configured." };
  }

  const validation = validateStorageFile(file);
  if (!validation.valid) {
    return { storagePath: null, error: validation.error };
  }

  const extension = fileType === "pdf" ? "pdf" : "txt";
  const storagePath = `${userId}/${materialId}.${extension}`;

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return { storagePath: null, error: error.message };
    }

    return { storagePath, error: undefined };
  } catch (err: unknown) {
    return {
      storagePath: null,
      error: err instanceof Error ? err.message : "Failed to upload document to cloud storage.",
    };
  }
}

/**
 * Securely downloads a document blob from the private bucket.
 */
export async function downloadDocumentFromStorage(
  storagePath: string
): Promise<{ blob: Blob | null; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { blob: null, error: "Cloud storage is not configured." };
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (error || !data) {
      return { blob: null, error: error?.message || "File could not be downloaded." };
    }

    return { blob: data, error: undefined };
  } catch (err: unknown) {
    return {
      blob: null,
      error: err instanceof Error ? err.message : "Download failed.",
    };
  }
}

/**
 * Generates a short-lived signed URL for browser preview or download.
 */
export async function getSignedDocumentUrl(
  storagePath: string,
  expiresInSeconds = 300
): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * Deletes a document from Supabase storage.
 */
export async function deleteDocumentFromStorage(storagePath: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    return !error;
  } catch {
    return false;
  }
}
