import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Scale, Moon, Sun, Plus, Trash2, Send, Bookmark,
  Copy, CheckCheck, ChevronLeft, Menu, X, Globe,
  Gavel, Heart, Briefcase, ShoppingCart, Home,
  FileText, BookOpen, Shield, MessageSquare, LogIn, Key
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { icon: any; label: Record<string, string>; color: string }> = {
  general: { icon: MessageSquare, label: { en: "General", hi: "सामान्य", mr: "सामान्य" }, color: "text-muted-foreground" },
  criminal: { icon: Gavel, label: { en: "Criminal", hi: "आपराधिक", mr: "फौजदारी" }, color: "text-red-500" },
  family: { icon: Heart, label: { en: "Family", hi: "परिवार", mr: "कुटुंब" }, color: "text-pink-500" },
  labor: { icon: Briefcase, label: { en: "Labour", hi: "श्रम", mr: "कामगार" }, color: "text-blue-500" },
  consumer: { icon: ShoppingCart, label: { en: "Consumer", hi: "उपभोक्ता", mr: "ग्राहक" }, color: "text-green-500" },
  property: { icon: Home, label: { en: "Property", hi: "संपत्ति", mr: "मालमत्ता" }, color: "text-yellow-500" },
  rti: { icon: FileText, label: { en: "RTI", hi: "आरटीआई", mr: "आरटीआय" }, color: "text-teal-500" },
  constitutional: { icon: BookOpen, label: { en: "Constitutional", hi: "संवैधानिक", mr: "संवैधानिक" }, color: "text-purple-500" },
  women: { icon: Shield, label: { en: "Women's Rights", hi: "महिला", mr: "महिला" }, color: "text-orange-500" },
};

