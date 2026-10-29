import { getSupabaseBrowserClient } from "./supabase/client";
import { StudyMaterial, StudyTask, Quiz, QuizAttempt, ChatMessage } from "@/types";
import { AISummarizeResponse } from "@/types/ai";
import { getDocumentBlob } from "./file-storage";
import { uploadDocumentToStorage } from "./cloud-storage";

// ==============================================================================
// 1. STUDY MATERIALS
// ==============================================================================

export async function fetchCloudMaterials(userId: string): Promise<StudyMaterial[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    subject: row.subject,
    fileType: row.file_type,
    fileSize: Number(row.file_size),
    pageCount: row.page_count,
    uploadedAt: new Date(row.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: row.status,
    sampleContent: row.sample_content,
    summaryPreview: row.summary_preview,
    keyTopics: row.key_topics || [],
    storagePath: row.storage_path,
    userId: row.user_id,
  }));
}

export async function insertCloudMaterial(
  material: StudyMaterial,
  userId: string,
  storagePath?: string
): Promise<StudyMaterial | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("study_materials")
    .insert({
      id: material.id.includes("-") && material.id.length === 36 ? material.id : undefined,
      user_id: userId,
      title: material.title,
      subject: material.subject,
      file_type: material.fileType,
      file_size: material.fileSize,
      page_count: material.pageCount,
      storage_path: storagePath || material.storagePath,
      status: material.status,
      sample_content: material.sampleContent,
      summary_preview: material.summaryPreview,
      key_topics: material.keyTopics || [],
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...material,
    id: data.id,
    storagePath: data.storage_path,
    userId: data.user_id,
  };
}

export async function deleteCloudMaterial(materialId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("study_materials")
    .delete()
    .eq("id", materialId)
    .eq("user_id", userId);

  return !error;
}

// ==============================================================================
// 2. STUDY TASKS (PLANNER)
// ==============================================================================

export async function fetchCloudTasks(userId: string): Promise<StudyTask[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("study_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    subject: row.subject,
    dueDate: row.due_date,
    priority: row.priority,
    completed: row.completed,
    estimatedMinutes: row.estimated_minutes,
    notes: row.notes || "",
    createdAt: row.created_at,
  }));
}

export async function insertCloudTask(task: StudyTask, userId: string): Promise<StudyTask | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("study_tasks")
    .insert({
      user_id: userId,
      title: task.title,
      subject: task.subject,
      due_date: task.dueDate,
      priority: task.priority,
      completed: task.completed,
      estimated_minutes: task.estimatedMinutes,
      notes: task.notes,
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    ...task,
    id: data.id,
  };
}

export async function updateCloudTask(
  taskId: string,
  updates: Partial<StudyTask>,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("study_tasks")
    .update(dbUpdates)
    .eq("id", taskId)
    .eq("user_id", userId);

  return !error;
}

export async function deleteCloudTask(taskId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("study_tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  return !error;
}

// ==============================================================================
// 3. DOCUMENT SUMMARIES
// ==============================================================================

export async function saveCloudSummary(
  summary: AISummarizeResponse,
  materialId: string,
  title: string,
  subject: string,
  userId: string,
  language = "en"
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("document_summaries").insert({
    user_id: userId,
    material_id: materialId.includes("-") && materialId.length === 36 ? materialId : null,
    title,
    subject,
    overview: summary.overview,
    sections: summary.sections,
    key_definitions: summary.keyDefinitions,
    takeaways: summary.takeaways,
    language,
  });

  return !error;
}

// ==============================================================================
// 4. QUIZZES & ATTEMPTS
// ==============================================================================

export async function saveCloudQuiz(quiz: Quiz, userId: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      user_id: userId,
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description,
      time_limit_minutes: quiz.timeLimitMinutes,
    })
    .select("id")
    .single();

  if (quizError || !quizData) return null;

  const quizId = quizData.id;

  if (quiz.questions && quiz.questions.length > 0) {
    const questionsToInsert = quiz.questions.map((q, idx) => ({
      quiz_id: quizId,
      question: q.question,
      options: q.options,
      correct_answer_index: q.correctAnswerIndex,
      explanation: q.explanation,
      topic: q.topic,
      sort_order: idx,
    }));

    await supabase.from("quiz_questions").insert(questionsToInsert);
  }

  return quizId;
}

