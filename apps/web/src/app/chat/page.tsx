"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Bot, Mic, MicOff, Volume2, VolumeX, StopCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What are my rights if I get arrested?",
  "How do I file an RTI application?",
  "What is Section 498A IPC?",
  "How to get free legal aid in India?",
  "What is NALSA and who is eligible?",
];

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! 🙏 I am Nyay Mitra, your AI Legal Assistant powered by Sarvam AI. I can help you understand your legal rights, explain laws in simple language, and guide you through legal procedures. How can I assist you today?\n\n*न्याय मित्र आपकी सेवा में उपस्थित है।*",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [, setSpeechStatus] = useState<"idle" | "listening" | "processing">("idle");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Detect browser speech support
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRec && !!window.speechSynthesis);
  }, []);

  // TTS: speak the AI reply
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const clean = text
      .replace(/[*_~`#]/g, "")         // strip markdown
      .replace(/https?:\/\/\S+/g, "")  // strip URLs
      .substring(0, 500);              // limit length
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  // Stop TTS
  const stopSpeech = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  // Start voice recognition
  const startListening = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    stopSpeech(); // Stop TTS while listening

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechStatus("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      setInput(final || interim);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSpeechStatus("idle");
    };

    recognition.onend = () => {
      setIsListening(false);
      setSpeechStatus("idle");
      // If there's text captured, focus the input
      inputRef.current?.focus();
    };

    recognition.start();
  }, []);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setSpeechStatus("idle");
  }, []);

  // Toggle mic
  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  async function sendMessage(text: string = input) {
    if (!text.trim() || loading) return;
    stopListening();
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      const reply = data.reply || data.message || "I'm sorry, I couldn't process that request. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      const errMsg = "⚠️ Unable to connect to the AI service right now. Please ensure the backend server is running or try again shortly.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Keyframes */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .typing-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--ink-muted);
          animation: pulse-dot 1.2s infinite;
        }
        .mic-ring {
          animation: pulse-ring 1.4s ease-out infinite;
        }
        .msg-bubble { animation: fadeUp 0.25s ease; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .voice-btn:hover { transform: scale(1.08); }
        .voice-btn { transition: all 0.18s ease; }
        .send-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,46,26,0.25); }
        .send-btn { transition: all 0.2s; }
        .quick-btn:hover { background: var(--forest) !important; color: var(--gold-pale) !important; border-color: var(--forest) !important; }
        .quick-btn { transition: all 0.18s; }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--forest)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "0 clamp(16px,4vw,48px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
            <ArrowLeft size={14} /> Home
          </Link>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ivory)" }}>Legal Aid Chat</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(201,146,10,0.15)", color: "var(--gold)", padding: "3px 10px", borderRadius: 10, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            <div style={{ width: 5, height: 5, background: "var(--gold)", borderRadius: "50%", animation: "pulse-dot 2s infinite" }} />
            Sarvam AI
          </div>
        </div>

        {/* TTS toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {voiceSupported && (
            <button
              onClick={() => { setTtsEnabled(p => !p); if (ttsEnabled) stopSpeech(); }}
              title={ttsEnabled ? "Mute AI voice" : "Enable AI voice"}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: ttsEnabled ? "var(--gold)" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}
            >
              {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {ttsEnabled ? "Voice ON" : "Voice OFF"}
            </button>
          )}
          {!voiceSupported && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 0.5 }}>Use Chrome/Edge for voice</span>
          )}
        </div>
      </nav>

      {/* ── Messages ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px clamp(16px,4vw,48px)", display: "flex", flexDirection: "column", gap: 16, maxWidth: 860, width: "100%", margin: "0 auto" }}>
        {messages.map((msg, i) => (
          <div key={i} className="msg-bubble" style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bot size={16} color="var(--gold)" />
              </div>
            )}
            <div style={{
              maxWidth: "75%",
              background: msg.role === "user" ? "var(--forest)" : "var(--ivory)",
              color: msg.role === "user" ? "var(--gold-pale)" : "var(--ink)",
              border: msg.role === "user" ? "none" : "1px solid var(--border-color)",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px",
              fontSize: 14,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot size={16} color="var(--gold)" />
            </div>
            <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: "18px 18px 18px 4px", padding: "14px 18px", display: "flex", gap: 6 }}>
              {[0, 1, 2].map(j => (
                <div key={j} className="typing-dot" style={{ animationDelay: `${j * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Prompts ─────────────────────────────────────────────── */}
      {messages.length === 1 && (
        <div style={{ padding: "0 clamp(16px,4vw,48px) 12px", maxWidth: 860, width: "100%", margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Quick Questions</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map(q => (
              <button key={q} className="quick-btn" onClick={() => sendMessage(q)} style={{
                padding: "8px 14px", background: "var(--ivory)", border: "1px solid var(--border-color)",
                borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--ink-mid)",
                cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif"
              }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Bar ─────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border-color)", background: "var(--ivory)", padding: "16px clamp(16px,4vw,48px)" }}>
        {/* Listening status banner */}
        {isListening && (
          <div style={{ maxWidth: 860, margin: "0 auto 10px", display: "flex", alignItems: "center", gap: 10, background: "rgba(26,46,26,0.06)", borderRadius: 10, padding: "8px 14px", border: "1px solid rgba(26,46,26,0.12)" }}>
            <div style={{ position: "relative", width: 12, height: 12 }}>
              <div className="mic-ring" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#dc2626", opacity: 0.6 }} />
              <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#dc2626" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#dc2626", letterSpacing: 0.5 }}>Listening… speak now</span>
            <span style={{ fontSize: 11, color: "var(--ink-muted)", marginLeft: "auto" }}>Hindi & English supported</span>
          </div>
        )}

        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 10, alignItems: "center" }}>
          {/* Mic button */}
          {voiceSupported && (
            <button
              id="voice-mic-btn"
              className="voice-btn"
              onClick={toggleMic}
              disabled={loading}
              title={isListening ? "Stop listening" : "Speak your question (Hindi/English)"}
              style={{
                width: 48, height: 48, borderRadius: 12, border: "none",
                background: isListening ? "#dc2626" : "var(--forest)",
                color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, opacity: loading ? 0.5 : 1,
                boxShadow: isListening ? "0 0 0 4px rgba(220,38,38,0.2)" : "none",
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <input
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={voiceSupported ? "Type or use the mic to ask in Hindi/English…" : "Ask any legal question in English or Hindi…"}
            disabled={loading}
            style={{
              flex: 1, padding: "14px 18px",
              border: `1px solid ${isListening ? "rgba(220,38,38,0.4)" : "var(--border-color)"}`,
              borderRadius: 12,
              fontFamily: "'Instrument Sans', sans-serif", fontSize: 14,
              color: "var(--ink)", background: "var(--cream)", outline: "none",
              transition: "border-color 0.2s",
            }}
          />

          {/* Stop TTS while playing */}
          {ttsEnabled && (
            <button
              onClick={stopSpeech}
              title="Stop speaking"
              style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--border-color)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)", flexShrink: 0 }}
            >
              <StopCircle size={16} />
            </button>
          )}

          <button
            id="chat-send-btn"
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              padding: "14px 20px", background: loading || !input.trim() ? "var(--border-color)" : "var(--forest)",
              color: loading || !input.trim() ? "var(--ink-muted)" : "var(--gold-pale)",
              border: "none", borderRadius: 12,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, fontWeight: 600,
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send
          </button>
        </div>
        <p style={{ maxWidth: 860, margin: "8px auto 0", fontSize: 11, color: "var(--ink-muted)", textAlign: "center" }}>
          AI-generated responses are for guidance only and not a substitute for professional legal advice.
          {voiceSupported && " • 🎤 Voice input supported in Hindi & English"}
        </p>
      </div>
    </div>
  );
}
