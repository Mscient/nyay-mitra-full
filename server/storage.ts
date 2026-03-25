import { eq, desc, and } from "drizzle-orm";
import db from "./db";
import {
  users, sessions, messages, bookmarks,
  type User, type PublicUser, type InsertUser,
  type Session, type InsertSession,
  type Message, type InsertMessage,
  type Bookmark, type InsertBookmark,
} from "@shared/schema";
import { encryptPII, decryptPII } from "./lib/crypto";

function encryptUser(data: Partial<InsertUser>): Partial<InsertUser> {
  const result = { ...data };
  if (result.name) result.name = encryptPII(result.name) as string;
  if (result.openaiApiKey) result.openaiApiKey = encryptPII(result.openaiApiKey) as string;
  return result;
}

function decryptUser<T extends User | undefined>(user: T): T {
  if (!user) return user;
  const result = { ...user };
  if (result.name) result.name = decryptPII(result.name) as string;
  if (result.openaiApiKey) result.openaiApiKey = decryptPII(result.openaiApiKey) as string;
  return result as T;
}

export interface IStorage {
  // Users
  createUser(data: InsertUser): User;
  getUserById(id: string): User | undefined;
  getUserByEmail(email: string): User | undefined;
  getUserByGoogleId(googleId: string): User | undefined;
  updateUserLanguage(id: string, lang: string): User | undefined;
  updateUserApiKey(id: string, apiKey: string | null): User | undefined;
  updateUserGoogleId(id: string, googleId: string): User | undefined;

  // Sessions
  listSessions(userId?: string): Session[];
  createSession(data: InsertSession): Session;
  getSession(id: string): Session | undefined;
  updateSessionTitle(id: string, title: string): Session | undefined;
  deleteSession(id: string): boolean;

  // Messages
  listMessages(sessionId: string): Message[];
  createMessage(data: InsertMessage): Message;

  // Bookmarks
  listBookmarks(userId?: string): Bookmark[];
  createBookmark(data: InsertBookmark): Bookmark;
  deleteBookmark(id: string): boolean;
}

class DatabaseStorage implements IStorage {
  // ── Users ──────────────────────────────────────────────────────
  createUser(data: InsertUser): User {
    const encryptedData = encryptUser(data) as InsertUser;
    const result = db.insert(users).values({ ...encryptedData, createdAt: new Date() }).returning().get()!;
    return decryptUser(result);
  }

  getUserById(id: string): User | undefined {
    return decryptUser(db.select().from(users).where(eq(users.id, id)).get());
  }

  getUserByEmail(email: string): User | undefined {
    return decryptUser(db.select().from(users).where(eq(users.email, email)).get());
  }

  updateUserLanguage(id: string, lang: string): User | undefined {
    const result = db.update(users)
      .set({ preferredLanguage: lang })
      .where(eq(users.id, id))
      .returning()
      .get();
    return decryptUser(result);
  }

  getUserByGoogleId(googleId: string): User | undefined {
    return decryptUser(db.select().from(users).where(eq(users.googleId, googleId)).get());
  }

  updateUserApiKey(id: string, apiKey: string | null): User | undefined {
    const encryptedKey = apiKey ? encryptPII(apiKey) : null;
    const result = db.update(users)
      .set({ openaiApiKey: encryptedKey as string })
      .where(eq(users.id, id))
      .returning()
      .get();
    return decryptUser(result);
  }

  updateUserGoogleId(id: string, googleId: string): User | undefined {
    const result = db.update(users)
      .set({ googleId })
      .where(eq(users.id, id))
      .returning()
      .get();
    return decryptUser(result);
  }

  // ── Sessions ───────────────────────────────────────────────────
  listSessions(userId?: string): Session[] {
    if (userId) {
      return db.select().from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.updatedAt))
        .all();
    }
    return db.select().from(sessions)
      .orderBy(desc(sessions.updatedAt))
      .all();
  }

  createSession(data: InsertSession): Session {
    const now = new Date();
    return db.insert(sessions).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning().get()!;
  }

  getSession(id: string): Session | undefined {
    return db.select().from(sessions).where(eq(sessions.id, id)).get();
  }

  updateSessionTitle(id: string, title: string): Session | undefined {
    return db.update(sessions)
      .set({ title, updatedAt: new Date() })
      .where(eq(sessions.id, id))
      .returning()
      .get();
  }

  deleteSession(id: string): boolean {
    const result = db.delete(sessions).where(eq(sessions.id, id)).run();
    return result.changes > 0;
  }

  // ── Messages ───────────────────────────────────────────────────
  listMessages(sessionId: string): Message[] {
    return db.select().from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt)
      .all();
  }

  createMessage(data: InsertMessage): Message {
    return db.insert(messages).values({
      ...data,
      createdAt: new Date(),
    }).returning().get()!;
  }

  // ── Bookmarks ──────────────────────────────────────────────────
  listBookmarks(userId?: string): Bookmark[] {
    if (userId) {
      return db.select().from(bookmarks)
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt))
        .all();
    }
    return db.select().from(bookmarks)
      .orderBy(desc(bookmarks.createdAt))
      .all();
  }

  createBookmark(data: InsertBookmark): Bookmark {
    return db.insert(bookmarks).values({
      ...data,
      createdAt: new Date(),
    }).returning().get()!;
  }

  deleteBookmark(id: string): boolean {
    const result = db.delete(bookmarks).where(eq(bookmarks.id, id)).run();
    return result.changes > 0;
  }
}

export const storage = new DatabaseStorage();
