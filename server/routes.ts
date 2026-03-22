import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import db from "./db";
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

const JWT_SECRET = process.env.JWT_SECRET || "nyay-mitra-jwt-secret-change-in-production";
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// ── Auth middleware ────────────────────────────────────────────────────────
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
  family: "Focus on Hindu Marriage Act, Special Marriage Act, Domestic Violence Act (PWDVA 2005), maintenance, divorce procedures, and child custody.",
  labor: "Focus on Minimum Wages Act, Payment of Wages Act, Industrial Disputes Act, EPFO, and gig worker rights under Code on Social Security 2020.",
  consumer: "Focus on Consumer Protection Act 2019, RERA, e-commerce regulations, and complaint procedures before Consumer Forums.",
  property: "Focus on Transfer of Property Act, Registration Act, RERA, landlord-tenant rights, and inheritance laws.",
  rti: "Focus on RTI Act 2005, procedure to file RTI, PIO obligations, first/second appeals, and CIC jurisdiction.",
  constitutional: "Focus on Fundamental Rights (Part III), Directive Principles, PIL procedure, and writ jurisdiction of High Courts and Supreme Court.",
  women: "Focus on PWDVA 2005, Anti-dowry Act, Sexual Harassment at Workplace (POSH Act), maternity benefits, and women's property rights.",
  general: "Provide comprehensive legal information across all areas of Indian law.",
};

