import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Moon, Sun, Plus, Trash2, Send,
  Copy, CheckCheck, Menu, X,
  Gavel, Heart, Briefcase, ShoppingCart, Home,
  FileText, BookOpen, Shield, MessageSquare, LogIn, Key,
  ChevronDown, ChevronUp, Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { icon: any; label: Record<string, string>; emoji: string }> = {
  general:       { icon: MessageSquare, emoji: "⚖️", label: { en: "General",        hi: "सामान्य",       mr: "सामान्य" } },
  criminal:      { icon: Gavel,         emoji: "🔨", label: { en: "Criminal",        hi: "आपराधिक",       mr: "फौजदारी" } },
  family:        { icon: Heart,         emoji: "❤️", label: { en: "Family",          hi: "परिवार",         mr: "कुटुंब" } },
  labor:         { icon: Briefcase,     emoji: "💼", label: { en: "Labour",          hi: "श्रम",           mr: "कामगार" } },
  consumer:      { icon: ShoppingCart,  emoji: "🛒", label: { en: "Consumer",        hi: "उपभोक्ता",       mr: "ग्राहक" } },
  property:      { icon: Home,          emoji: "🏠", label: { en: "Property",        hi: "संपत्ति",         mr: "मालमत्ता" } },
  rti:           { icon: FileText,      emoji: "📋", label: { en: "RTI",             hi: "आरटीआई",         mr: "आरटीआय" } },
  constitutional:{ icon: BookOpen,      emoji: "📜", label: { en: "Constitutional",  hi: "संवैधानिक",       mr: "संवैधानिक" } },
  women:         { icon: Shield,        emoji: "🛡️", label: { en: "Women's Rights",  hi: "महिला",          mr: "महिला" } },
};

interface Session { id: string; title: string; category: string; language: string; createdAt: number; }
interface Message { id: string; sessionId: string; role: string; content: string; language: string; citations: string | null; createdAt: number; }

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^###\s+(.+)$/gm, '<h3 style="font-family:\'Cormorant Garamond\',serif;font-size:17px;font-weight:600;margin:12px 0 4px">$1</h3>')
    .replace(/^##\s+(.+)$/gm,  '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:19px;font-weight:600;margin:14px 0 5px">$1</h2>')
    .replace(/^•\s+(.+)$/gm, '<li style="margin-left:16px;list-style:disc">$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li style="margin-left:16px;list-style:decimal">$1</li>')
    .replace(/\n{2,}/g, '</p><p style="margin-top:8px">')
    .replace(/\n/g, '<br/>');
}

const CaseCard = ({ data }: { data: any }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ marginTop: 8, background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Scale size={14} color="var(--gold)" />
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{data.case_title} ({data.year_decided})</span>
        </div>
        {expanded ? <ChevronUp size={14} color="var(--ink-muted)" /> : <ChevronDown size={14} color="var(--ink-muted)" />}
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.05)", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{ padding: "2px 6px", background: "var(--cream-dark)", borderRadius: 4 }}>{data.court_type}</span>
            <span style={{ padding: "2px 6px", background: data.outcome?.includes("Won") ? "#dcfce7" : "var(--cream-dark)", color: data.outcome?.includes("Won") ? "#166534" : "var(--ink-muted)", borderRadius: 4 }}>{data.outcome}</span>
          </div>
          <p><strong>Summary:</strong> {data.summary}</p>
          <p style={{ marginTop: 4 }}><strong>Principles:</strong> {(() => { try { return JSON.parse(data.legal_principles).join(", ") } catch { return data.legal_principles; }})() }</p>
        </div>
      )}
    </div>
  );
};

const LawCard = ({ data }: { data: any }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ marginTop: 8, background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOpen size={14} color="var(--gold)" />
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{data.law_shortname} - Sec {data.section_number}: {data.section_title}</span>
        </div>
        {expanded ? <ChevronUp size={14} color="var(--ink-muted)" /> : <ChevronDown size={14} color="var(--ink-muted)" />}
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.05)", fontSize: 12, lineHeight: 1.5 }}>
          <p style={{ color: "var(--ink-muted)", fontStyle: "italic", marginBottom: 6 }}>"{data.section_text}"</p>
          <p style={{ color: "var(--ink)", fontWeight: 500 }}><strong>Meaning:</strong> {data.plain_language}</p>
        </div>
      )}
    </div>
  );
};

