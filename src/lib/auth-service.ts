import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getMongoDb } from "./mongodb";
import { UserProfile } from "@/types";

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  major?: string;
  createdAt: string;
}

const JWT_SECRET = process.env.AUTH_SECRET || "cognita-ai-study-secret-key-2026-secure";
const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocalUsers(): UserRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const data = fs.readFileSync(LOCAL_USERS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read local users:", err);
  }
  return [];
}

function writeLocalUsers(users: UserRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write local users:", err);
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

export function createSessionToken(profile: UserProfile): string {
  const payload = JSON.stringify({
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    major: profile.major,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): UserProfile | null {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      major: payload.major,
    };
  } catch {
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // Try MongoDB first
  try {
    const db = await getMongoDb();
    if (db) {
      const doc = await db.collection<UserRecord>("users").findOne({ email: normalizedEmail });
      if (doc) {
        return {
          id: doc.id || (doc._id as unknown as string),
          email: doc.email,
          fullName: doc.fullName,
          passwordHash: doc.passwordHash,
          major: doc.major,
          createdAt: doc.createdAt,
        };
      }
    }
  } catch (err) {
    // MongoDB unavailable or port blocked -> fallback to local storage
  }

  // Fallback to local storage
  const localUsers = readLocalUsers();
  const found = localUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  return found || null;
}

export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
  major?: string;
}): Promise<UserProfile> {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const userId = `usr_${crypto.randomBytes(8).toString("hex")}`;
  const passwordHash = hashPassword(data.password);
  const now = new Date().toISOString();

  const userRecord: UserRecord = {
    id: userId,
    email: normalizedEmail,
    fullName: data.fullName.trim(),
    passwordHash,
    major: data.major || "High School & College Prep",
    createdAt: now,
  };

  // Try MongoDB first
  let savedToMongo = false;
  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection("users").insertOne(userRecord);
      savedToMongo = true;
    }
  } catch (err) {
    console.warn("MongoDB write failed, persisting to local resilient storage:", (err as Error).message);
  }

  // Also write to local storage for local resilience
  const localUsers = readLocalUsers();
  localUsers.push(userRecord);
  writeLocalUsers(localUsers);

  return {
    id: userRecord.id,
    email: userRecord.email,
    fullName: userRecord.fullName,
    major: userRecord.major,
    createdAt: userRecord.createdAt,
  };
}