// ── Demo fallback responses ────────────────────────────────────────────────
function getDemoResponse(query: string, lang: string): string {
  const q = query.toLowerCase();
  if (lang === "hi") {
    if (q.includes("fir") || q.includes("पुलिस") || q.includes("police")) {
      return `**एफआईआर दर्ज कराने का अधिकार**\n\nभारत में एफआईआर दर्ज कराना आपका मौलिक अधिकार है।\n\n**संबंधित कानून:**\n• धारा 154 CrPC — पुलिस को किसी भी संज्ञेय अपराध की रिपोर्ट दर्ज करनी होगी\n• यदि पुलिस एफआईआर दर्ज करने से मना करे, तो SP को लिखित शिकायत दें\n• ऑनलाइन एफआईआर: अधिकांश राज्यों में e-FIR सुविधा उपलब्ध है\n\n**व्यावहारिक कदम:**\n1. नजदीकी थाने में जाएं और लिखित शिकायत दें\n2. अस्वीकार होने पर SP/DSP को शिकायत करें\n3. धारा 156(3) CrPC के तहत मजिस्ट्रेट से संपर्क करें\n\n📞 **हेल्पलाइन:** NALSA: 15100 | आपातकाल: 112`;
    }
    return `**न्याय मित्र — कानूनी सहायता**\n\nआपके प्रश्न के लिए धन्यवाद। मैं भारतीय कानून के बारे में जानकारी प्रदान कर सकता हूं।\n\nकृपया अपना प्रश्न अधिक विस्तार से पूछें जैसे:\n• आपकी समस्या किस क्षेत्र से संबंधित है (आपराधिक, परिवार, श्रम, उपभोक्ता)\n• आप क्या जानना चाहते हैं\n\n📞 **आपातकालीन नंबर:** महिला हेल्पलाइन: 181 | आपातकाल: 112 | NALSA: 15100`;
  }

  if (lang === "mr") {
    if (q.includes("fir") || q.includes("पोलिस") || q.includes("police")) {
      return `**FIR नोंदवण्याचा अधिकार**\n\nभारतात FIR नोंदवणे हा तुमचा मूलभूत अधिकार आहे.\n\n**संबंधित कायदे:**\n• कलम 154 CrPC — कोणत्याही दखलपात्र गुन्ह्याची तक्रार नोंदवणे पोलिसांना बंधनकारक\n• पोलिसांनी नकार दिल्यास SP ला लेखी तक्रार करा\n\n**व्यावहारिक पाऊले:**\n1. जवळच्या पोलीस ठाण्यात जा\n2. नकार दिल्यास SP/DSP कडे तक्रार करा\n3. कलम 156(3) CrPC अंतर्गत दंडाधिकाऱ्याकडे जा\n\n📞 **हेल्पलाइन:** NALSA: 15100 | आणीबाणी: 112`;
    }
    return `**न्याय मित्र — कायदेशीर सहाय्य**\n\nतुमच्या प्रश्नासाठी धन्यवाद. भारतीय कायद्याबद्दल माहिती देण्यास मी तयार आहे.\n\n📞 **आणीबाणी क्रमांक:** महिला हेल्पलाइन: 181 | आणीबाणी: 112 | NALSA: 15100`;
  }

  // English fallbacks
  if (q.includes("fir") || q.includes("police") || q.includes("arrest")) {
    return `**Your Rights with the Police & FIR**\n\nFiling an FIR is your fundamental right under Indian law.\n\n**Relevant Laws:**\n• **Section 154 CrPC** — Police must register any cognizable offence report\n• **Section 41 CrPC** — Arrest rights and grounds for arrest\n• **D.K. Basu Guidelines** (Supreme Court) — Police must identify themselves and inform family\n\n**Practical Steps:**\n1. Visit the nearest police station and submit a written complaint\n2. If police refuse, write to the SP/DSP of the district\n3. Approach the Magistrate under Section 156(3) CrPC for direction to investigate\n4. File an online e-FIR at your state police website\n\n📞 **Helplines:** NALSA Legal Aid: **15100** | Emergency: **112**`;
  }

  if (q.includes("rent") || q.includes("landlord") || q.includes("tenant") || q.includes("evict")) {
    return `**Tenant & Landlord Rights**\n\n**Relevant Laws:**\n• **Transfer of Property Act 1882** — governs rent agreements\n• **State Rent Control Acts** — each state has specific protections\n• **RERA** (Real Estate Regulation Act 2016) — for new constructions\n\n**Your Key Rights as a Tenant:**\n1. Right to written rent agreement (register if >11 months)\n2. Landlord cannot evict without proper legal notice\n3. Right to get security deposit back (within 15-30 days of vacating)\n4. Landlord cannot enter without notice during tenancy\n\n**Practical Steps:**\n1. Document everything in writing — all communications with landlord\n2. Approach Rent Control Court if landlord is violating your rights\n3. Consumer Forum if services are deficient\n\n📞 **Free Legal Aid:** DLSA (District Legal Services Authority) in your district`;
  }

  if (q.includes("divorce") || q.includes("marriage") || q.includes("matrimon")) {
    return `**Divorce & Marriage Rights**\n\n**Relevant Laws:**\n• **Hindu Marriage Act 1955** (Sections 13-13B) — grounds for divorce\n• **Special Marriage Act 1954** — for inter-religion marriages\n• **Domestic Violence Act (PWDVA 2005)** — protection orders\n• **Section 125 CrPC** — maintenance for spouse and children\n\n**Types of Divorce:**\n1. **Mutual Consent** (Sec 13B) — 6 month cooling period, faster process\n2. **Contested Divorce** — based on cruelty, desertion, adultery, etc.\n\n**Practical Steps:**\n1. Consult a family law advocate before filing\n2. Gather all marriage documents (certificate, photos, joint accounts)\n3. Apply for interim maintenance immediately if needed\n\n📞 **Women Helpline: 181** | NALSA: 15100`;
  }

  if (q.includes("rti") || q.includes("right to information")) {
    return `**Right to Information (RTI) Act 2005**\n\n**How to File an RTI:**\n1. Write an application to the Public Information Officer (PIO) of the relevant department\n2. Pay ₹10 application fee (BPL card holders exempt)\n3. PIO must respond within **30 days** (48 hours for life/liberty matters)\n\n**If No Response:**\n• File First Appeal with the Appellate Authority within 30 days\n• File Second Appeal with CIC/SIC within 90 days of first appeal\n\n**Tips:**\n• Be specific — ask for exact documents, dates, file numbers\n• You can file RTI online at **rtionline.gov.in**\n• State departments: use your State RTI portal\n\n📞 **RTI Helpline:** 011-24632530`;
  }

  if (q.includes("labour") || q.includes("labor") || q.includes("salary") || q.includes("wage") || q.includes("job") || q.includes("employment")) {
    return `**Labour Rights in India**\n\n**Key Laws:**\n• **Minimum Wages Act 1948** — state-wise minimum wage notification\n• **Payment of Wages Act 1936** — wages must be paid by 7th/10th of month\n• **Industrial Disputes Act 1947** — protects against unfair termination\n• **Code on Social Security 2020** — PF, ESI, gratuity\n\n**Your Rights:**\n1. Written appointment letter is mandatory\n2. Salary slip every month\n3. PF contribution (12% of basic) if 20+ employees\n4. 3 months notice or pay in lieu for termination\n5. Gratuity after 5 years of continuous service\n\n**If Rights Violated:**\n• File complaint with Labour Commissioner of your district\n• Approach Labour Court\n\n📞 **Labour Helpline:** 1800-11-2345 (toll-free)`;
  }

  return `**Nyay Mitra — Legal Aid Response**\n\nThank you for your query. I can provide information on various areas of Indian law including:\n\n• **Criminal Law** — FIR, bail, arrest rights, IPC offences\n• **Family Law** — divorce, maintenance, domestic violence, child custody\n• **Labour Rights** — wages, termination, PF, ESI\n• **Consumer Protection** — complaints, RERA, e-commerce\n• **Property & Rent** — tenant rights, inheritance, registration\n• **RTI** — how to file and follow up\n• **Constitutional Rights** — fundamental rights, PIL\n• **Women's Rights** — POSH, dowry, maternity\n\nPlease describe your specific situation and I'll provide detailed guidance with relevant legal citations.\n\n📞 **Emergency:** 112 | **Women Helpline:** 181 | **NALSA Legal Aid:** 15100`;
}

