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
import { HfInference } from "@huggingface/inference";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

const JWT_SECRET = process.env.JWT_SECRET || "nyay-mitra-jwt-secret-change-in-production";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const sarvam = process.env.SARVAM_API_KEY ? new OpenAI({ apiKey: process.env.SARVAM_API_KEY, baseURL: "https://api.sarvam.ai/v1" }) : null;

// ── Semantic Search Vector Engine ──────────────────────────────────────────
const hf = new HfInference(process.env.HF_TOKEN);

function cosineSimilarity(A: number[], B: number[]) {
    let dotproduct = 0, mA = 0, mB = 0;
    for(let i = 0; i < A.length; i++){
        dotproduct += (A[i] * B[i]);
        mA += (A[i]*A[i]);
        mB += (B[i]*B[i]);
    }
    const den = Math.sqrt(mA) * Math.sqrt(mB);
    return den === 0 ? 0 : dotproduct / den;
}

// Background task: Ensure embedding column exists, then backfill
try {
  sqlite.exec("ALTER TABLE legal_cases ADD COLUMN embedding TEXT");
} catch (e) {
  // column likely exists
}

async function initializeEmbeddings() {
  const cases = sqlite.prepare("SELECT id, case_title, summary, issue_categories FROM legal_cases WHERE embedding IS NULL").all() as any[];
  if (cases.length > 0) {
    console.log(`[Semantic Search] Generating vector embeddings for ${cases.length} legal cases...`);
    for (const c of cases) {
      try {
        const text = `${c.case_title}. ${c.issue_categories}. ${c.summary}`;
        const out = await hf.featureExtraction({
          model: "sentence-transformers/all-MiniLM-L6-v2",
          inputs: text,
        });
        const vector = Array.isArray(out[0]) ? out[0] : out;
        sqlite.prepare("UPDATE legal_cases SET embedding = ? WHERE id = ?").run(JSON.stringify(vector), c.id);
        
        // Slight delay to prevent hitting free-tier rate limits immediately
        if (!process.env.HF_TOKEN) await new Promise(r => setTimeout(r, 600));
      } catch (err: any) {
        console.warn(`[Semantic Search] Failed generating embedding for case ${c.id}:`, err.message);
      }
    }
    console.log("[Semantic Search] Vector embeddings ready!");
  }
}
// Run non-blocking on startup
initializeEmbeddings().catch(console.error);

