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
    .replace(/\b\d{12}\b/g, "[AADHAAR_REDACTED]")
    .replace(/\b[6-9]\d{9}\b/g, "[PHONE_REDACTED]")
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[EMAIL_REDACTED]");
}

function applyGuardrails(text: string): string {
  let clean = text;
  FORBIDDEN_COMPLETIONS.forEach(pattern => {
    clean = clean.replace(pattern, "[response moderated]");
  });
  return clean;
}

/**
 * Build a Sarvam-compatible message array.
 *
 * Sarvam rules:
 *  - No "system" role — must be "user" or "assistant" only
 *  - Messages must STRICTLY alternate user → assistant → user → ...
 *  - First message MUST be "user"
 *
 * The frontend history often starts with an assistant greeting, so we must
 * strip all leading assistant messages. We also merge any consecutive
 * same-role messages to guarantee strict alternation.
 */
function buildMessages(
  safeMessage: string,
  history: { role: string; content: string }[]
): { role: string; content: string }[] {
  const SYSTEM_INSTRUCTIONS =
    "[You are Nyay Mitra, a bilingual (English/Hindi) Indian legal aid assistant. " +
    "Give accurate guidance grounded in Indian law (IPC, CrPC, BNS, Constitution). " +
    "Always recommend consulting a qualified lawyer for complex matters. " +
    "Mention NALSA 15100 helpline for free legal aid. Keep answers concise and accessible.]";

  // 1. Keep only user/assistant turns from history
  const cleaned = history
    .filter(h => h.role === "user" || h.role === "assistant")
    .slice(-10);

  // 2. Drop leading assistant messages — Sarvam requires first msg = user
  let start = 0;
  while (start < cleaned.length && cleaned[start].role !== "user") start++;
  const trimmed = cleaned.slice(start);

  // 3. Enforce strict alternation by merging consecutive same-role messages
  const alternating: { role: string; content: string }[] = [];
  for (const h of trimmed) {
    if (alternating.length > 0 && alternating[alternating.length - 1].role === h.role) {
      alternating[alternating.length - 1].content += "\n" + h.content;
    } else {
      alternating.push({ role: h.role, content: h.content });
    }
  }

  // 4. Inject system instructions into the very first user message
  const withSystem = alternating.map((h, i) =>
    i === 0 && h.role === "user"
      ? { role: "user", content: `${SYSTEM_INSTRUCTIONS}\n\n${h.content}` }
      : h
  );

  // 5. Append current user message
  //    - If no history: system instructions + current message as single user turn
  //    - If last message in history is user (after alternation): merge to avoid two consecutive user turns
  //    - Otherwise: append normally
  if (withSystem.length === 0) {
    return [{ role: "user", content: `${SYSTEM_INSTRUCTIONS}\n\n${safeMessage}` }];
  }

  const last = withSystem[withSystem.length - 1];
  if (last.role === "user") {
    // Merge into last user message — avoids consecutive user turns
    return [
      ...withSystem.slice(0, -1),
      { role: "user", content: `${last.content}\n\n${safeMessage}` },
    ];
  }

  return [...withSystem, { role: "user", content: safeMessage }];
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a minute." },
      { status: 429 }
    );
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

  const sarvamKey = process.env.SARVAM_API_KEY?.trim();
  if (!sarvamKey) {
    return NextResponse.json({
      reply:
        "I'm Nyay Mitra AI. The AI engine is currently being configured. " +
        "In the meantime, please call NALSA's free helpline at 15100, or try the NALSA Eligibility Checker on this platform.",
      IS_AI_GENERATED: false,
      degraded: true,
    });
  }

  const safeMessage = stripPii(message);
  const messages = buildMessages(safeMessage, history);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const sarvamRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Subscription-Key": sarvamKey,
      },
      body: JSON.stringify({ messages, model: "sarvam-m", temperature: 0.4, max_tokens: 800 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("[chat-api] Sarvam error:", sarvamRes.status, errText.slice(0, 300));
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await sarvamRes.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "";
    // Strip <think>...</think> reasoning blocks returned by the model
    const strippedReply = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    const reply = applyGuardrails(strippedReply);

    return NextResponse.json({ reply, IS_AI_GENERATED: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "AI request timed out. Please retry." }, { status: 504 });
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chat-api] Unexpected error:", msg);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