// ── Routes ─────────────────────────────────────────────────────────────────
export async function registerRoutes(httpServer: Server, app: Express) {

  // ── Auth ──────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { name, email, password, preferredLanguage } = parsed.data;

    const existing = storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = storage.createUser({
      id: randomUUID(),
      name,
      email,
      passwordHash,
      preferredLanguage: preferredLanguage || "en",
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    const { passwordHash: _, ...publicUser } = user;
    res.status(201).json({ token, user: publicUser });
  });

  app.post("/api/auth/login", async (req, res) => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid credentials format" });

    const user = storage.getUserByEmail(parsed.data.email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    const { passwordHash: _, ...publicUser } = user;
    res.json({ token, user: publicUser });
  });

  app.get("/api/auth/me", authRequired, (req: AuthRequest, res) => {
    const user = storage.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash: _, ...publicUser } = user;
    res.json(publicUser);
  });

  app.patch("/api/auth/language", authRequired, (req: AuthRequest, res) => {
    const schema = z.object({ language: z.enum(["en", "hi", "mr"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid language" });

    const user = storage.updateUserLanguage(req.userId!, parsed.data.language);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash: _, ...publicUser } = user;
    res.json(publicUser);
  });

  // ── Sessions ──────────────────────────────────────────────────
  app.get("/api/sessions", authOptional, (req: AuthRequest, res) => {
    const list = storage.listSessions(req.userId);
    res.json(list);
  });

  app.post("/api/sessions", authOptional, (req: AuthRequest, res) => {
    const parsed = insertSessionSchema.safeParse({
      id: randomUUID(),
      userId: req.userId || null,
      ...req.body,
    });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const session = storage.createSession(parsed.data);
    res.status(201).json(session);
  });

  app.get("/api/sessions/:id", (req, res) => {
    const session = storage.getSession(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  });

  app.patch("/api/sessions/:id/title", (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== "string") return res.status(400).json({ error: "title required" });
    const session = storage.updateSessionTitle(req.params.id, title);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  });

  app.delete("/api/sessions/:id", (req, res) => {
    const deleted = storage.deleteSession(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Session not found" });
    res.json({ success: true });
  });

  // ── Messages ──────────────────────────────────────────────────
  app.get("/api/sessions/:id/messages", (req, res) => {
    const session = storage.getSession(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const msgs = storage.listMessages(req.params.id);
    res.json(msgs);
  });

  app.post("/api/sessions/:id/chat", async (req, res) => {
    const session = storage.getSession(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const bodySchema = z.object({
      message: z.string().min(1).max(2000),
      language: z.enum(["en", "hi", "mr"]).default("en"),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { message, language } = parsed.data;

    // Store user message
    const userMsg = storage.createMessage({
      id: randomUUID(),
      sessionId: req.params.id,
      role: "user",
      content: message,
      language,
      citations: null,
    });

    let aiContent = "";
    let citations: string[] = [];

    if (openai) {
      try {
        const history = storage.listMessages(req.params.id).slice(-10);
        const systemPrompt = LEGAL_SYSTEM_PROMPT[language as keyof typeof LEGAL_SYSTEM_PROMPT] || LEGAL_SYSTEM_PROMPT.en;
        const categoryContext = CATEGORY_PROMPTS[session.category] || CATEGORY_PROMPTS.general;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt + "\n\nCategory context: " + categoryContext },
            ...history.slice(0, -1).map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user", content: message },
          ],
        });

        aiContent = completion.choices[0].message.content || "";

        // Extract citations from [LAW: ...] tags
        const citationMatches = aiContent.match(/\[LAW:\s*([^\]]+)\]/g);
        if (citationMatches) {
          citations = citationMatches.map((c) => c.replace(/\[LAW:\s*|\]/g, "").trim());
        }
      } catch (err: any) {
        console.error("[OpenAI Error]", err.message);
        aiContent = getDemoResponse(message, language);
      }
    } else {
      aiContent = getDemoResponse(message, language);
    }

    // Auto-title session from first message
    if (storage.listMessages(req.params.id).length <= 2) {
      const title = message.length > 50 ? message.substring(0, 50) + "…" : message;
      storage.updateSessionTitle(req.params.id, title);
    }

    const assistantMsg = storage.createMessage({
      id: randomUUID(),
      sessionId: req.params.id,
      role: "assistant",
      content: aiContent,
      language,
      citations: citations.length > 0 ? JSON.stringify(citations) : null,
    });

    res.json({ userMessage: userMsg, assistantMessage: assistantMsg });
  });

  // ── Bookmarks ──────────────────────────────────────────────────
  app.get("/api/bookmarks", authRequired, (req: AuthRequest, res) => {
    const list = storage.listBookmarks(req.userId);
    res.json(list);
  });

  app.post("/api/bookmarks", authOptional, (req: AuthRequest, res) => {
    const parsed = insertBookmarkSchema.safeParse({
      id: randomUUID(),
      userId: req.userId || null,
      ...req.body,
    });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const bookmark = storage.createBookmark(parsed.data);
    res.status(201).json(bookmark);
  });

  app.delete("/api/bookmarks/:id", (req, res) => {
    const deleted = storage.deleteBookmark(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Bookmark not found" });
    res.json({ success: true });
  });

  // ── Admin endpoints ────────────────────────────────────────────
  const ADMIN_SECRET = process.env.ADMIN_SECRET || "nyay-mitra-admin-2026";

  function adminAuth(req: Request, res: Response, next: NextFunction) {
    const secret = req.headers["x-admin-secret"] || req.query.secret;
    if (secret !== ADMIN_SECRET) {
      return res.status(403).json({ error: "Forbidden — invalid admin secret" });
    }
    next();
  }

  app.get("/api/admin/stats", adminAuth, (_req, res) => {
    const allUsers = storage.listSessions(); // get all sessions
    const userCount = db.select().from(users).all().length;
    const sessionCount = db.select().from(sessions).all().length;
    const messageCount = db.select().from(messages).all().length;
    const bookmarkCount = db.select().from(bookmarks).all().length;
    res.json({ userCount, sessionCount, messageCount, bookmarkCount });
  });

  app.get("/api/admin/users", adminAuth, (_req, res) => {
    const allUsers = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      preferredLanguage: users.preferredLanguage,
      createdAt: users.createdAt,
    }).from(users).all();
    res.json(allUsers);
  });

  app.get("/api/admin/sessions", adminAuth, (_req, res) => {
    const allSessions = db.select().from(sessions)
      .orderBy(desc(sessions.updatedAt))
      .all();
    res.json(allSessions);
  });

  app.get("/api/admin/messages", adminAuth, (req, res) => {
    const sessionId = req.query.sessionId as string;
    if (sessionId) {
      const msgs = storage.listMessages(sessionId);
      return res.json(msgs);
    }
    // Return last 100 messages
    const allMsgs = db.select().from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(100)
      .all();
    res.json(allMsgs);
  });

  // ── Health check ───────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Nyay Mitra API",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      ai: openai ? "openai-connected" : "demo-mode",
    });
  });

  return httpServer;
}