export default function ChatPage() {
  const [, params] = useRoute("/chat/:sessionId");
  const [, navigate] = useLocation();
  const { user, setApiKey, removeApiKey } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(params?.sessionId || null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    refetchInterval: 30_000,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/sessions", activeSessionId, "messages"],
    queryFn: async () => {
      if (!activeSessionId) return [];
      const res = await apiRequest("GET", `/api/sessions/${activeSessionId}/messages`);
      return res.json();
    },
    enabled: !!activeSessionId,
  });

  const createSession = useMutation({
    mutationFn: async (category: string) => {
      const res = await apiRequest("POST", "/api/sessions", { category, language });
      return res.json() as Promise<Session>;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setActiveSessionId(session.id);
      navigate(`/chat/${session.id}`);
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId: string }) => {
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/chat`, { message, language });
      return res.json();
    },
    onMutate: () => setIsTyping(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", activeSessionId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setIsTyping(false);
    },
    onError: (err: any) => {
      setIsTyping(false);
      toast({ title: t("errorTitle"), description: err.message, variant: "destructive" });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/sessions/${id}`); },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      if (activeSessionId === id) { setActiveSessionId(null); navigate("/chat"); }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    const msg = inputValue.trim();
    if (!msg) return;
    setInputValue("");
    let sessionId = activeSessionId;
    if (!sessionId) {
      const session = await createSession.mutateAsync("general");
      sessionId = session.id;
    }
    sendMessage.mutate({ message: msg, sessionId });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function selectSession(id: string) {
    setActiveSessionId(id);
    navigate(`/chat/${id}`);
    setSidebarOpen(false);
  }

  async function startNewSession(category = "general") {
    await createSession.mutateAsync(category);
    setSidebarOpen(false);
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // ── SIDEBAR ──────────────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: mobile ? "100%" : 288, background: "var(--forest)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/">
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, background: "rgba(201,146,10,0.2)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(201,146,10,0.3)" }}>
              <span style={{ fontSize: 14 }}>⚖️</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600, color: "var(--gold-pale)", lineHeight: 1 }}>Nyay Mitra</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>AI Legal</div>
            </div>
          </div>
        </Link>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* New Consultation */}
      <div style={{ padding: "12px 12px 8px" }}>
        <button
          onClick={() => startNewSession()}
          data-testid="button-new-session"
          style={{
            width: "100%", padding: "10px 14px",
            background: "var(--gold)", color: "var(--forest)",
            border: "none", borderRadius: 8, fontFamily: "'Instrument Sans', sans-serif",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s"
          }}
        >
          <Plus size={14} />
          {t("newSession")}
        </button>
      </div>

      {/* Category grid */}
      <div style={{ padding: "0 12px 8px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8, paddingLeft: 2 }}>{t("categories")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {Object.entries(CATEGORY_META).filter(([k]) => k !== "general").map(([key, meta]) => {
            const label = meta.label[language as keyof typeof meta.label] || meta.label.en;
            return (
              <button
                key={key}
                onClick={() => startNewSession(key)}
                data-testid={`sidebar-cat-${key}`}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)",
                  fontSize: 10, fontFamily: "'Instrument Sans', sans-serif",
                  transition: "all 0.15s", textAlign: "center"
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,146,10,0.15)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
              >
                <span style={{ fontSize: 14 }}>{meta.emoji}</span>
                <span style={{ lineHeight: 1.2 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BYOK */}
      {user && (
        <div style={{ padding: "0 12px 8px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8, paddingLeft: 2 }}>Use Your Own GPT</div>
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {user.hasApiKey ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={14} color="#4ade80" />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", flex: 1 }}>API key active ✓</span>
                <button
                  onClick={async () => { setSavingKey(true); try { await removeApiKey(); } finally { setSavingKey(false); } }}
                  disabled={savingKey}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#f87171", fontWeight: 600 }}
                >Remove</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    style={{
                      flex: 1, fontSize: 12, background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                      padding: "6px 10px", color: "rgba(255,255,255,0.8)",
                      fontFamily: "'Instrument Sans', sans-serif", outline: "none"
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (!apiKeyInput.trim()) return;
                      setSavingKey(true);
                      try { await setApiKey(apiKeyInput.trim()); setApiKeyInput(""); } finally { setSavingKey(false); }
                    }}
                    disabled={savingKey || !apiKeyInput.trim()}
                    style={{
                      background: "var(--gold)", color: "var(--forest)",
                      border: "none", borderRadius: 6, padding: "6px 12px",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      opacity: savingKey || !apiKeyInput.trim() ? 0.5 : 1
                    }}
                  >Save</button>
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>Enter your OpenAI API key for real AI responses</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Past Consultations */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8, paddingLeft: 2 }}>
          {t("sessionHistory")}
        </div>
        {sessionsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 24, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{t("noSessions")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sessions.map(s => {
              const meta = CATEGORY_META[s.category] || CATEGORY_META.general;
              const isActive = activeSessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  data-testid={`session-${s.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 10px", borderRadius: 8, cursor: "pointer",
                    background: isActive ? "rgba(201,146,10,0.2)" : "transparent",
                    transition: "all 0.15s",
                    color: isActive ? "var(--gold-pale)" : "rgba(255,255,255,0.55)"
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 13, flexShrink: 0 }}>{meta.emoji}</span>
                  <span style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Instrument Sans', sans-serif" }}>{s.title}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteSession.mutate(s.id); }}
                    data-testid={`delete-session-${s.id}`}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(255,255,255,0.25)", opacity: 0, transition: "opacity 0.15s" }}
                    className="session-delete-btn"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(201,146,10,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--gold-pale)" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
          </div>
        ) : (
          <Link href="/login">
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
              <LogIn size={15} />
              <span>{t("login")} to save history</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  // ── MAIN ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden", background: "var(--cream)" }}>

      {/* Desktop Sidebar */}
      <div style={{ display: "flex", flexShrink: 0 }} className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }} className="md:hidden">
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,20,16,0.6)" }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 288, boxShadow: "var(--shadow-lg)" }}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Chat Header */}
        <div style={{
          height: 60, borderBottom: "1px solid var(--border-gold)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", background: "rgba(255,253,247,0.92)",
          backdropFilter: "blur(16px)", flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
              style={{ display: "flex", padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-muted)" }}
              className="md:hidden"
            >
              <Menu size={20} />
            </button>

            {activeSession ? (
              <>
                <span style={{ fontSize: 16 }}>{(CATEGORY_META[activeSession.category] || CATEGORY_META.general).emoji}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{activeSession.title}</span>
                <div className="online-pill" style={{ marginLeft: 4 }}>
                  <div className="online-dot" />
                  Online
                </div>
              </>
            ) : (
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, color: "var(--ink-muted)" }}>Nyay Mitra AI — Legal Guidance</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Language */}
            <div style={{ display: "flex", gap: 2, background: "var(--cream-dark)", borderRadius: 8, padding: 3 }}>
              {(Object.keys(LANGUAGES) as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  data-testid={`chat-lang-${l}`}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 500, fontFamily: "'Instrument Sans', sans-serif",
                    background: language === l ? "var(--ivory)" : "transparent",
                    color: language === l ? "var(--ink)" : "var(--ink-muted)",
                    boxShadow: language === l ? "var(--shadow-sm)" : "none",
                    transition: "all 0.15s"
                  }}
                >
                  {LANGUAGES[l].nativeLabel}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              data-testid="toggle-theme-chat"
              style={{ padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-muted)" }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {!activeSessionId ? (
            /* Welcome */
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 24 }}>
              <div className="animate-fade-in" style={{ textAlign: "center", maxWidth: 500 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(26,46,26,0.08)", border: "2px solid var(--border-gold)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>⚖️</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>{t("welcome")}</h2>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: 28 }}>{t("welcomeDesc")}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                  {Object.entries(CATEGORY_META).filter(([k]) => k !== "general").slice(0, 6).map(([key, meta]) => {
                    const label = meta.label[language as keyof typeof meta.label] || meta.label.en;
                    return (
                      <button
                        key={key}
                        onClick={() => startNewSession(key)}
                        data-testid={`welcome-cat-${key}`}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                          padding: "14px 8px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                          background: "var(--ivory)", border: "1px solid var(--border-color)",
                          fontSize: 12, color: "var(--ink-mid)", fontFamily: "'Instrument Sans', sans-serif"
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-gold)"; (e.currentTarget as HTMLElement).style.background = "var(--gold-whisper)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLElement).style.background = "var(--ivory)"; }}
                      >
                        <span style={{ fontSize: 20 }}>{meta.emoji}</span>
                        <span style={{ lineHeight: 1.3, textAlign: "center" }}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : messagesLoading ? (
            <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
              {[1,2].map(i => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: "75%", borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: "50%", borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 24 }}>
              <div style={{ textAlign: "center" }} className="animate-fade-in">
                <MessageSquare size={36} color="var(--ink-faint)" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>{t("welcomeDesc")}</p>
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px 24px", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className="animate-fade-in"
                  data-testid={`message-${msg.id}`}
                  style={{
                    display: "flex", gap: 10, animationDelay: `${idx * 0.04}s`,
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    maxWidth: "82%",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start"
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, marginTop: 2,
                    background: msg.role === "user" ? "var(--gold)" : "var(--forest)",
                    color: msg.role === "user" ? "var(--ivory)" : "var(--gold-pale)"
                  }}>
                    {msg.role === "user" ? (user?.name?.charAt(0)?.toUpperCase() || "U") : "NM"}
                  </div>

                  {/* Bubble */}
                  <div style={{
                    padding: "12px 16px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.65,
                    background: msg.role === "user" ? "var(--forest)" : "var(--ivory)",
                    color: msg.role === "user" ? "var(--gold-pale)" : "var(--ink)",
                    border: msg.role === "user" ? "none" : "1px solid var(--border-color)",
                    borderTopRightRadius: msg.role === "user" ? 4 : 14,
                    borderTopLeftRadius: msg.role === "assistant" ? 4 : 14,
                  }}>
                    {msg.role === "assistant" ? (
                      <div className="prose-legal" dangerouslySetInnerHTML={{ __html: `<p>${parseMarkdown(msg.content)}</p>` }} />
                    ) : (
                      <span>{msg.content}</span>
                    )}

                    {/* Citations / DB Results */}
                    {msg.citations && (() => {
                      try {
                        let parsed = JSON.parse(msg.citations);
                        // Backwards compatibility with old array of strings
                        if (Array.isArray(parsed)) {
                          parsed = { inline: parsed, cases: [], laws: [] };
                        }
                        
                        const hasInline = parsed.inline && parsed.inline.length > 0;
                        const hasCases = parsed.cases && parsed.cases.length > 0;
                        const hasLaws = parsed.laws && parsed.laws.length > 0;
                        
                        if (!hasInline && !hasCases && !hasLaws) return null;

                        return (
                          <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid var(--border-gold)" }}>
                            {hasInline && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                {parsed.inline.map((c: string, i: number) => (
                                  <span key={i} className="cite-badge">📚 {c}</span>
                                ))}
                              </div>
                            )}
                            
                            {hasLaws && (
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-faint)", letterSpacing: 1, marginBottom: 4 }}>Relevant Laws</div>
                                {parsed.laws.map((lawData: any, i: number) => <LawCard key={i} data={lawData} />)}
                              </div>
                            )}
                            
                            {hasCases && (
                              <div style={{ marginBottom: 4 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-faint)", letterSpacing: 1, marginBottom: 4 }}>Related Cases</div>
                                {parsed.cases.map((caseData: any, i: number) => <CaseCard key={i} data={caseData} />)}
                              </div>
                            )}
                          </div>
                        );
                      } catch (e) { console.error("Could not parse citations", e); return null; }
                    })()}

                    {/* Copy button for AI messages */}
                    {msg.role === "assistant" && (
                      <div style={{ display: "flex", marginTop: 6, paddingTop: 4 }}>
                        <button
                          onClick={() => copyMessage(msg.content, msg.id)}
                          data-testid={`copy-${msg.id}`}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 3, color: "var(--ink-faint)", borderRadius: 4 }}
                        >
                          {copiedId === msg.id ? <CheckCheck size={13} color="var(--teal)" /> : <Copy size={13} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="animate-fade-in" style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--gold-pale)", flexShrink: 0 }}>NM</div>
                  <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 14, borderTopLeftRadius: 4, padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <span style={{ fontSize: 12, color: "var(--ink-muted)", marginLeft: 8 }}>{t("thinking")}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          borderTop: "1px solid var(--border-gold)", padding: "14px 20px",
          background: "rgba(255,253,247,0.95)", backdropFilter: "blur(12px)", flexShrink: 0
        }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p style={{ fontSize: 11, color: "var(--ink-faint)", textAlign: "center", marginBottom: 10 }}>
              {t("disclaimer")}
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("typeMessage")}
                rows={1}
                data-testid="chat-input"
                style={{
                  flex: 1, border: "1px solid var(--border-color)", borderRadius: 10,
                  padding: "11px 14px", fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: 14, background: "var(--cream)", color: "var(--ink)",
                  outline: "none", resize: "none", minHeight: 44, maxHeight: 140,
                  transition: "border-color 0.2s", lineHeight: 1.5
                }}
                onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || sendMessage.isPending}
                data-testid="button-send"
                style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: inputValue.trim() ? "var(--forest)" : "var(--cream-dark)",
                  border: "none", color: inputValue.trim() ? "var(--gold-pale)" : "var(--ink-faint)",
                  cursor: inputValue.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s"
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
