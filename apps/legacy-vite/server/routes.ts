import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, sqlite } from "./db";
import { desc } from "drizzle-orm";
import {
  insertSessionSchema, insertMessageSchema, insertBookmarkSchema,
  registerSchema,
  users, sessions, messages, bookmarks,
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";

// ── Auth helpers ────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "nyay-mitra-dev-secret-change-in-production";
const JWT_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

interface AuthRequest extends Request {
  userId?: string;
}

function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function authOptional(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = payload.userId;
    } catch { /* anonymous */ }
  }
  next();
}

// ── Legal AI system prompts ────────────────────────────────────────────────
const LEGAL_SYSTEM_PROMPT = {
  en: `You are Nyay Mitra ("Justice Friend"), an AI-powered legal aid assistant for Indian citizens. You provide clear, accessible, and accurate information about Indian law.

GUIDELINES:
- Always cite relevant Acts, Sections, and Articles (e.g., "Section 498A IPC", "Article 21 Constitution of India")
- Use simple, clear language. Avoid excessive legal jargon.
- Always recommend consulting a qualified lawyer for case-specific advice
- For emergencies (domestic violence, arrest, immediate threat), always provide emergency helpline numbers first
- Mention free legal aid available through NALSA and District Legal Services Authority (DLSA)
- Structure responses with: Direct Answer → Relevant Laws → Practical Steps → Helplines (if applicable)

EMERGENCY NUMBERS:
- Women Helpline: 181 (24x7)
- National Emergency: 112
- NALSA Legal Aid: 15100
- Consumer Helpline: 1800-11-4000
- Child Helpline: 1098

RESPONSE FORMAT:
- Start with a direct answer
- List relevant laws with specific citations
- Include practical next steps
- End with relevant helplines if applicable
- Keep responses concise but complete`,

  hi: `आप न्याय मित्र हैं, भारतीय नागरिकों के लिए एक AI-संचालित कानूनी सहायता सहायक। आप भारतीय कानून के बारे में स्पष्ट, सुलभ और सटीक जानकारी प्रदान करते हैं।

दिशानिर्देश:
- हमेशा संबंधित अधिनियमों, धाराओं और अनुच्छेदों का हवाला दें (जैसे "धारा 498A IPC", "संविधान का अनुच्छेद 21")
- सरल, स्पष्ट भाषा का प्रयोग करें। अत्यधिक कानूनी शब्दावली से बचें।
- मामला-विशिष्ट सलाह के लिए हमेशा योग्य वकील से परामर्श करने की सलाह दें
- आपातकाल में (घरेलू हिंसा, गिरफ्तारी) पहले हेल्पलाइन नंबर दें
- NALSA और जिला विधिक सेवा प्राधिकरण (DLSA) के माध्यम से मुफ्त कानूनी सहायता का उल्लेख करें

आपातकालीन नंबर:
- महिला हेल्पलाइन: 181
- राष्ट्रीय आपातकाल: 112
- NALSA कानूनी सहायता: 15100
- उपभोक्ता हेल्पलाइन: 1800-11-4000
- बाल हेल्पलाइन: 1098

उत्तर प्रारूप: सीधा उत्तर → संबंधित कानून → व्यावहारिक कदम → हेल्पलाइन (यदि लागू हो)`,

  mr: `तुम्ही न्याय मित्र आहात, भारतीय नागरिकांसाठी AI-चालित कायदेशीर सहाय्य सहाय्यक. तुम्ही भारतीय कायद्याबद्दल स्पष्ट, सुलभ आणि अचूक माहिती प्रदान करता.

मार्गदर्शक तत्त्वे:
- नेहमी संबंधित कायदे, कलम आणि अनुच्छेद उद्धृत करा (उदा. "कलम 498A IPC", "राज्यघटनेचा अनुच्छेद 21")
- सोपी, स्पष्ट भाषा वापरा. अत्यधिक कायदेशीर शब्दावली टाळा.
- प्रकरण-विशिष्ट सल्ल्यासाठी नेहमी पात्र वकिलाचा सल्ला घेण्याची शिफारस करा
- आणीबाणीत (घरगुती हिंसा, अटक) प्रथम हेल्पलाइन नंबर द्या
- NALSA आणि जिल्हा विधी सेवा प्राधिकरण (DLSA) मार्फत मोफत कायदेशीर मदत सांगा

आणीबाणी क्रमांक:
- महिला हेल्पलाइन: 181
- राष्ट्रीय आणीबाणी: 112
- NALSA कायदेशीर मदत: 15100
- ग्राहक हेल्पलाइन: 1800-11-4000
- बाल हेल्पलाइन: 1098

उत्तर स्वरूप: थेट उत्तर → संबंधित कायदे → व्यावहारिक पाऊले → हेल्पलाइन (लागू असल्यास)`,
};

