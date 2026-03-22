import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Users ──────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull().default(""),
  googleId: text("google_id"),
  openaiApiKey: text("openai_api_key"),
  preferredLanguage: text("preferred_language").notNull().default("en"), // en | hi | mr
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  preferredLanguage: z.enum(["en", "hi", "mr"]).default("en"),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;

// ── Chat sessions ──────────────────────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),  // nullable for guest
  title: text("title").notNull().default("New Consultation"),
  category: text("category").notNull().default("general"),
  language: text("language").notNull().default("en"), // en | hi | mr
  status: text("status").notNull().default("open"),   // open | closed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// ── Messages ───────────────────────────────────────────────────────────────
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  language: text("language").notNull().default("en"),
  citations: text("citations"), // JSON array of citation strings
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ── Bookmarks ──────────────────────────────────────────────────────────────
export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  messageId: text("message_id").notNull(),
  note: text("note").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  createdAt: true,
});
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
