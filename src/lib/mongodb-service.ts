import { getMongoDb } from "./mongodb";
import { StudyMaterial, StudyTask, Quiz, ChatMessage } from "@/types";

export interface MongoStudyMaterial extends Omit<StudyMaterial, "id"> {
  _id?: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoChatMessage {
  _id?: string;
  sessionId: string;
  userId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  materialTitle?: string;
  groundedInDocument?: boolean;
  createdAt: Date;
}

export interface MongoQuizResult {
  _id?: string;
  userId?: string;
  quizId: string;
  title: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

/**
 * Checks whether the MongoDB connection is alive and working.
 */
export async function checkMongoConnection(): Promise<{
  connected: boolean;
  database?: string;
  error?: string;
}> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return { connected: false, error: "MongoDB unreachable or cooldown active. Resilient local storage is operational." };
    }
    await db.command({ ping: 1 });
    return { connected: true, database: db.databaseName };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to connect to MongoDB.";
    return { connected: false, error: errorMsg };
  }
}

/**
 * Saves or updates a study material in MongoDB.
 */
export async function saveMongoMaterial(material: StudyMaterial): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const collection = db.collection<MongoStudyMaterial>("study_materials");

    await collection.updateOne(
      { id: material.id },
      {
        $set: {
          ...material,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.warn("MongoDB save material fallback:", (err as Error).message);
    return false;
  }
}

/**
 * Retrieves all study materials stored in MongoDB.
 */
export async function getMongoMaterials(): Promise<StudyMaterial[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const collection = db.collection<MongoStudyMaterial>("study_materials");
    const docs = await collection.find({}).sort({ updatedAt: -1 }).toArray();

    return docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      subject: doc.subject,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      pageCount: doc.pageCount,
      uploadedAt: doc.uploadedAt,
      status: doc.status,
      summaryPreview: doc.summaryPreview,
      keyTopics: doc.keyTopics,
      isDemo: doc.isDemo,
      sampleContent: doc.sampleContent,
    }));
  } catch (err) {
    console.warn("MongoDB fetch materials fallback:", (err as Error).message);
    return [];
  }
}

/**
 * Saves a chat message to MongoDB.
 */
export async function saveMongoChatMessage(
  sessionId: string,
  message: ChatMessage,
  userId = "student-local"
): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const collection = db.collection<MongoChatMessage>("chat_messages");

    await collection.insertOne({
      sessionId,
      userId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      materialTitle: message.materialTitle,
      groundedInDocument: message.groundedInDocument,
      createdAt: new Date(),
    });
    return true;
  } catch (err) {
    console.warn("MongoDB save chat message fallback:", (err as Error).message);
    return false;
  }
}

/**
 * Saves a completed quiz result to MongoDB.
 */
export async function saveMongoQuizResult(result: {
  quizId: string;
  title: string;
  subject: string;
  score: number;
  totalQuestions: number;
  userId?: string;
}): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const collection = db.collection<MongoQuizResult>("quiz_results");

    await collection.insertOne({
      ...result,
      percentage: Math.round((result.score / result.totalQuestions) * 100),
      completedAt: new Date(),
    });
    return true;
  } catch (err) {
    console.warn("MongoDB save quiz result fallback:", (err as Error).message);
    return false;
  }
}

/**
 * Saves or updates a study task in MongoDB.
 */
export async function saveMongoTask(task: StudyTask): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const collection = db.collection("study_tasks");

    await collection.updateOne(
      { id: task.id },
      {
        $set: {
          ...task,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.warn("MongoDB save task fallback:", (err as Error).message);
    return false;
  }
}