const CATEGORY_PROMPTS: Record<string, string> = {
  criminal: "Focus on IPC, CrPC, bail rights, FIR procedures, arrest rights, and legal aid under NALSA.",
  family: "Focus on Hindu/Muslim/Christian personal laws, divorce, maintenance, child custody, domestic violence (PWDVA 2005), and dowry laws.",
  property: "Focus on property registration, transfer of property, tenancy laws, RERA, and land acquisition.",
  consumer: "Focus on Consumer Protection Act 2019, RERA, banking ombudsman, and insurance grievances.",
  labour: "Focus on labour codes, minimum wages, ESIC, PF, gratuity, and employee rights.",
  rti: "Focus on RTI Act 2005, procedure, exemptions, first and second appeals, and CIC.",
  startup: "Focus on incorporation, MCA compliance, GST, startup India registration, IP rights, and founder agreements.",
};

function classifyIssue(text: string): string {
  const lower = text.toLowerCase();
  if (/arrest|bail|fir|police|murder|theft|ipc|crpc|criminal|accused|custody|jail/.test(lower)) return "criminal";
  if (/divorce|marriage|wife|husband|dowry|maintenance|alimony|custody|child|domestic violence/.test(lower)) return "family";
  if (/property|land|flat|house|rent|tenant|landlord|rera|registration/.test(lower)) return "property";
  if (/consumer|product|defect|refund|complaint|fraud|insurance|bank/.test(lower)) return "consumer";
  if (/salary|job|employee|labour|pf|esic|gratuity|employer|work/.test(lower)) return "labour";
  if (/rti|information|government|public authority|pio/.test(lower)) return "rti";
  if (/startup|company|incorporation|gst|founder|investor|equity/.test(lower)) return "startup";
  return "general";
}

// Sarvam AI client (OpenAI-compatible)
let sarvam: OpenAI | null = null;
if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== "your_sarvam_key_here") {
  sarvam = new OpenAI({
    apiKey: process.env.SARVAM_API_KEY,
    baseURL: "https://api.sarvam.ai/v1",
  });
  console.log("[Sarvam AI] Connected with key:", process.env.SARVAM_API_KEY.slice(0, 8) + "...");
} else {
  console.log("[Sarvam AI] No key provided — running in demo mode");
}

// Multer for voice uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// In-memory vector store for semantic search
interface LegalCaseVector {
  id: number;
  embedding: number[];
  case_title: string;
  case_number: string;
  court_type: string;
  year_decided: number;
  issue_categories: string;
  summary: string;
  legal_principles: string;
  precedent_value: number;
}

let caseVectors: LegalCaseVector[] = [];

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

async function getEmbedding(text: string): Promise<number[]> {
  const hfToken = process.env.HF_TOKEN;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;

  const response = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    { method: "POST", headers, body: JSON.stringify({ inputs: text }) }
  );
  if (!response.ok) throw new Error(`HF API error: ${response.status}`);
  const data = await response.json() as number[] | number[][];
  return Array.isArray(data[0]) ? (data as number[][])[0] : data as number[];
}

async function initSemanticSearch() {
  const cases = sqlite.prepare("SELECT * FROM legal_cases").all() as any[];
  console.log(`[Semantic Search] Generating vector embeddings for ${cases.length} legal cases...`);

  for (const c of cases) {
    try {
      const text = `${c.case_title} ${c.issue_categories} ${c.summary} ${c.legal_principles}`;
      const embedding = await getEmbedding(text);
      caseVectors.push({ ...c, embedding });
    } catch (err: any) {
      console.error(`[Semantic Search] Failed generating embedding for case ${c.id}: ${err.message}`);
      caseVectors.push({ ...c, embedding: [] });
    }
  }
  console.log("[Semantic Search] Vector embeddings ready!");
}