export async function saveCloudQuizAttempt(attempt: QuizAttempt, userId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("quiz_attempts").insert({
    quiz_id: attempt.quizId.includes("-") && attempt.quizId.length === 36 ? attempt.quizId : null,
    user_id: userId,
    score: attempt.score,
    total_questions: attempt.totalQuestions,
    user_answers: attempt.userAnswers,
    completed_at: attempt.completedAt,
  });

  return !error;
}

// ==============================================================================
// 5. CHAT SESSIONS & MESSAGES
// ==============================================================================

export async function getOrCreateChatSession(userId: string, materialId?: string, title?: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      material_id: materialId && materialId.includes("-") && materialId.length === 36 ? materialId : null,
      title: title || "Study Session",
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function saveCloudChatMessage(
  sessionId: string,
  userId: string,
  message: ChatMessage
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("chat_messages").insert({
    session_id: sessionId,
    user_id: userId,
    role: message.role,
    content: message.content,
    grounded_in_document: message.groundedInDocument || false,
    material_title: message.materialTitle,
    suggested_follow_ups: message.suggestedFollowUps || [],
    is_error: message.isError || false,
  });

  return !error;
}

// ==============================================================================
// 6. CAREFUL INDEXEDDB -> CLOUD MIGRATION UTILITY
// ==============================================================================

export interface MigrationProgress {
  total: number;
  completed: number;
  currentTitle: string;
  errors: string[];
}

/**
 * Carefully migrates local IndexedDB files and materials to Supabase Storage & PostgreSQL.
 * NEVER deletes or alters local records before verifying cloud upload success.
 */
export async function migrateLocalDataToCloud(
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<{ success: boolean; migratedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let migratedCount = 0;

  if (typeof window === "undefined") {
    return { success: false, migratedCount: 0, errors: ["Cannot migrate on server."] };
  }

  // 1. Read local materials
  let localMaterials: StudyMaterial[] = [];
  try {
    const raw = localStorage.getItem("ai_study_materials");
    if (raw) {
      localMaterials = JSON.parse(raw);
    }
  } catch {
    // Ignore
  }

  const materialsToMigrate = localMaterials.filter((m) => !m.isDemo && !m.storagePath);
  const total = materialsToMigrate.length;

  for (let i = 0; i < materialsToMigrate.length; i++) {
    const mat = materialsToMigrate[i];
    onProgress?.({
      total,
      completed: i,
      currentTitle: mat.title,
      errors,
    });

    try {
      // 1. Retrieve Blob from local IndexedDB
      const blob = await getDocumentBlob(mat.id);
      let storagePath: string | undefined = undefined;

      if (blob) {
        // 2. Upload to Supabase private storage bucket
        const uploadRes = await uploadDocumentToStorage(blob, userId, mat.id, mat.fileType);
        if (uploadRes.error || !uploadRes.storagePath) {
          errors.push(`File upload failed for "${mat.title}": ${uploadRes.error}`);
          continue;
        }
        storagePath = uploadRes.storagePath;
      }

      // 3. Save database row in PostgreSQL
      const saved = await insertCloudMaterial(mat, userId, storagePath);
      if (!saved) {
        errors.push(`Failed to save record in database for "${mat.title}".`);
        continue;
      }

      // 4. Update local item with cloud storage path
      mat.storagePath = storagePath;
      mat.userId = userId;
      migratedCount++;
    } catch (err: unknown) {
      errors.push(`Migration exception on "${mat.title}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Save updated local materials containing storagePath references
  try {
    localStorage.setItem("ai_study_materials", JSON.stringify(localMaterials));
  } catch {
    // Ignore
  }

  onProgress?.({
    total,
    completed: total,
    currentTitle: "Finished",
    errors,
  });

  return {
    success: errors.length === 0,
    migratedCount,
    errors,
  };
}
