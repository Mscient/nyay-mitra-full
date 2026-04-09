// AI-GENERATED: Antigravity
// Complies with .cursor/rules: rate-limiting, PII strip, no hardcoded keys,
// timeout < 10s, IS_AI_GENERATED flag in response.
import { NextRequest, NextResponse } from "next/server";

const RATE_MAP = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 60; // 60 req/min per IP
const WINDOW_MS = 60_000;

// Guardrails — phrases the AI must never assert
const FORBIDDEN_COMPLETIONS = [/you will win/i, /you have a strong case/i, /i advise you to/i];

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_MAP.get(ip);
  if (!entry || entry.reset < now) {
    RATE_MAP.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Strip obvious PII patterns before sending to AI
function stripPii(text: string): string {
  return text
    .replace(/\b\d{12}\b/g, "[AADHAAR_REDACTED]")        // Aadhaar
    .replace(/\b[6-9]\d{9}\b/g, "[PHONE_REDACTED]")       // Indian mobile
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[EMAIL_REDACTED]"); // email
}

function applyGuardrails(text: string): string {
  let clean = text;
  FORBIDDEN_COMPLETIONS.forEach(pattern => {
    clean = clean.replace(pattern, "[response moderated]");
  });
  return clean;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 });
  }

  let body: { message: string; history?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const sarvamKey = process.env.SARVAM_API_KEY;
  if (!sarvamKey) {
    // Graceful degradation — return a template response guiding to NALSA
    return NextResponse.json({
      reply: "I'm Nyay Mitra AI. The AI engine is currently being configured. In the meantime, please call NALSA's free helpline at 15100, or try the NALSA Eligibility Checker on this platform.",
      IS_AI_GENERATED: false,
      degraded: true,
    });
  }

  // Strip PII before sending to external AI
  const safeMessage = stripPii(message);

  const systemPrompt = `You are Nyay Mitra — a bilingual (English/Hindi) Indian legal aid assistant. You help Indian citizens understand their rights and navigate legal procedures. You MUST:
1. Give accurate, empathetic guidance grounded in Indian law (IPC, CrPC, BNS, Constitution, etc.)
2. Always recommend consulting a qualified lawyer for complex matters
3. Never say "you will win", "you have a strong case", or "I advise you to" (guardrail rule)
4. If asked about NALSA free legal aid, always mention the 15100 helpline
5. Keep answers concise, clear, and accessible to first-time users`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: safeMessage },
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000); // < 10s as per rules

    const sarvamRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "API-Subscription-Key": sarvamKey },
      body: JSON.stringify({ messages, model: "sarvam-m", temperature: 0.4, max_tokens: 800 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("[chat-api] Sarvam error:", sarvamRes.status, errText.slice(0, 200));
      return NextResponse.json({ error: "AI service temporarily unavailable. Please try again." }, { status: 502 });
    }

    const data = await sarvamRes.json();
    const rawReply = data.choices?.[0]?.message?.content ?? "";
    const reply = applyGuardrails(rawReply);

    return NextResponse.json({ reply, IS_AI_GENERATED: true });
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "AI request timed out. Please retry." }, { status: 504 });
    }
    console.error("[chat-api] Unexpected error:", err.message);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