// Helper to strip sensitive fields from user object
function toPublicUser(user: any) {
  const { passwordHash, openaiApiKey, ...pub } = user;
  return { ...pub, hasApiKey: !!openaiApiKey };
}

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
  function setAuthTokens(res: Response, userId: string) {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return token;
  }

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

    const token = setAuthTokens(res, user.id);
    res.status(201).json({ token, user: toPublicUser(user) });
  });

  app.post("/api/auth/login", async (req, res) => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid credentials format" });

    const user = storage.getUserByEmail(parsed.data.email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = setAuthTokens(res, user.id);
    res.json({ token, user: toPublicUser(user) });
  });

  // ── Google Sign-In ──────────────────────────────────────────────
  app.post("/api/auth/google", async (req, res) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential required" });
    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Google OAuth not configured" });

    try {
      // Verify Google ID token by calling Google's tokeninfo endpoint
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!verifyRes.ok) return res.status(401).json({ error: "Invalid Google token" });

      const payload: any = await verifyRes.json();
      if (payload.aud !== GOOGLE_CLIENT_ID) return res.status(401).json({ error: "Token audience mismatch" });

      const { sub: googleId, email, name, picture } = payload;

      // Check if user exists by Google ID or email
      let user = storage.getUserByGoogleId(googleId);
      if (!user) {
        user = storage.getUserByEmail(email);
        if (user) {
          // Link Google to existing account
          storage.updateUserGoogleId(user.id, googleId);
        } else {
          // Create new user from Google
          user = storage.createUser({
            id: randomUUID(),
            name: name || email.split("@")[0],
            email,
            passwordHash: "",
            googleId,
            preferredLanguage: "en",
          });
        }
      }

      const token = setAuthTokens(res, user.id);
      res.json({ token, user: toPublicUser(user) });
    } catch (err: any) {
      console.error("[Google Auth Error]", err.message);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });

  app.post("/api/auth/refresh", (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
      const user = storage.getUserById(payload.userId);
      if (!user) return res.status(401).json({ error: "User not found" });

      const token = setAuthTokens(res, user.id);
      res.json({ token });
    } catch (e) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authRequired, (req: AuthRequest, res) => {
    const user = storage.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublicUser(user));
  });

  app.patch("/api/auth/language", authRequired, (req: AuthRequest, res) => {
    const schema = z.object({ language: z.enum(["en", "hi", "mr"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid language" });

    const user = storage.updateUserLanguage(req.userId!, parsed.data.language);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublicUser(user));
  });

  // ── BYOK (Bring Your Own Key) ──────────────────────────────────
  app.patch("/api/auth/api-key", authRequired, (req: AuthRequest, res) => {
    const schema = z.object({ apiKey: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "API key required" });

    const user = storage.updateUserApiKey(req.userId!, parsed.data.apiKey);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublicUser(user));
  });

  app.delete("/api/auth/api-key", authRequired, (req: AuthRequest, res) => {
    const user = storage.updateUserApiKey(req.userId!, null);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublicUser(user));
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

  app.post("/api/sessions/:id/chat", authOptional, async (req: AuthRequest, res) => {
    const sessionId = req.params.id as string;
    const session = storage.getSession(sessionId);
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
      sessionId: sessionId,
      role: "user",
      content: message,
      language,
      citations: null,
    });

    let aiContent = "";
    let citationsObj: any = { inline: [], cases: [], laws: [] };

    // Run legal classification on user message
    const { type: issueType, confidence } = classifyIssue(message);

    // Fetch related cases
    const caseQ = `%${message.toLowerCase().split(" ").slice(0, 3).join("%")}%`;
    let relatedCases: any[] = sqlite
      .prepare(`SELECT * FROM legal_cases WHERE lower(issue_categories) LIKE ? ORDER BY precedent_value DESC, year_decided DESC LIMIT 2`)
      .all(`%${issueType.toLowerCase()}%`);
    if (relatedCases.length === 0) {
      relatedCases = sqlite
        .prepare(`SELECT * FROM legal_cases WHERE lower(summary) LIKE ? OR lower(case_title) LIKE ? LIMIT 2`)
        .all(caseQ, caseQ);
    }
    citationsObj.cases = relatedCases;

    // Fetch relevant laws
    const lawKeywords: Record<string, string[]> = {
      MVA_INJURY: ["MVA", "CrPC"], CRIME_THEFT: ["IPC"], CRIME_FRAUD: ["IPC"],
      FAMILY_DIVORCE: ["IPC"], FAMILY_VIOLENCE: ["IPC"], LABOR_HARASSMENT: ["IPC"],
      CIVIL_CONTRACT: ["ICA"], LAND_ACQUISITION: ["LARR Act"],
      CONSUMER_COMPLAINT: ["IPC"], CONST_RIGHTS: ["CrPC"],
    };
    const targetLaws = (lawKeywords[issueType] || ["IPC", "CrPC"]).map((l) => `'${l}'`).join(",");
    const relevantLaws: any[] = sqlite
      .prepare(`SELECT ls.*, ll.law_name FROM legal_sections ls
        JOIN legal_laws ll ON ls.law_shortname = ll.law_shortname
        WHERE ls.law_shortname IN (${targetLaws}) LIMIT 2`)
      .all();
    citationsObj.laws = relevantLaws;

    // Determine which Sarvam client to use: user's BYOK key > server key > demo
    let activeSarvam = sarvam;
    if (req.userId) {
      const currentUser = storage.getUserById(req.userId);
      if (currentUser?.openaiApiKey) {
        activeSarvam = new OpenAI({ apiKey: currentUser.openaiApiKey, baseURL: "https://api.sarvam.ai/v1" });
      }
    }

    if (activeSarvam) {
      try {
        const history = storage.listMessages(sessionId).slice(-10);
        const systemPrompt = LEGAL_SYSTEM_PROMPT[language as keyof typeof LEGAL_SYSTEM_PROMPT] || LEGAL_SYSTEM_PROMPT.en;
        const categoryContext = CATEGORY_PROMPTS[session.category] || CATEGORY_PROMPTS.general;
        const autoContext = `The user query was classified as ${issueType}. Mention the following cases if relevant: ${relatedCases.map(c => c.case_title).join(", ")}. Mention following laws if relevant: ${relevantLaws.map(l => l.law_name + " Sec " + l.section_number).join(", ")}.`;

        const completion = await activeSarvam.chat.completions.create({
          model: "sarvam-30b", // Fallback to sarvam-30b
          temperature: 0.3,
          messages: [
            ...history.slice(0, -1).map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user", content: `[SYSTEM CONTEXT]\n${systemPrompt}\n\nCategory context: ${categoryContext}\n\n${autoContext}\n\n[USER MESSAGE]\n${message}` },
          ],
        });

        aiContent = completion.choices[0].message.content || "";

        // Extract citations from [LAW: ...] tags
        const citationMatches = aiContent.match(/\[LAW:\s*([^\]]+)\]/g);
        if (citationMatches) {
          citationsObj.inline = citationMatches.map((c) => c.replace(/\[LAW:\s*|\]/g, "").trim());
        }
      } catch (err: any) {
        console.error("[Sarvam API Error in /chat]", err.message, err.error || "");
        aiContent = getDemoResponse(message, language);
      }
    } else {
      console.warn("[Sarvam API Warning] activeSarvam client is null. process.env.SARVAM_API_KEY might be missing. Falling back to demo mode.");
      aiContent = getDemoResponse(message, language);
    }

    // Auto-title session from first message
    if (storage.listMessages(sessionId).length <= 2) {
      const title = message.length > 50 ? message.substring(0, 50) + "…" : message;
      storage.updateSessionTitle(sessionId, title);
    }

    const assistantMsg = storage.createMessage({
      id: randomUUID(),
      sessionId: sessionId,
      role: "assistant",
      content: aiContent,
      language,
      citations: JSON.stringify(citationsObj),
    });

    res.json({ userMessage: userMsg, assistantMessage: assistantMsg });
  });

  // ── Voice Transcription (Sarvam STT) ─────────────────────────
  app.post("/api/voice/transcribe", authOptional, upload.single("audio"), async (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });

    // Read the language code sent from the frontend VoiceRecorder
    const VALID_LANG_CODES = ["en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "bn-IN"] as const;
    type LangCode = typeof VALID_LANG_CODES[number];
    const rawLang = (req.body?.language_code || "en-IN") as string;
    const languageCode: LangCode = (VALID_LANG_CODES as readonly string[]).includes(rawLang)
      ? (rawLang as LangCode)
      : "en-IN";

    // Identify user's API Key OR fallback to server Sarvam key
    let targetApiKey = process.env.SARVAM_API_KEY;
    if (req.userId) {
      const u = storage.getUserById(req.userId);
      if (u?.openaiApiKey) targetApiKey = u.openaiApiKey;
    }

    if (!targetApiKey) {
      return res.status(503).json({ error: "Voice transcription requires an API key" });
    }

    try {
      const sarvamForm = new FormData();
      const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
      sarvamForm.append("file", blob, "audio.webm");
      sarvamForm.append("model", "saaras:v1");
      sarvamForm.append("language_code", languageCode); // 🌏 Regional language routing

      // Try hitting Sarvam Speech-to-Text API natively
      const response = await fetch("https://api.sarvam.ai/speech-to-text", {
        method: "POST",
        headers: { "api-subscription-key": targetApiKey },
        body: sarvamForm,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn("[Sarvam STT Warning] Native STT failed, falling back to OpenAI SDK. Details:", errText);

        const openAiClient = new OpenAI({ apiKey: targetApiKey, baseURL: "https://api.sarvam.ai/v1" });
        const fileObj = new File([new Uint8Array(req.file.buffer)], "audio.webm", { type: req.file.mimetype });

        const openAiResp = await openAiClient.audio.transcriptions.create({
          file: fileObj,
          model: "sarvam-stt",
          language: languageCode.split("-")[0], // e.g. "hi" from "hi-IN"
        } as any);
        return res.json({ text: openAiResp.text, detectedLanguage: languageCode });
      }

      const data: any = await response.json();
      res.json({ text: data.transcript || "", detectedLanguage: languageCode });

    } catch (err: any) {
      console.error("[Voice STT Error]", err);
      res.status(500).json({ error: "Speech-to-text processing failed" });
    }
  });

  // ── Voice Synthesize (Sarvam TTS) ────────────────────────────
  app.post("/api/voice/synthesize", authOptional, async (req: AuthRequest, res) => {
    const schema = z.object({
      text: z.string().min(1).max(500),
      language_code: z.enum(["hi-IN", "en-IN", "mr-IN", "ta-IN", "te-IN", "bn-IN"]).default("en-IN"),
      speaker: z.string().default("meera"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    let targetApiKey = process.env.SARVAM_API_KEY;
    if (req.userId) {
      const u = storage.getUserById(req.userId);
      if (u?.openaiApiKey) targetApiKey = u.openaiApiKey;
    }

    if (!targetApiKey) {
      return res.status(503).json({ error: "Voice synthesis requires an API key" });
    }

    try {
      const response = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": targetApiKey,
        },
        body: JSON.stringify({
          inputs: [parsed.data.text],
          target_language_code: parsed.data.language_code,
          speaker: parsed.data.speaker,
          pitch: 0,
          pace: 1.05,
          loudness: 1.5,
          speech_sample_rate: 8000,
          enable_preprocessing: true,
          model: "bulbul:v1",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Sarvam TTS Error:", errText);
        return res.status(response.status).json({ error: "TTS generation failed" });
      }

      const data: any = await response.json();
      if (data.audios && data.audios.length > 0) {
        res.json({ audioBase64: data.audios[0] });
      } else {
        res.status(500).json({ error: "No audio returned from TTS service" });
      }
    } catch (err: any) {
      console.error("[Voice TTS Error]", err);
      res.status(500).json({ error: "Text-to-speech processing failed" });
    }
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

  // ── Legal Knowledge Base Routes ────────────────────────────────

  // Issue classifier (TypeScript port of case_matching_engine.py)
  const ISSUE_KEYWORDS: Record<string, string[]> = {
    MVA_INJURY: ["accident", "car", "vehicle", "bike", "truck", "road", "crash", "collision", "motor", "rash driving", "hit", "run", "insurance claim", "injury", "mva"],
    CRIME_THEFT: ["theft", "stolen", "steal", "burglary", "robbery", "pickpocket", "dacoity", "chori", "ipc 380", "ipc 379"],
    FAMILY_DIVORCE: ["divorce", "separation", "maintenance", "alimony", "custody", "matrimonial", "husband", "wife", "spouse", "child custody", "talaq", "marriage"],
    CRIME_FRAUD: ["fraud", "cheat", "cheating", "deceive", "forgery", "misrepresentation", "ipc 420", "financial fraud", "scam", "ponzi"],
    CIVIL_CONTRACT: ["contract", "breach", "agreement", "deal", "promise", "damages", "specific performance", "business dispute", "commercial"],
    LABOR_HARASSMENT: ["workplace", "harassment", "sexual harassment", "vishaka", "posh", "employment", "office", "employee", "boss", "job termination", "resign"],
    FAMILY_VIOLENCE: ["domestic violence", "wife beating", "dowry", "cruelty", "ipc 498a", "498a", "husband violence", "dv act", "protection order"],
    LAND_ACQUISITION: ["land", "property", "farm", "agriculture", "plot", "acquisition", "compensation", "survey", "registration", "eviction", "rent"],
    CONSUMER_COMPLAINT: ["consumer", "product", "defective", "refund", "warranty", "ecommerce", "online shopping", "rera", "builder", "deficiency", "service"],
    CONST_RIGHTS: ["fundamental rights", "article 14", "article 21", "constitution", "pil", "writ", "high court", "equality", "discrimination", "ngo"],
  };

  function classifyIssue(query: string): { type: string; confidence: number } {
    const q = query.toLowerCase();
    let best = { type: "GENERAL", confidence: 0 };
    for (const [type, keywords] of Object.entries(ISSUE_KEYWORDS)) {
      const hits = keywords.filter((k) => q.includes(k)).length;
      const confidence = Math.min(hits / 3, 1);
      if (confidence > best.confidence) best = { type, confidence };
    }
    return best;
  }

  // GET /api/legal/search/cases?q=keyword&limit=5
  app.get("/api/legal/search/cases", (req, res) => {
    const rawQ = (req.query.q as string || "").toLowerCase().trim();
    const limit = Math.min(parseInt(req.query.limit as string || "5", 10), 20);

    if (!rawQ) return res.json([]);

    const words = rawQ.split(/\s+/);
    let conditions = [];
    let params: any[] = [];

    for (const word of words) {
      conditions.push(`(lower(case_title) LIKE ? OR lower(summary) LIKE ? OR lower(case_type) LIKE ? OR lower(petitioner) LIKE ? OR lower(issue_categories) LIKE ?)`);
      const w = `%${word}%`;
      params.push(w, w, w, w, w);
    }
    params.push(limit);

    const query = `SELECT * FROM legal_cases WHERE ${conditions.join(" AND ")} ORDER BY year_decided DESC LIMIT ?`;
    const rows = sqlite.prepare(query).all(...params);
    res.json(rows);
  });

  // GET /api/legal/search/laws?q=keyword&limit=5
  app.get("/api/legal/search/laws", (req, res) => {
    const q = `%${(req.query.q as string || "").toLowerCase()}%`;
    const limit = Math.min(parseInt(req.query.limit as string || "5", 10), 20);
    const rows = sqlite
      .prepare(`SELECT ls.*, ll.law_name FROM legal_sections ls
        JOIN legal_laws ll ON ls.law_shortname = ll.law_shortname
        WHERE lower(ls.section_title) LIKE ? OR lower(ls.plain_language) LIKE ? OR lower(ls.law_shortname) LIKE ?
        ORDER BY ls.law_shortname, CAST(ls.section_number AS INTEGER) LIMIT ?`)
      .all(q, q, q, limit);
    res.json(rows);
  });

  // GET /api/legal/search/semantic?q=natural+language+query&limit=5
  app.get("/api/legal/search/semantic", async (req, res) => {
    const rawQ = (req.query.q as string || "").toLowerCase().trim();
    const limit = Math.min(parseInt(req.query.limit as string || "5", 10), 10);

    if (!rawQ) {
      return res.json({ semantic_ready: true, results: [], message: "Query is required." });
    }

    try {
      // 1. Generate embedding for query
      const out = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: rawQ,
      });
      const queryVector = (Array.isArray(out[0]) ? out[0] : out) as number[];

      // 2. Fetch all embedded cases
      const cases = sqlite.prepare("SELECT id, case_title, summary, year_decided, precedent_value, issue_categories, embedding FROM legal_cases WHERE embedding IS NOT NULL").all() as any[];
      
      // 3. Compute cosine similarity distances
      const scoredCases = cases.map(c => {
        let score = 0;
        try {
          const docVector = JSON.parse(c.embedding);
          score = cosineSimilarity(queryVector, docVector);
        } catch (e) {}
        return { ...c, _score: score };
      });

      // 4. Sort and return top N
      scoredCases.sort((a, b) => b._score - a._score);
      const results = scoredCases.slice(0, limit).map(c => {
        const { embedding, _score, ...rest } = c;
        return { ...rest, similarity: _score };
      });

      res.json({
        semantic_ready: true,
        results,
      });

    } catch (err: any) {
      console.error("[Semantic Search Error]", err);
      // Fallback to keyword BM25 if HuggingFace API is down/rate-limited
      const words = rawQ.split(/\s+/).slice(0, 5); 
      const conditions = words.map(() =>
        `(lower(case_title) LIKE ? OR lower(summary) LIKE ? OR lower(issue_categories) LIKE ?)`
      );
      const params: any[] = [];
      for (const word of words) {
        const w = `%${word}%`;
        params.push(w, w, w);
      }
      params.push(limit);

      const rows = sqlite
        .prepare(`SELECT id, case_title, summary, year_decided, precedent_value, issue_categories FROM legal_cases WHERE ${conditions.join(" AND ")} ORDER BY precedent_value DESC, year_decided DESC LIMIT ?`)
        .all(...params);

      res.json({
        semantic_ready: false, 
        upgrade_note: "Vector search unavailable. Showing keyword fallback results.",
        results: rows,
      });
    }
  });

  // GET /api/legal/ecourts/cnr/:cnr
  app.get("/api/legal/ecourts/cnr/:cnr", async (req, res) => {
    const { cnr } = req.params;
    if (!cnr || cnr.length < 10) return res.status(400).json({ error: "Invalid CNR number" });

    if (process.env.ECIAPI_TOKEN) {
      try {
        const eciapiRes = await fetch(`https://eciapi.akshit.me/api/v1/cases/cnr/${cnr}`, {
          headers: { "Authorization": `Bearer ${process.env.ECIAPI_TOKEN}` }
        });
        if (eciapiRes.ok) {
          const data = await eciapiRes.json();
          return res.json({ source: "eciapi", data });
        }
      } catch (err) {
        console.error("ECIAPI Error:", err);
      }
    }

    // Mock fallback response for testing the timeline UI
    res.json({
      source: "mock",
      data: {
        cnr_number: cnr.toUpperCase(),
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
          { date: "2026-02-14", stage: "Evidence", remarks: "Prosecution Witness 2 (PW2) cross-examined by defense counsel." }
        ]
      }
    });
  });

  // GET /api/legal/cases/:id
  app.get("/api/legal/cases/:id", (req, res) => {
    const row = sqlite.prepare("SELECT * FROM legal_cases WHERE id = ? OR case_number = ?")
      .get(req.params.id, req.params.id);
    if (!row) return res.status(404).json({ error: "Case not found" });
    res.json(row);
  });

  // GET /api/legal/laws/:code
  app.get("/api/legal/laws/:code", (req, res) => {
    const law = sqlite.prepare("SELECT * FROM legal_laws WHERE lower(law_shortname) = lower(?)")
      .get(req.params.code);
    if (!law) return res.status(404).json({ error: "Law not found" });
    const sections = sqlite.prepare("SELECT * FROM legal_sections WHERE lower(law_shortname) = lower(?)")
      .all(req.params.code);
    res.json({ ...(law as object), sections });
  });

  // POST /api/legal/chat — classify → fetch matching DB records → optional AI
  app.post("/api/legal/chat", async (req, res) => {
    const body = req.body as { query?: string; userId?: string; language?: string };
    const query = (body.query || "").trim();
    if (!query) return res.status(400).json({ error: "query is required" });

    const { type: issueType, confidence } = classifyIssue(query);

    // Fetch up to 3 related cases
    const caseQ = `%${query.toLowerCase().split(" ").slice(0, 3).join("%")}%`;
    let relatedCases: any[] = sqlite
      .prepare(`SELECT * FROM legal_cases WHERE lower(issue_categories) LIKE ? ORDER BY precedent_value DESC, year_decided DESC LIMIT 3`)
      .all(`%${issueType.toLowerCase()}%`);

    // Fallback: full-text search
    if (relatedCases.length === 0) {
      relatedCases = sqlite
        .prepare(`SELECT * FROM legal_cases WHERE lower(summary) LIKE ? OR lower(case_title) LIKE ? LIMIT 3`)
        .all(caseQ, caseQ);
    }

    // Fetch relevant law sections based on issue type
    const lawKeywords: Record<string, string[]> = {
      MVA_INJURY: ["MVA", "CrPC"], CRIME_THEFT: ["IPC"], CRIME_FRAUD: ["IPC"],
      FAMILY_DIVORCE: ["IPC"], FAMILY_VIOLENCE: ["IPC"], LABOR_HARASSMENT: ["IPC"],
      CIVIL_CONTRACT: ["ICA"], LAND_ACQUISITION: ["LARR Act"],
      CONSUMER_COMPLAINT: ["IPC"], CONST_RIGHTS: ["CrPC"],
    };
    const targetLaws = (lawKeywords[issueType] || ["IPC", "CrPC"]).map((l) => `'${l}'`).join(",");
    const relevantLaws: any[] = sqlite
      .prepare(`SELECT ls.*, ll.law_name FROM legal_sections ls
        JOIN legal_laws ll ON ls.law_shortname = ll.law_shortname
        WHERE ls.law_shortname IN (${targetLaws}) LIMIT 4`)
      .all();

    // Determine AI client: user BYOK > server key > demo
    let activeSarvam = sarvam;
    if (body.userId) {
      const u = storage.getUserById(body.userId);
      if (u?.openaiApiKey) activeSarvam = new OpenAI({ apiKey: u.openaiApiKey, baseURL: "https://api.sarvam.ai/v1" });
    }

    let aiResponse = "";
    const requiresHitl = confidence < 0.40; // Mandatory AI Engineering Guide Threshold

    if (requiresHitl) {
      // Human-in-the-loop (HITL) Fallback Response
      aiResponse = `⚠️ **Review Recommended**\n\nThe details provided are highly specific or lack clear precedent in our immediate database (Confidence: ${(confidence * 100).toFixed(0)}%).\n\n**Action Required:**\n1. Please verify these details with a human legal expert.\n2. Do NOT act solely on this AI advice for critical decisions.\n\n*Related potential areas:* ${relevantLaws.map(l => l.law_name).join(", ")}`;
    } else if (activeSarvam) {
      try {
        const systemPrompt = `You are Nyay Mitra, an AI legal aid assistant for Indian citizens. The user's query has been classified as: ${issueType} (confidence: ${(confidence * 100).toFixed(0)}%). Provide concise, helpful legal information citing relevant Indian laws and cases. Always recommend consulting a qualified lawyer. Language: ${body.language || "en"}.`;
        const completion = await activeSarvam.chat.completions.create({
          model: "sarvam-30b",
          temperature: 0.3,
          messages: [
            { role: "user", content: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}\n\n[USER MESSAGE]\n${query}` },
          ],
          max_tokens: 600,
        });
        aiResponse = completion.choices[0].message.content || "";
      } catch (err: any) {
        console.error("[Sarvam API Error in /legal/chat]", err.message, err.error || "");
      }
    } else {
      console.warn("[Sarvam API Warning] activeSarvam client is null. process.env.SARVAM_API_KEY might be missing.");
    }

    res.json({ issueType, confidence, requiresHitl, relatedCases, relevantLaws, aiResponse });
  });

  // ── Sarvam Diagnostics ─────────────────────────────────────────
  app.get("/api/test-sarvam", async (_req, res) => {
    if (!sarvam) {
      return res.status(500).json({ error: "Sarvam is NOT connected. process.env.SARVAM_API_KEY is missing from environment." });
    }
    try {
      const completion = await sarvam.chat.completions.create({
        model: "sarvam-30b",
        messages: [{ role: "user", content: "Say 'Hello from Sarvam API!'" }],
      });
      res.json({ success: true, response: completion.choices[0].message.content });
    } catch (e: any) {
      res.status(500).json({ error: "Sarvam connection failed", details: e.message, code: e.status || 500 });
    }
  });

  // ── IndianKanoon Live Case Search ──────────────────────────────────────
  app.get("/api/legal/ik-search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    if (!query) return res.status(400).json({ error: "q is required" });

    try {
      // IndianKanoon search API — free for non-commercial use
      const ikUrl = `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(query)}&pagenum=0`;
      const response = await fetch(ikUrl, {
        headers: {
          "Authorization": `Token ${process.env.INDIANKANOON_API_TOKEN || ""}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        // Graceful fallback: return local DB results if IK API fails
        console.warn(`[IndianKanoon] API returned ${response.status}, falling back to local DB`);
        const localResults = sqlite
          .prepare(`SELECT * FROM legal_cases WHERE lower(case_title) LIKE ? OR lower(summary) LIKE ? ORDER BY precedent_value DESC LIMIT 10`)
          .all(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`);
        return res.json({ source: "local_db", results: localResults });
      }

      const data: any = await response.json();
      // Map IndianKanoon response shape to our standard case shape
      const results = (data.docs || []).map((doc: any) => ({
        id: doc.tid || String(Math.random()),
        case_title: doc.title || doc.docsource,
        case_number: doc.citation || "",
        court_type: doc.docsource || "Unknown Court",
        year_decided: doc.publishdate ? new Date(doc.publishdate).getFullYear() : null,
        summary: doc.headline || "",
        precedent_value: 70, // IK results are generally high-quality precedents
        source: "indiankanoon",
        url: `https://indiankanoon.org/doc/${doc.tid}/`,
      }));

      res.json({ source: "indiankanoon", results });
    } catch (err: any) {
      console.error("[IndianKanoon Error]", err.message);
      // Always fall back gracefully to local DB
      const localResults = sqlite
        .prepare(`SELECT * FROM legal_cases WHERE lower(case_title) LIKE ? OR lower(summary) LIKE ? ORDER BY precedent_value DESC LIMIT 10`)
        .all(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`);
      res.json({ source: "local_db_fallback", results: localResults });
    }
  });

  // ── Legal News RSS Proxy (LiveLaw + Bar & Bench) ────────────────────────
  app.get("/api/legal/news", async (_req, res) => {
    const RSS_FEEDS = [
      { name: "LiveLaw", url: "https://www.livelaw.in/feed/", color: "#1a56db" },
      { name: "Bar & Bench", url: "https://prod-qt-images.s3.amazonaws.com/bb/rss.xml", color: "#047857" },
    ];

    try {
      const fetchFeed = async (feed: { name: string; url: string; color: string }) => {
        const r = await fetch(feed.url, {
          headers: { "User-Agent": "NyayMitra/1.0 legal-news-aggregator" },
          signal: AbortSignal.timeout(5000),
        });
        const xml = await r.text();
        // Simple regex parser — no external XML dependency needed
        const items: any[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
          const block = match[1];
          const get = (tag: string) => {
            const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([^<]*)<\/${tag}>`));
            return m ? (m[1] || m[2] || "").trim() : "";
          };
          const pubDate = get("pubDate");
          items.push({
            title: get("title"),
            link: get("link"),
            description: get("description").substring(0, 200) + "…",
            pubDate,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
            source: feed.name,
            sourceColor: feed.color,
          });
        }
        return items;
      };

      const [livelaw, barandbench] = await Promise.allSettled([
        fetchFeed(RSS_FEEDS[0]),
        fetchFeed(RSS_FEEDS[1]),
      ]);

      const allItems = [
        ...(livelaw.status === "fulfilled" ? livelaw.value : []),
        ...(barandbench.status === "fulfilled" ? barandbench.value : []),
      ].sort((a, b) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return db - da;
      });

      res.json({ items: allItems, fetchedAt: new Date().toISOString() });
    } catch (err: any) {
      console.error("[News RSS Error]", err.message);
      res.status(503).json({ error: "News feed temporarily unavailable", items: [] });
    }
  });

  // ── Health and Readiness checks ───────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    // Liveness probe: is the process running?
    res.status(200).json({ status: "ok", service: "Nyay Mitra API" });
  });

  app.get("/api/ready", (_req, res) => {
    // Readiness probe: is the DB available?
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
      res.status(503).json({
        status: "error",
        db: "unavailable",
      });
    }
  });

  return httpServer;
}
