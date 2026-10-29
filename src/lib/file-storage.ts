/**
 * Browser-local IndexedDB storage for study document files (Blobs/Files).
 *
 * Why IndexedDB instead of localStorage?
 * - localStorage has a strict ~5MB quota limit across the entire origin.
 * - Storing Base64-encoded PDF files in localStorage will quickly throw QuotaExceededError.
 * - IndexedDB is an asynchronous, structured browser database that can store hundreds of megabytes
 *   of binary Blobs natively without degrading browser memory.
 * - Files stored here remain strictly device-local and private to this browser.
 */

const DB_NAME = "ai_study_files_db";
const STORE_NAME = "document_blobs";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a PDF or TXT Blob into browser IndexedDB linked to a material ID.
 */
export async function storeDocumentBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(blob, id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves a stored PDF or TXT Blob from IndexedDB by material ID.
 */
export async function getDocumentBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Deletes a stored file Blob from IndexedDB when a material is deleted.
 */
export async function deleteDocumentBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore cleanup errors
  }
}