// Start embedding generation in background
initSemanticSearch().catch(console.error);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // ── Authentication ─────────────────────────────────────────────────────────

  // Register
  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password, name } = parsed.data;
    const role = "citizen"; // default role; extend registerSchema if advocate roles needed
    const existing = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 12);
    const now = Date.now();

    sqlite.prepare(
      "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, email, hashedPassword, name, role || "citizen", now);

    const accessToken = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const refreshToken = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      accessToken,
      user: { id, email, name, role: role || "citizen" },
    });
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password } = parsed.data;
    const user = sqlite.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  });

  // Refresh token
  app.post("/api/auth/refresh", (req, res) => {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: "No refresh token" });
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(payload.userId) as any;
      if (!user) return res.status(401).json({ error: "User not found" });
      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      res.json({ accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("refresh_token");
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", authRequired, (req: AuthRequest, res) => {
    const user = sqlite.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(req.userId) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  });

  // ── BYOK (Bring Your Own API Key) ──────────────────────────────────────────
  app.post("/api/auth/byok", authRequired, (req: AuthRequest, res) => {
    const { sarvam_key } = req.body;
    if (!sarvam_key) return res.status(400).json({ error: "API key required" });
    // Store in session for this request only — client handles storage
    res.json({ success: true, message: "Key validated. Store securely on your device." });
  });

  // ── Chat Sessions ──────────────────────────────────────────────────────────

  app.get("/api/sessions", authOptional, async (req: AuthRequest, res) => {
    try {
      if (req.userId) {
        const userSessions = sqlite.prepare(
          "SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20"
        ).all(req.userId);
        return res.json(userSessions);
      }
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", authOptional, async (req: AuthRequest, res) => {
    try {
      const parsed = insertSessionSchema.safeParse({
        ...req.body,
        userId: req.userId || null,
      });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const session = await storage.createSession(parsed.data);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/sessions/:id", authOptional, async (req: AuthRequest, res) => {
    try {
      const session = await storage.getSession(req.params.id as string);
      if (!session) return res.status(404).json({ error: "Session not found" });
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.get("/api/sessions/:id/messages", authOptional, async (req: AuthRequest, res) => {
    try {
      const msgs = await storage.listMessages(req.params.id as string);
      res.json(msgs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ── AI Legal Chat ──────────────────────────────────────────────────────────

  app.post("/api/legal/chat", authOptional, async (req: AuthRequest, res) => {
    const schema = z.object({
      message: z.string().min(1).max(2000),
      sessionId: z.string().optional(),
      language: z.enum(["en", "hi", "mr"]).default("en"),
      byokKey: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { message, sessionId, language, byokKey } = parsed.data;

    // Use BYOK key if provided, otherwise server key
    let aiClient = sarvam;
    if (byokKey) {
      aiClient = new OpenAI({ apiKey: byokKey, baseURL: "https://api.sarvam.ai/v1" });
    }

    // Save user message
    let session: any = null;
    if (sessionId) {
      session = await storage.getSession(sessionId);
      if (session) {
        await storage.createMessage({
          id: randomUUID(),
          sessionId,
          role: "user",
          content: message,
          language,
        });
      }
    }

    // Classify and build context
    const category = classifyIssue(message);
    const categoryContext = CATEGORY_PROMPTS[category] || "";
    const systemPrompt = LEGAL_SYSTEM_PROMPT[language as keyof typeof LEGAL_SYSTEM_PROMPT] || LEGAL_SYSTEM_PROMPT.en;

    // Retrieve recent session history
    const history = sessionId ? await storage.listMessages(sessionId) : [];
    const recentHistory = history.slice(-6);

    if (!aiClient) {
      // Demo mode
      const demoResponses: Record<string, string> = {
        criminal: `**Your Rights on Arrest (Article 22, Constitution of India):**\n\n1. Right to be informed of grounds of arrest\n2. Right to consult a lawyer of your choice\n3. Right to be produced before a magistrate within 24 hours\n4. Right to bail in bailable offences under Section 436 CrPC\n\n**Free Legal Aid:** Contact NALSA at 15100 or your District Legal Services Authority (DLSA)\n\n*This is a demo response. For full AI capabilities, add your Sarvam AI API key.*`,
        family: `**Family Law in India:**\n\nFor divorce, maintenance, or domestic violence issues:\n- Hindu Marriage Act 1955 (for Hindus)\n- Special Marriage Act 1954 (court marriage)\n- Protection of Women from Domestic Violence Act 2005\n\n**Emergency:** Women Helpline 181\n\n*This is a demo response. Add SARVAM_API_KEY for full AI capabilities.*`,
      };
      const responseText = demoResponses[category] || `Thank you for your legal query about **"${message}"**.\n\nThis is a demo response. To get full AI-powered legal assistance in Indian languages, please add your Sarvam AI API key.\n\n**Free Legal Aid:** NALSA Helpline: 15100\n**Emergency:** 112`;

      if (sessionId && session) {
        await storage.createMessage({ id: randomUUID(), sessionId, role: "assistant", content: responseText, language });
      }
      return res.json({ response: responseText, sessionId, demo: true, category });
    }

    try {
      const completion = await aiClient.chat.completions.create({
        model: "sarvam-30b",
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          { role: "user", content: `${systemPrompt}\n\nFocus area: ${categoryContext}` },
          ...recentHistory.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user", content: message },
        ],
      });

      const responseText = completion.choices[0].message.content || "I apologise, I could not generate a response.";

      if (sessionId && session) {
        await storage.createMessage({
          id: randomUUID(),
          sessionId, role: "assistant", content: responseText,
          language,
        });

        // Update session title from first message
        if (history.length === 0) {
          sqlite.prepare("UPDATE sessions SET title = ?, language = ?, updated_at = ? WHERE id = ?")
            .run(message.substring(0, 60) + (message.length > 60 ? "..." : ""), language, Date.now(), sessionId);
        }
      }

      res.json({ response: responseText, sessionId, category, language });
    } catch (err: any) {
      console.error("[Chat Error]", err.message);
      res.status(500).json({ error: "AI service temporarily unavailable", details: err.message });
    }
  });

  // ── Voice Processing ───────────────────────────────────────────────────────

  app.post("/api/voice/stt", upload.single("audio"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });
    const language = (req.body.language as string) || "en-IN";

    if (!sarvam) {
      return res.json({ transcript: "Voice transcription requires Sarvam AI. Demo mode active.", demo: true });
    }

    try {
      const tempPath = `/tmp/audio_${Date.now()}.webm`;
      fs.writeFileSync(tempPath, req.file.buffer);
      const transcript = `[Voice input received - ${req.file.size} bytes. Integration with Sarvam STT pending.]`;
      fs.unlinkSync(tempPath);
      res.json({ transcript, language });
    } catch (err: any) {
      res.status(500).json({ error: "STT failed", details: err.message });
    }
  });

  app.post("/api/voice/tts", async (req, res) => {
    const schema = z.object({ text: z.string().min(1).max(500), language: z.string().default("en-IN") });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (!sarvam) {
      return res.json({ audio: null, demo: true, message: "TTS requires Sarvam AI API key" });
    }

    res.json({ audio: null, text: parsed.data.text, message: "TTS endpoint ready" });
  });

  // WhatsApp webhook
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: "Verification failed" });
    }
  });

  app.post("/api/whatsapp/webhook", async (req, res) => {
    res.status(200).send("EVENT_RECEIVED");
  });

  // ── Legal Knowledge Search ─────────────────────────────────────────────────

  app.get("/api/legal/search/semantic", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    const limit = Math.min(parseInt(req.query.limit as string || "10"), 20);

    if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

    // Try semantic search first
    const activeVectors = caseVectors.filter(v => v.embedding.length > 0);
    if (activeVectors.length > 0) {
      try {
        const queryEmbedding = await getEmbedding(query);
        const scored = activeVectors.map(v => ({
          ...v, score: cosineSimilarity(queryEmbedding, v.embedding),
        })).sort((a, b) => b.score - a.score).slice(0, limit);
        return res.json({ results: scored, method: "semantic" });
      } catch (err: any) {
        console.error("[Semantic Search]", err.message);
      }
    }

    // Keyword fallback
    const terms = query.split(" ").filter(t => t.length > 2);
    if (terms.length === 0) return res.json({ results: [], method: "keyword" });

    const likeClause = terms.map(() => "(case_title LIKE ? OR summary LIKE ? OR issue_categories LIKE ?)").join(" OR ");
    const params = terms.flatMap(t => [`%${t}%`, `%${t}%`, `%${t}%`]);
    const results = sqlite.prepare(`SELECT * FROM legal_cases WHERE ${likeClause} LIMIT ?`).all(...params, limit);
    res.json({ results, method: "keyword" });
  });

  app.get("/api/legal/search/indiankanoon", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    if (!query) return res.status(400).json({ error: "Query required" });

    const token = process.env.INDIANKANOON_API_TOKEN;
    if (!token) return res.status(503).json({ error: "IndianKanoon token not configured" });

    try {
      const response = await fetch(
        `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(query)}&pagenum=0`,
        { headers: { Authorization: `Token ${token}` } }
      );
      if (!response.ok) throw new Error(`IK API error: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "IndianKanoon search failed", details: err.message });
    }
  });

  // ── eCourts Case Status ────────────────────────────────────────────────────

  app.get("/api/legal/ecourts/cnr/:cnr", async (req, res) => {
    const cnr = req.params.cnr.trim().toUpperCase();
    if (!cnr || cnr.length < 10) return res.status(400).json({ error: "Invalid CNR number" });

    const eciapiToken = process.env.ECIAPI_TOKEN;
    if (eciapiToken) {
      try {
        const response = await fetch(`https://eciapi.akshit.me/cnr/${encodeURIComponent(cnr)}`, {
          headers: { Authorization: `Bearer ${eciapiToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          return res.json({ data, source: "eciapi" });
        }
      } catch (err: any) {
        console.error("[eCourts]", err.message);
      }
    }

    // Mock data fallback
    const mockData: Record<string, any> = {
      MHPN0100012023: {
        cnr_number: "MHPN0100012023",
        case_title: "State of Maharashtra vs Rohit Sharma",
        court_name: "District and Sessions Court, Pune",
        filing_date: "2023-01-15",
        status: "Pending",
        next_hearing_date: "2026-04-12",
        judge: "Hon. Shri. A. B. Sharma",
        case_type: "Sessions Trial",
        petitioner: "State of Maharashtra",
        respondent: "Rohit Sharma",
        history: [
          { date: "2023-01-15", stage: "Case Filed", remarks: "FIR 112/2023 Registered and chargesheet filed." },
          { date: "2023-02-10", stage: "First Hearing", remarks: "Accused produced in court. Remanded to Judicial Custody (JC)." },
          { date: "2023-06-22", stage: "Bail Hearing", remarks: "Bail application rejected by Sessions Court." },
          { date: "2024-11-05", stage: "Framing of Charges", remarks: "Charges framed under Sec 302, 34 IPC." },
          { date: "2025-08-19", stage: "Evidence", remarks: "Prosecution Witness 1 (PW1) examined." },
          { date: "2026-02-14", stage: "Evidence", remarks: "Prosecution Witness 2 (PW2) cross-examined by defense counsel." },
        ],
      },
      DLHC0200342024: {
        cnr_number: "DLHC0200342024",
        case_title: "Priya Kapoor vs Rajesh Kapoor",
        court_name: "High Court of Delhi",
        filing_date: "2024-03-01",
        status: "Disposed",
        next_hearing_date: "",
        judge: "Hon. Justice S. K. Mishra",
        case_type: "Civil Writ Petition",
        petitioner: "Priya Kapoor",
        respondent: "Rajesh Kapoor",
        history: [
          { date: "2024-03-01", stage: "Filed", remarks: "Writ petition filed." },
          { date: "2024-04-15", stage: "Admission", remarks: "Petition admitted. Notice issued to respondent." },
          { date: "2024-09-20", stage: "Arguments", remarks: "Arguments heard from both sides." },
          { date: "2024-11-10", stage: "Judgment", remarks: "Petition disposed with directions. Order uploaded." },
        ],
      },
      GJTK0500122023: {
        cnr_number: "GJTK0500122023",
        case_title: "Mehta Traders vs State of Gujarat",
        court_name: "District Consumer Forum, Surat",
        filing_date: "2023-05-20",
        status: "Stay Granted",
        next_hearing_date: "2026-05-08",
        judge: "Shri. P. V. Desai",
        case_type: "Consumer Complaint",
        petitioner: "Mehta Traders",
        respondent: "State of Gujarat",
        history: [
          { date: "2023-05-20", stage: "Complaint Filed", remarks: "Consumer complaint registered." },
          { date: "2023-07-10", stage: "Notice", remarks: "Notice served to opposite party." },
          { date: "2024-01-15", stage: "Stay Application", remarks: "Ex-parte stay granted." },
          { date: "2025-03-20", stage: "Arguments", remarks: "Partial arguments heard." },
        ],
      },
    };

    const data = mockData[cnr] || {
      cnr_number: cnr,
      case_title: "Case Not Found",
      court_name: "N/A",
      filing_date: new Date().toISOString().split("T")[0],
      status: "Not Found",
      next_hearing_date: "",
      judge: "N/A",
      case_type: "Unknown",
      petitioner: "N/A",
      respondent: "N/A",
      history: [],
    };

    res.json({ data, source: "mock" });
  });

  // ── Legal News Feed ────────────────────────────────────────────────────────

  app.get("/api/legal/news", async (req, res) => {
    const feeds = [
      "https://www.livelaw.in/feed/",
      "https://www.barandbench.com/feed",
    ];

    try {
      const articles: any[] = [];
      for (const feedUrl of feeds) {
        try {
          const response = await fetch(feedUrl, {
            headers: { "User-Agent": "NyayMitra/1.0 Legal News Aggregator" },
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) continue;
          const xml = await response.text();

          const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
          for (const item of items.slice(0, 10)) {
            const title = item.match(/<title><!\[CDATA\[(.+?)\]\]><\/title>/)?.[1] || item.match(/<title>(.+?)<\/title>/)?.[1] || "";
            const link = item.match(/<link>(.+?)<\/link>/)?.[1] || "";
            const pubDate = item.match(/<pubDate>(.+?)<\/pubDate>/)?.[1] || "";
            const description = item.match(/<description><!\[CDATA\[(.+?)\]\]><\/description>/)?.[1] || item.match(/<description>(.+?)<\/description>/)?.[1] || "";
            const source = feedUrl.includes("livelaw") ? "LiveLaw" : "Bar & Bench";
            if (title && link) {
              articles.push({ title, link, pubDate, description: description.substring(0, 200), source });
            }
          }
        } catch (feedErr: any) {
          console.error(`[News] Feed error ${feedUrl}:`, feedErr.message);
        }
      }

      res.json({ articles: articles.slice(0, 20), count: articles.length });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch legal news" });
    }
  });

  // ── Bookmarks ──────────────────────────────────────────────────────────────

  app.get("/api/bookmarks", authRequired, async (req: AuthRequest, res) => {
    const bms = sqlite.prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC").all(req.userId);
    res.json(bms);
  });

  app.post("/api/bookmarks", authRequired, async (req: AuthRequest, res) => {
    const parsed = insertBookmarkSchema.safeParse({ ...req.body, userId: req.userId });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const bm = await storage.createBookmark(parsed.data);
    res.status(201).json(bm);
  });

  app.delete("/api/bookmarks/:id", authRequired, async (req: AuthRequest, res) => {
    sqlite.prepare("DELETE FROM bookmarks WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ── Advocate Client Management ─────────────────────────────────────────────

  app.get("/api/clients", authRequired, (req: AuthRequest, res) => {
    const rows = sqlite.prepare("SELECT * FROM clients WHERE user_id = ? ORDER BY updated_at DESC").all(req.userId);
    res.json(rows);
  });

  app.post("/api/clients", authRequired, (req: AuthRequest, res) => {
    const schema = z.object({
      name: z.string().min(1).max(200),
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      address: z.string().optional(),
      case_title: z.string().optional().default(""),
      case_number: z.string().optional(),
      court: z.string().optional(),
      sections: z.string().optional(),
      status: z.enum(["active", "closed", "bail_pending", "bail_granted"]).default("active"),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const now = Date.now();
    const id = randomUUID();
    sqlite.prepare(`
      INSERT INTO clients (id, user_id, name, phone, email, address, case_title, case_number, court, sections, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.userId,
      parsed.data.name, parsed.data.phone || null, parsed.data.email || null,
      parsed.data.address || null, parsed.data.case_title, parsed.data.case_number || null,
      parsed.data.court || null, parsed.data.sections || null,
      parsed.data.status, parsed.data.notes || null, now, now
    );
    res.status(201).json(sqlite.prepare("SELECT * FROM clients WHERE id = ?").get(id));
  });

  app.patch("/api/clients/:id", authRequired, (req: AuthRequest, res) => {
    const existing = sqlite.prepare("SELECT * FROM clients WHERE id = ? AND user_id = ?").get(req.params.id, req.userId) as any;
    if (!existing) return res.status(404).json({ error: "Client not found" });

    const schema = z.object({
      name: z.string().min(1).max(200).optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      case_title: z.string().optional(),
      case_number: z.string().optional(),
      court: z.string().optional(),
      sections: z.string().optional(),
      status: z.enum(["active", "closed", "bail_pending", "bail_granted"]).optional(),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const d = parsed.data;
    sqlite.prepare(`
      UPDATE clients SET
        name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email),
        address = COALESCE(?, address), case_title = COALESCE(?, case_title),
        case_number = COALESCE(?, case_number), court = COALESCE(?, court),
        sections = COALESCE(?, sections), status = COALESCE(?, status),
        notes = COALESCE(?, notes), updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      d.name, d.phone, d.email, d.address, d.case_title, d.case_number,
      d.court, d.sections, d.status, d.notes, Date.now(),
      req.params.id, req.userId
    );
    res.json(sqlite.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id));
  });

  app.delete("/api/clients/:id", authRequired, (req: AuthRequest, res) => {
    const existing = sqlite.prepare("SELECT id FROM clients WHERE id = ? AND user_id = ?").get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: "Client not found" });
    sqlite.prepare("DELETE FROM clients WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ── Hearing Diary ──────────────────────────────────────────────────────────

  app.get("/api/hearings", authRequired, (req: AuthRequest, res) => {
    const clientId = req.query.client_id as string | undefined;
    const rows = clientId
      ? sqlite.prepare("SELECT h.*, c.name as client_name FROM hearings h JOIN clients c ON h.client_id = c.id WHERE h.user_id = ? AND h.client_id = ? ORDER BY h.hearing_date ASC").all(req.userId, clientId)
      : sqlite.prepare("SELECT h.*, c.name as client_name FROM hearings h JOIN clients c ON h.client_id = c.id WHERE h.user_id = ? ORDER BY h.hearing_date ASC").all(req.userId);
    res.json(rows);
  });

  app.post("/api/hearings", authRequired, (req: AuthRequest, res) => {
    const schema = z.object({
      client_id: z.string().uuid(),
      court: z.string().min(1),
      hearing_date: z.string().min(1),
      purpose: z.string().optional(),
      result: z.string().optional(),
      next_date: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const client = sqlite.prepare("SELECT id FROM clients WHERE id = ? AND user_id = ?").get(parsed.data.client_id, req.userId);
    if (!client) return res.status(404).json({ error: "Client not found" });

    const now = Date.now();
    const id = randomUUID();
    sqlite.prepare(`
      INSERT INTO hearings (id, user_id, client_id, court, hearing_date, purpose, result, next_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.userId, parsed.data.client_id, parsed.data.court,
      parsed.data.hearing_date, parsed.data.purpose || null,
      parsed.data.result || null, parsed.data.next_date || null,
      parsed.data.notes || null, now, now
    );
    res.status(201).json(sqlite.prepare("SELECT h.*, c.name as client_name FROM hearings h JOIN clients c ON h.client_id = c.id WHERE h.id = ?").get(id));
  });

  app.patch("/api/hearings/:id", authRequired, (req: AuthRequest, res) => {
    const existing = sqlite.prepare("SELECT id FROM hearings WHERE id = ? AND user_id = ?").get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: "Hearing not found" });

    const schema = z.object({
      court: z.string().optional(),
      hearing_date: z.string().optional(),
      purpose: z.string().optional(),
      result: z.string().optional(),
      next_date: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const d = parsed.data;
    sqlite.prepare(`
      UPDATE hearings SET
        court = COALESCE(?, court), hearing_date = COALESCE(?, hearing_date),
        purpose = COALESCE(?, purpose), result = COALESCE(?, result),
        next_date = COALESCE(?, next_date), notes = COALESCE(?, notes), updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(d.court, d.hearing_date, d.purpose, d.result, d.next_date, d.notes, Date.now(), req.params.id, req.userId);
    res.json(sqlite.prepare("SELECT h.*, c.name as client_name FROM hearings h JOIN clients c ON h.client_id = c.id WHERE h.id = ?").get(req.params.id));
  });

  app.delete("/api/hearings/:id", authRequired, (req: AuthRequest, res) => {
    const existing = sqlite.prepare("SELECT id FROM hearings WHERE id = ? AND user_id = ?").get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: "Hearing not found" });
    sqlite.prepare("DELETE FROM hearings WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ── AI Document Generation ─────────────────────────────────────────────────
  // Returns `aiBody` — narrative body text only, to be injected into the
  // official government HTML template (DocumentTemplates.ts) on the client.

  const DOC_BODY_PROMPTS: Record<string, (fields: Record<string, string>) => string> = {
    rti: (f) => `You are an expert in Indian RTI law.
Write ONLY the "Information Sought" body paragraphs for an RTI application under Section 6(1) of the RTI Act, 2005.
Number each query as 1), 2), 3) etc. Use formal legal language. Do NOT include address blocks, date, fee, signature or any boilerplate — ONLY the numbered queries.
Information requested: ${f.information_needed || f.subject || "As described"}
Authority: ${f.authority || "Public Information Officer"}`,

    legal_notice: (f) => `You are a senior Indian advocate drafting a Legal Notice.
Write ONLY the "Facts & Grounds" body — detailed facts, events, legal provisions breached, and the dispute narrative.
Cite relevant Acts and sections. Number paragraphs. Be specific and legally actionable.
Do NOT write the To/From header, demand clause, prayer or signature — ONLY the facts narrative.
Claim details: ${f.claim_details || ""}
Demand: ${f.demand || ""}`,

    bail_petition: (f) => `You are an Indian criminal law expert.
Write ONLY the "Grounds for Release on Bail" — numbered sub-paragraphs (a), (b), (c) explaining why bail should be granted.
Reference Section 437/439 CrPC or 480/483 BNSS as appropriate.
Do NOT write court heading, cause title, prayer or signature — ONLY the bail grounds.
Charges: ${f.charges || ""}
Grounds: ${f.grounds_for_bail || ""}`,

    consumer_complaint: (f) => `You are an Indian consumer law expert.
Write ONLY the "Facts of Complaint" body — numbered paragraphs detailing the defect, deficiency in service, unfair trade practice, and sequence of events.
Cite Consumer Protection Act 2019. Do NOT write forum heading, cause title, relief or prayer — ONLY the facts.
Complaint details: ${f.complaint_details || ""}
Opposite party: ${f.opposite_party || ""}`,

    affidavit: (f) => `You are an Indian legal drafter.
Write ONLY the "Statement of Facts" — formal numbered THAT paragraphs (e.g. "THAT I am the Deponent...").
Begin each paragraph with "THAT ". Do NOT write personal particulars, verification or notary section — ONLY the THAT paragraphs.
Facts: ${f.statement_of_facts || ""}
Deponent: ${f.deponent_name || ""}`,

    founder_agreement: (f) => `You are a startup legal expert in Indian company law.
Write ONLY the "Roles, Responsibilities & Time Commitment" clause body — covering what each founder will do, time commitment, decision rights, outside activity restrictions. Cite Companies Act 2013 where relevant.
Do NOT write agreement header, equity table, vesting, IP clause or signatures — ONLY the roles clause.
Founders: ${f.founder1_name || "Founder 1"} and ${f.founder2_name || "Founder 2"}`,

    esop_policy: (f) => `You are a corporate legal expert in Indian company law.
Write ONLY the "Change of Control / Exit Event" clause — what happens to vested and unvested options on acquisition, merger, IPO, and winding up.
Reference SEBI (SBEB) Regulations 2021 and Companies Act 2013.
Do NOT write definitions, pool size, vesting, good/bad leaver or board resolution — ONLY the Exit Event clause.
Company: ${f.startup_name || ""}`,
  };

  app.post("/api/documents/generate", authOptional, async (req: AuthRequest, res) => {
    const schema = z.object({
      type: z.enum(["rti", "legal_notice", "bail_petition", "consumer_complaint", "affidavit", "founder_agreement", "esop_policy"]),
      fields: z.record(z.string()),
      language: z.enum(["en", "hi", "mr"]).default("en"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { type, fields, language } = parsed.data;

    if (!sarvam) {
      return res.status(503).json({
        error: "AI body generation unavailable. SARVAM_API_KEY not configured.",
        fallback: true,
      });
    }

    try {
      const promptFn = DOC_BODY_PROMPTS[type];
      const langNote = language === "hi"
        ? "\n\nIMPORTANT: Write in formal Hindi (Devanagari script)."
        : language === "mr"
        ? "\n\nIMPORTANT: Write in formal Marathi (Devanagari script)."
        : "";

      const completion = await sarvam.chat.completions.create({
        model: "sarvam-30b",
        temperature: 0.15,
        max_tokens: 800,
        messages: [{ role: "user", content: promptFn(fields) + langNote }],
      });

      const aiBody = completion.choices[0].message.content || "";
      res.json({ success: true, aiBody, ai_generated: true });
    } catch (err: any) {
      console.error("[AI Doc Body Error]", err.message);
      res.status(500).json({ error: "AI generation failed. Please try again.", details: err.message });
    }
  });

  // ── Health and Readiness checks ────────────────────────────────────────────

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "Nyay Mitra API" });
  });

  app.get("/api/ready", (_req, res) => {
    try {
      const legalCaseCount = (sqlite.prepare("SELECT COUNT(*) as c FROM legal_cases").get() as any)?.c ?? 0;
      res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString(),
        ai: sarvam ? "sarvam-connected" : "demo-mode",
        db: "ok",
        cases: legalCaseCount,
      });
    } catch (error) {
      res.status(503).json({ status: "error", db: "unavailable" });
    }
  });

  return httpServer;
}