interface Session { id: string; title: string; category: string; language: string; createdAt: number; }
interface Message { id: string; sessionId: string; role: string; content: string; language: string; citations: string | null; createdAt: number; }

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^###\s+(.+)$/gm, '<h3 class="font-semibold text-base mt-3 mb-1">$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="font-semibold text-base mt-4 mb-1">$1</h2>')
    .replace(/^•\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n{2,}/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');
}

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

  // Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    refetchInterval: 30_000,
  });

  // Fetch messages for active session
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/sessions", activeSessionId, "messages"],
    queryFn: async () => {
      if (!activeSessionId) return [];
      const res = await apiRequest("GET", `/api/sessions/${activeSessionId}/messages`);
      return res.json();
    },
    enabled: !!activeSessionId,
  });

  // Create session mutation
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

  // Chat mutation
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

  // Delete session mutation
  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      if (activeSessionId === id) {
        setActiveSessionId(null);
        navigate("/chat");
      }
    },
  });

  // Scroll to bottom on new messages
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  // ── Sidebar ──────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full",
      mobile ? "w-full" : "w-72"
    )}>
      {/* Sidebar header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
              <Scale className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sidebar-foreground">{t("appName")}</span>
          </div>
        </Link>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New consultation button */}
      <div className="p-3">
        <Button
          onClick={() => startNewSession()}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground text-sm font-medium"
          data-testid="button-new-session"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("newSession")}
        </Button>
      </div>

      {/* Category quick-start */}
      <div className="px-3 pb-2">
        <div className="text-xs text-sidebar-foreground/50 font-medium uppercase tracking-wider mb-2 px-1">{t("categories")}</div>
        <div className="grid grid-cols-3 gap-1">
          {Object.entries(CATEGORY_META).filter(([k]) => k !== "general").map(([key, meta]) => {
            const Icon = meta.icon;
            const label = meta.label[language as keyof typeof meta.label] || meta.label.en;
            return (
              <button
                key={key}
                onClick={() => startNewSession(key)}
                data-testid={`sidebar-cat-${key}`}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <Icon className={cn("w-4 h-4", meta.color)} />
                <span className="text-xs leading-tight text-center">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BYOK: Use your own GPT key */}
      {user && (
        <div className="px-3 pb-2">
          <div className="text-xs text-sidebar-foreground/50 font-medium uppercase tracking-wider mb-2 px-1">Use Your Own GPT</div>
          <div className="bg-sidebar-accent/50 rounded-lg p-2.5">
            {user.hasApiKey ? (
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-xs text-sidebar-foreground/80 flex-1">API key active ✓</span>
                <button
                  onClick={async () => {
                    setSavingKey(true);
                    try { await removeApiKey(); } finally { setSavingKey(false); }
                  }}
                  disabled={savingKey}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 text-xs bg-sidebar-accent rounded px-2 py-1.5 text-sidebar-foreground placeholder:text-sidebar-foreground/30 outline-none border border-sidebar-border focus:border-sidebar-primary"
                  />
                  <button
                    onClick={async () => {
                      if (!apiKeyInput.trim()) return;
                      setSavingKey(true);
                      try {
                        await setApiKey(apiKeyInput.trim());
                        setApiKeyInput("");
                      } finally { setSavingKey(false); }
                    }}
                    disabled={savingKey || !apiKeyInput.trim()}
                    className="text-xs bg-sidebar-primary text-sidebar-primary-foreground px-2.5 py-1.5 rounded font-medium hover:bg-sidebar-primary/90 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-sidebar-foreground/40 mt-1.5">Enter your OpenAI API key for real AI responses</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Session history */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="text-xs text-sidebar-foreground/50 font-medium uppercase tracking-wider mb-2 px-1">{t("sessionHistory")}</div>
        {sessionsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-6 text-sidebar-foreground/40 text-sm">{t("noSessions")}</div>
        ) : (
          <div className="space-y-1">
            {sessions.map((s) => {
              const meta = CATEGORY_META[s.category] || CATEGORY_META.general;
              const Icon = meta.icon;
              return (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  data-testid={`session-${s.id}`}
                  className={cn(
                    "group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors",
                    activeSessionId === s.id
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", meta.color)} />
                  <span className="text-sm truncate flex-1">{s.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession.mutate(s.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-400"
                    data-testid={`delete-session-${s.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User info / auth */}
      <div className="p-3 border-t border-sidebar-border">
        {user ? (
          <div className="flex items-center gap-2 text-sidebar-foreground/70">
            <div className="w-7 h-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm truncate flex-1">{user.name}</span>
          </div>
        ) : (
          <Link href="/login">
            <div className="flex items-center gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground cursor-pointer text-sm">
              <LogIn className="w-4 h-4" />
              <span>{t("login")} to save history</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  // ── Main content ─────────────────────────────────────────────
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col bg-sidebar w-72 flex-shrink-0 border-r border-sidebar-border">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-sidebar shadow-xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              data-testid="button-open-sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {activeSession && (
              <>
                {(() => {
                  const meta = CATEGORY_META[activeSession.category] || CATEGORY_META.general;
                  const Icon = meta.icon;
                  return <Icon className={cn("w-5 h-5", meta.color)} />;
                })()}
                <span className="font-medium text-sm truncate max-w-[180px] md:max-w-xs">{activeSession.title}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language switcher */}
            <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
              {(Object.keys(LANGUAGES) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  data-testid={`chat-lang-${l}`}
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-md transition-colors",
                    language === l ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {LANGUAGES[l].nativeLabel}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              data-testid="toggle-theme-chat"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeSessionId ? (
            /* Welcome state */
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center max-w-md animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">{t("welcome")}</h2>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{t("welcomeDesc")}</p>

                {/* Quick categories */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_META).filter(([k]) => k !== "general").slice(0, 6).map(([key, meta]) => {
                    const Icon = meta.icon;
                    const label = meta.label[language as keyof typeof meta.label] || meta.label.en;
                    return (
                      <button
                        key={key}
                        onClick={() => startNewSession(key)}
                        data-testid={`welcome-cat-${key}`}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Icon className={cn("w-5 h-5", meta.color)} />
                        <span className="text-xs text-center text-muted-foreground leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : messagesLoading ? (
            /* Loading skeleton */
            <div className="p-4 space-y-4 max-w-3xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            /* Empty session */
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center animate-fade-in">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t("welcomeDesc")}</p>
              </div>
            </div>
          ) : (
            /* Messages list */
            <div className="py-4 space-y-1 max-w-3xl mx-auto px-3 md:px-6">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 px-2 py-2 rounded-lg animate-fade-in",
                    msg.role === "user" ? "justify-end" : ""
                  )}
                  data-testid={`message-${msg.id}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                  )}

                  <div className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-card border border-border text-foreground"
                  )}>
                    {msg.role === "assistant" ? (
                      <div
                        className="prose-legal"
                        dangerouslySetInnerHTML={{ __html: `<p>${parseMarkdown(msg.content)}</p>` }}
                      />
                    ) : (
                      <span>{msg.content}</span>
                    )}

                    {/* Citations */}
                    {msg.citations && (() => {
                      try {
                        const cits = JSON.parse(msg.citations) as string[];
                        if (cits.length > 0) return (
                          <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                            {cits.map((c, i) => (
                              <span key={i} className="text-xs bg-secondary/20 text-secondary-foreground dark:text-secondary px-2 py-0.5 rounded-full font-mono">
                                {c}
                              </span>
                            ))}
                          </div>
                        );
                      } catch { return null; }
                    })()}

                    {/* Actions */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-2 pt-1">
                        <button
                          onClick={() => copyMessage(msg.content, msg.id)}
                          data-testid={`copy-${msg.id}`}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedId === msg.id ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-secondary-foreground dark:text-secondary">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 px-2 py-2 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-xl px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <span className="ml-2 text-xs text-muted-foreground">{t("thinking")}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-3 md:p-4 bg-card/80 backdrop-blur flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center mb-2 hidden md:block">
              {t("disclaimer")}
            </p>

            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("typeMessage")}
                className="flex-1 resize-none min-h-[44px] max-h-32 bg-background border-border text-sm"
                rows={1}
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || sendMessage.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-4 flex-shrink-0"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground/60 text-center mt-1.5 md:hidden">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
