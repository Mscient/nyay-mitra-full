"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { generateOfficialDoc, type DocumentType } from "@/lib/DocumentTemplates";
import {
  Moon, Sun, Search, Users, FileText, Calendar, ArrowLeft,
  CheckCircle2, ChevronRight, X, Plus, Trash2, Edit3, Loader2,
  AlertTriangle, LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StateWrapper } from "@/components/ui/state-wrapper";
import { Badge } from "@/components/ui/badge";

export interface CaseResult {
  id: string; title: string; citation: string; court: string; year: number;
  section: string[]; topic: string; summary: string; goodLaw: boolean;
  legal_principles?: string;
}

type TabId = "search" | "tracker" | "drafts" | "calendar";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "search", label: "Case Research", icon: Search },
  { id: "tracker", label: "My Clients", icon: Users },
  { id: "drafts", label: "Draft Studio", icon: FileText },
  { id: "calendar", label: "Hearings", icon: Calendar },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-blue-500/15 text-blue-700" },
  { value: "bail_pending", label: "Bail Pending", color: "bg-red-500/15 text-red-700" },
  { value: "bail_granted", label: "Bail Granted", color: "bg-emerald-500/15 text-emerald-700" },
  { value: "closed", label: "Closed", color: "bg-muted text-muted-foreground" },
];

const DOCUMENT_TYPES = [
  { id: "rti", icon: "📋", title: "RTI Application", subtitle: "Right to Information Act 2005", fields: ["authority", "subject", "information_needed", "applicant_name", "applicant_address"] },
  { id: "legal_notice", icon: "📜", title: "Legal Notice", subtitle: "Demand / Cease & Desist", fields: ["notice_to", "notice_to_address", "your_name", "your_address", "claim_details", "demand", "timeline"] },
  { id: "bail_petition", icon: "⚖️", title: "Bail Application", subtitle: "Under Section 436 / 437 CrPC", fields: ["accused_name", "fir_number", "police_station", "charges", "grounds_for_bail", "surety_name"] },
  { id: "complaint", icon: "📢", title: "Consumer Complaint", subtitle: "Consumer Protection Act 2019", fields: ["opposite_party", "opposite_party_address", "your_name", "your_address", "complaint_details", "relief_sought", "purchase_date"] },
  { id: "affidavit", icon: "🖊️", title: "General Affidavit", subtitle: "Notarised sworn statement", fields: ["deponent_name", "deponent_age", "deponent_address", "statement_of_facts"] },
  { id: "founder_agreement", icon: "🤝", title: "Co-Founder Agreement", subtitle: "Startup Incorporation", fields: ["startup_name", "founder1_name", "founder1_equity", "founder2_name", "founder2_equity", "vesting_period", "cliff_period", "jurisdiction"] },
  { id: "esop_policy", icon: "📈", title: "ESOP Policy", subtitle: "Employee Stock Options", fields: ["startup_name", "total_pool_size", "vesting_period", "cliff_period", "exercise_period", "board_approver"] },
];

const FIELD_LABELS: Record<string, string> = {
  authority: "Government Authority / Department", subject: "Subject of your RTI",
  information_needed: "Information needed", applicant_name: "Your Full Name",
  applicant_address: "Your Address", notice_to: "Notice To", notice_to_address: "Their Address",
  your_name: "Your Full Name", your_address: "Your Address", claim_details: "Details of the claim",
  demand: "What you demand", timeline: "Days to comply (e.g. 15)",
  accused_name: "Name of Accused", fir_number: "FIR Number", police_station: "Police Station",
  charges: "Charges / Sections", grounds_for_bail: "Grounds for bail", surety_name: "Surety / Guarantor Name",
  opposite_party: "Opposite Party Name", opposite_party_address: "Opposite Party Address",
  complaint_details: "Defect / deficiency details", relief_sought: "Relief / Compensation sought",
  purchase_date: "Date of Purchase", deponent_name: "Deponent's Full Name",
  deponent_age: "Age", deponent_address: "Permanent Address", statement_of_facts: "Statement of Facts",
  startup_name: "Startup / Company Name", founder1_name: "Founder 1 Name", founder1_equity: "Founder 1 Equity (%)",
  founder2_name: "Founder 2 Name", founder2_equity: "Founder 2 Equity (%)",
  vesting_period: "Vesting Period (e.g. 4 years)", cliff_period: "Cliff Period (e.g. 1 year)",
  jurisdiction: "Jurisdiction (City/State)", total_pool_size: "Total ESOP Pool Size (%)",
  exercise_period: "Exercise Period (e.g. 5 years)", board_approver: "Board Approver",
};

const TEXTAREA_FIELDS = ["information_needed", "claim_details", "grounds_for_bail", "complaint_details", "relief_sought", "statement_of_facts"];

function getStatusBadge(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

// Authenticated API helper — injects JWT from localStorage
function useApiCall() {
  return useCallback((url: string, opts?: RequestInit) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nyay_token") : null;
    return fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...opts?.headers,
      },
    });
  }, []);
}

// ─── LOGIN GATE BANNER ─────────────────────────────────────────────────────
function LoginBanner({ returnTo }: { returnTo: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "var(--ink)", margin: 0 }}>Sign In Required</h2>
      <p style={{ fontSize: 15, color: "var(--ink-muted)", maxWidth: 360, lineHeight: 1.6, margin: 0 }}>This section is for verified advocates. Please sign in to access your client tracker, hearing diary, and draft studio.</p>
      <Link href={`/login?returnTo=${returnTo}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "var(--forest)", color: "var(--gold-pale)", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
        <LogIn size={18} /> Sign In to Continue
      </Link>
    </div>
  );
}

// ─── SERVICE UNAVAILABLE BANNER ─────────────────────────────────────────
function ServiceUnavailable() {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
        <h3 className="font-display text-lg font-semibold">Workspace Service Offline</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          The CRM backend (<code>workspace-svc</code>) is not running. Start it with:
        </p>
        <pre className="text-xs bg-muted rounded-lg p-3 text-left overflow-x-auto mx-auto max-w-xs">
          cd apps/workspace-svc{"\n"}npm run dev
        </pre>
      </CardContent>
    </Card>
  );
}

// ─── ADD CLIENT MODAL ──────────────────────────────────────────────────────
function AddClientModal({ onClose, onAdded, editing, apiCall }: {
  onClose: () => void;
  onAdded: (c: any) => void;
  editing?: any;
  apiCall: ReturnType<typeof useApiCall>;
}) {
  const [form, setForm] = useState({
    fullName: editing?.fullName || editing?.name || "",
    phone: editing?.phone || "",
    email: editing?.email || "",
    aadhaarId: editing?.aadhaarId || "XXXX-XXXX-0000",
    case_title: editing?.case_title || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) { setError("Client name is required."); return; }
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/workspace/clients/${editing.id}` : "/api/workspace/clients";
      const res = await apiCall(url, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to save.");
      if (d._dev) throw new Error("workspace-svc is not running. Start it first.");
      onAdded({ ...form, id: d.clientId || editing?.id, fullName: form.fullName });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-xl font-semibold">{editing ? "Edit Client" : "Add New Client"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[["fullName", "Client Name *"], ["phone", "Phone Number"]].map(([k, l]) => (
              <div key={k}><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-secondary/50" /></div>
            ))}
          </div>
          <div><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-secondary/50" /></div>
          <div><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Aadhaar (masked, e.g. XXXX-XXXX-1234)</label>
            <input value={form.aadhaarId} onChange={e => setForm(f => ({ ...f, aadhaarId: e.target.value }))} placeholder="XXXX-XXXX-1234"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-secondary/50" /></div>
          <div><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Case Title</label>
            <input value={form.case_title} onChange={e => setForm(f => ({ ...f, case_title: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none" /></div>
          {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
        </form>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : editing ? "Save Changes" : "Add Client"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD HEARING MODAL ────────────────────────────────────────────────
function AddHearingModal({ onClose, onAdded, clients, apiCall }: {
  onClose: () => void;
  onAdded: (h: any) => void;
  clients: any[];
  apiCall: ReturnType<typeof useApiCall>;
}) {
  const [form, setForm] = useState({ clientId: "", purpose: "", scheduledAt: "", court: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.scheduledAt) { setError("Date is required."); return; }
    setSaving(true); setError("");
    try {
      // workspace-svc needs matterId, but we have clientId from UI.
      // For the MVP, we'll store a generic hearing linked by frontend state only
      // when workspace-svc is available. Otherwise use local state.
      const localHearing = {
        id: Date.now().toString(),
        client_name: clients.find(c => c.id === form.clientId)?.fullName || "Unknown Client",
        purpose: form.purpose,
        hearing_date: form.scheduledAt,
        court: form.court,
        status: "UPCOMING",
      };
      onAdded(localHearing);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-xl font-semibold">Add Hearing</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Client</label>
            <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none">
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Hearing Date & Time</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none" /></div>
          <div><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Purpose</label>
            <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Arguments on bail"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none" /></div>
          <div><label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Court / Hall</label>
            <input value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))} placeholder="e.g. City Civil Court, Hall 4"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none" /></div>
          {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Add Hearing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
export default function VakilSahayakPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const apiCall = useApiCall();
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("nyay_token");
    setIsLoggedIn(!!token && token !== "stub_google_jwt");
  }, []);

  // ── Case Search state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ── Clients state ──
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  // ── Hearings state ──
  const [hearings, setHearings] = useState<any[]>([]);
  const [hearingsLoading, setHearingsLoading] = useState(false);
  const [showAddHearing, setShowAddHearing] = useState(false);

  // ── Draft Studio state ──
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [docValues, setDocValues] = useState<Record<string, string>>({});
  const [docHtml, setDocHtml] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [docError, setDocError] = useState("");
  const [docAiGenerated, setDocAiGenerated] = useState(false);
  const draftIframeRef = useRef<HTMLIFrameElement>(null);

  // Load clients when entering tracker tab
  useEffect(() => {
    if (activeTab === "tracker" && isLoggedIn && clients.length === 0) {
      fetchClients();
    }
  }, [activeTab, isLoggedIn]);

  // Load hearings when entering calendar tab
  useEffect(() => {
    if (activeTab === "calendar" && isLoggedIn && hearings.length === 0) {
      fetchHearings();
    }
  }, [activeTab, isLoggedIn]);

  async function fetchClients() {
    setClientsLoading(true); setClientsError("");
    try {
      const res = await apiCall("/api/workspace/clients");
      const d = await res.json();
      if (d._dev) { setClientsError("workspace-svc"); return; }
      if (!res.ok) throw new Error(d.error);
      setClients(d.clients || []);
    } catch (err: any) {
      setClientsError(err.message?.includes("workspace") ? "workspace-svc" : err.message);
    } finally {
      setClientsLoading(false);
    }
  }

  async function fetchHearings() {
    setHearingsLoading(true);
    try {
      const res = await apiCall("/api/workspace/hearings");
      const d = await res.json();
      if (d._dev || !res.ok) return;
      // Map workspace-svc format → UI format
      const mapped = (d.hearings || []).map((h: any) => ({
        id: h.id,
        client_name: h.matterTitle || "Unknown",
        purpose: h.orderSummary || "Hearing",
        hearing_date: h.scheduledAt,
        court: h.courtCode || "",
        status: h.status,
      }));
      setHearings(mapped);
    } finally {
      setHearingsLoading(false);
    }
  }

  async function handleSearch(q = searchQuery) {
    if (!q.trim()) return;
    setIsSearching(true); setHasSearched(true); setSelectedCase(null); setSearchQuery(q); setSearchError(null);
    try {
      const res = await fetch(`/api/legal/search/semantic?q=${encodeURIComponent(q)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setResults((data.results || data).map((r: any) => ({
          id: r.id.toString(), title: r.case_title, citation: r.case_number || "Citation Missing",
          court: r.court_type || "Court", year: r.year_decided, section: [],
          topic: r.issue_categories, summary: r.summary, goodLaw: r.precedent_value > 60,
          legal_principles: r.legal_principles,
        })));
      } else setSearchError("Search failed. Please retry.");
    } catch { setSearchError("Network error occurred while searching."); }
    finally { setIsSearching(false); }
  }

  async function handleGenerateDoc() {
    if (!selectedDocType) return;
    setDocError(""); setDocHtml(""); setAiGenerating(true); setDocAiGenerated(false);
    try {
      const res = await apiCall("/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({ type: selectedDocType, fields: docValues, language: "en" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fallback) {
          setDocHtml(generateOfficialDoc(selectedDocType as DocumentType, docValues));
          setDocError("⚠️ AI unavailable (SARVAM_API_KEY not set). Showing formatted template.");
        } else setDocError(data.error || "Document generation failed.");
      } else {
        setDocHtml(generateOfficialDoc(selectedDocType as DocumentType, docValues, data.aiBody));
        setDocAiGenerated(true);
      }
    } catch { setDocError("Network error. Please try again."); }
    finally { setAiGenerating(false); }
  }

  const [pdfLoading, setPdfLoading] = useState(false);

  function handlePrintDraft() { draftIframeRef.current?.contentWindow?.print(); }

  async function handleDownloadDraft() {
    if (!docHtml) return;
    setPdfLoading(true);
    try {
      // Try real PDF via docgen-svc
      const res = await fetch("/api/documents/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: docHtml,
          filename: `${selectedDocType}_nyaymitra`,
          format: "A4",
        }),
      });

      if (res.ok && res.headers.get("Content-Type")?.includes("pdf")) {
        // Real PDF returned
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedDocType}_nyaymitra.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // docgen-svc offline — fall back to HTML
        const blob = new Blob([docHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedDocType}_nyaymitra.html`;
        a.click();
        URL.revokeObjectURL(url);
        setDocError("⚠️ PDF service offline — downloaded as HTML. Start docgen-svc for PDF output.");
      }
    } catch {
      // Network error — fall back to HTML
      const blob = new Blob([docHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${selectedDocType}_nyaymitra.html`; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  const selectedDocInfo = DOCUMENT_TYPES.find(d => d.id === selectedDocType);
  const GATED_TABS: TabId[] = ["tracker", "drafts", "calendar"];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary border-b border-primary/20 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="ghost" size="icon" className="text-secondary md:hidden" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link href="/" className="hidden md:flex">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-secondary cursor-pointer hover:text-secondary/80 transition-colors">← Nyay Mitra</span>
          </Link>
          <div className="hidden md:block w-px h-5 bg-primary-foreground/20" />
          <div className="font-display text-lg md:text-xl font-semibold text-primary-foreground">Vakil Sahayak</div>
          <Badge className="hidden sm:inline-flex bg-secondary/15 text-secondary border-none text-[10px] tracking-wider uppercase px-2.5 py-0.5">Advocate Portal</Badge>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => toggleTheme?.()} className="text-secondary hover:bg-secondary/10">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {isLoggedIn
            ? <Button variant="secondary" size="sm" className="font-bold text-xs" onClick={() => { localStorage.removeItem("nyay_token"); setIsLoggedIn(false); setClients([]); setHearings([]); }}>Sign Out</Button>
            : <Button onClick={() => router.push("/login?returnTo=/vakil-sahayak")} variant="secondary" size="sm" className="font-bold text-xs">Login</Button>
          }
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-muted/30 md:bg-primary/5 p-2 md:p-4 flex md:flex-col gap-1 md:gap-2 flex-shrink-0 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-border order-first md:order-none z-10">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button key={tab.id} variant={isActive ? "secondary" : "ghost"}
                className={`justify-start gap-3 whitespace-nowrap ${isActive ? "bg-secondary/15 text-secondary hover:bg-secondary/25" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setActiveTab(tab.id)}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{tab.label}</span>
              </Button>
            );
          })}
          <div className="hidden md:block flex-1" />
          <Button variant="outline" className="hidden md:flex justify-start gap-3 border-secondary/20 text-secondary hover:bg-secondary/5 mt-4" onClick={() => router.push("/undertrial-tracker")}>
            ⚖️ Undertrial 436A
          </Button>
          <Button variant="outline" className="hidden md:flex justify-start gap-3 border-secondary/20 text-secondary hover:bg-secondary/5 mt-2" onClick={() => router.push("/case-status")}>
            🔎 Case Status (CNR)
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">

          {/* ══ CASE SEARCH (public) ══ */}
          {activeTab === "search" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="t-heading mb-2">Case Law Research</h1>
                <p className="t-body text-muted-foreground">Semantic search over Supreme Court & High Court judgments.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="Search by topic, section, party name (e.g. 'criminal bail')"
                    className="pl-10 h-12 text-base rounded-xl border-border bg-card shadow-sm focus-visible:ring-secondary" />
                </div>
                <Button onClick={() => handleSearch()} size="lg" className="h-12 rounded-xl px-8 w-full sm:w-auto">Search</Button>
              </div>
              <div className="flex gap-2 flex-wrap pb-2">
                {["sexual harassment", "self defense", "divorce custody", "right to privacy", "consumer protection"].map(q => (
                  <Badge key={q} variant="outline"
                    className="cursor-pointer hover:bg-secondary/10 hover:text-secondary hover:border-secondary transition-colors py-1.5 px-3 rounded-full font-normal"
                    onClick={() => handleSearch(q)}>{q}</Badge>
                ))}
              </div>
              <div className={`grid gap-6 ${selectedCase ? "lg:grid-cols-[1fr_400px]" : "grid-cols-1"}`}>
                <div className="space-y-4">
                  <StateWrapper isLoading={isSearching} isEmpty={hasSearched && results.length === 0} isError={!!searchError} errorMessage={searchError || undefined} emptyMessage={`No precedents found for "${searchQuery}". Try broader terms.`}>
                    <div className="grid gap-4">
                      {results.map(c => (
                        <Card key={c.id}
                          className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-l-4 ${selectedCase?.id === c.id ? "border-l-secondary bg-secondary/5 ring-1 ring-secondary/20" : "border-l-transparent hover:border-l-secondary/50"}`}
                          onClick={() => setSelectedCase(c)}>
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1.5">
                                <h3 className="font-display text-lg font-semibold text-foreground leading-tight">{c.title}</h3>
                                <p className="text-xs font-bold text-secondary">{c.citation}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{c.summary}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {c.goodLaw && <Badge className="bg-emerald-500/15 text-emerald-600 border-none px-2 rounded-md"><CheckCircle2 className="w-3 h-3 mr-1" />Good Law</Badge>}
                                <span className="text-[11px] text-muted-foreground font-medium">{c.court} · {c.year}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </StateWrapper>
                </div>
                {selectedCase && (
                  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:static lg:bg-transparent lg:z-auto">
                    <div className="absolute inset-y-0 right-0 w-full md:w-[450px] lg:w-auto h-full bg-card shadow-2xl lg:shadow-none lg:border lg:border-secondary/30 lg:rounded-2xl flex flex-col">
                      <div className="p-4 border-b border-border flex items-center justify-between lg:hidden bg-muted/30">
                        <span className="font-display font-semibold">Case Details</span>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCase(null)}><X className="h-5 w-5" /></Button>
                      </div>
                      <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                        <Button variant="ghost" size="sm" className="hidden lg:flex -ml-3 text-muted-foreground" onClick={() => setSelectedCase(null)}>
                          <ArrowLeft className="h-4 w-4 mr-2" />Back to results
                        </Button>
                        <div>
                          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-tight mb-2">{selectedCase.title}</h2>
                          <div className="text-sm font-bold text-secondary mb-4">{selectedCase.citation}</div>
                          <div className="flex gap-2 flex-wrap mb-6">
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-none">{selectedCase.court}</Badge>
                            <Badge variant="outline">{selectedCase.year}</Badge>
                            {selectedCase.goodLaw && <Badge className="bg-emerald-500/15 text-emerald-600 border-none">Not Overruled</Badge>}
                          </div>
                        </div>
                        <div>
                          <h4 className="t-label mb-3">AI Summary</h4>
                          <p className="t-body bg-muted/30 p-4 rounded-xl border border-border/50">{selectedCase.summary}</p>
                        </div>
                        {selectedCase.legal_principles && (() => {
                          let p = selectedCase.legal_principles!;
                          try { p = JSON.parse(p).join("\n• "); } catch {}
                          return <div><h4 className="t-label mb-3">Legal Principles</h4><p className="t-body">• {p}</p></div>;
                        })()}
                        <div className="pt-6 mt-6 border-t border-border">
                          <Button className="w-full" asChild>
                            <a href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(selectedCase.title)}`} target="_blank" rel="noopener noreferrer">
                              View on IndianKanoon <ChevronRight className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ MY CLIENTS (auth gated) ══ */}
          {activeTab === "tracker" && (
            !isLoggedIn ? <LoginBanner returnTo="/vakil-sahayak" /> : (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="t-heading mb-1">My Clients</h1>
                    <p className="text-sm text-muted-foreground">{clients.length} client records</p>
                  </div>
                  <Button onClick={() => { setEditingClient(null); setShowAddClient(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />Add Client
                  </Button>
                </div>

                {clientsLoading ? (
                  <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
                ) : clientsError === "workspace-svc" ? (
                  <ServiceUnavailable />
                ) : clients.length === 0 ? (
                  <Card><CardContent className="p-12 text-center space-y-4">
                    <div className="text-4xl">📂</div>
                    <h3 className="font-display text-xl font-semibold">No clients yet</h3>
                    <p className="text-muted-foreground text-sm">Add your first client to start tracking their matters and documents.</p>
                    <Button onClick={() => setShowAddClient(true)} className="gap-2"><Plus className="h-4 w-4" />Add First Client</Button>
                  </CardContent></Card>
                ) : (
                  <div className="space-y-3">
                    {clients.map(c => {
                      const displayName = c.fullName || c.name || "Unknown";
                      return (
                        <Card key={c.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display text-xl font-bold shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="font-display text-lg font-semibold truncate">{displayName}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {c.case_title ? c.case_title : c.email || `Aadhaar ref: …${c.aadhaarRef || ""}`}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => { setEditingClient(c); setShowAddClient(true); }}>
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => { if (confirm("Remove this client?")) setClients(prev => prev.filter(cl => cl.id !== c.id)); }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}

          {/* ══ DRAFT STUDIO (auth gated) ══ */}
          {activeTab === "drafts" && (
            !isLoggedIn ? <LoginBanner returnTo="/vakil-sahayak" /> : (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="t-heading mb-1">Draft Studio</h1>
                    <p className="text-sm text-muted-foreground">AI-generated legal documents using Sarvam AI. All drafts marked for lawyer review.</p>
                  </div>
                  {selectedDocType && (
                    <Button variant="outline" onClick={() => { setSelectedDocType(null); setDocHtml(""); setDocError(""); }}>
                      ← Back to Templates
                    </Button>
                  )}
                </div>
                {!selectedDocType ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {DOCUMENT_TYPES.map(doc => (
                      <Card key={doc.id} className="cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all border hover:border-secondary/40"
                        onClick={() => { setSelectedDocType(doc.id); setDocValues({}); setDocHtml(""); setDocError(""); }}>
                        <CardContent className="p-5 space-y-2">
                          <div className="text-2xl">{doc.icon}</div>
                          <div className="font-display text-base font-semibold leading-tight">{doc.title}</div>
                          <div className="text-xs text-secondary font-semibold">{doc.subtitle}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-6 ${docHtml ? "lg:grid-cols-2" : "grid-cols-1 max-w-2xl"}`}>
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                          <span className="text-2xl">{selectedDocInfo?.icon}</span>
                          <div>
                            <div className="font-display text-lg font-semibold">{selectedDocInfo?.title}</div>
                            <div className="text-xs text-secondary font-semibold">{selectedDocInfo?.subtitle}</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {selectedDocInfo?.fields.map(field => (
                            <div key={field}>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{FIELD_LABELS[field] || field}</label>
                              {TEXTAREA_FIELDS.includes(field) ? (
                                <textarea rows={3} value={docValues[field] || ""} onChange={e => setDocValues(v => ({ ...v, [field]: e.target.value }))}
                                  placeholder={FIELD_LABELS[field]}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none" />
                              ) : (
                                <input type="text" value={docValues[field] || ""} onChange={e => setDocValues(v => ({ ...v, [field]: e.target.value }))}
                                  placeholder={FIELD_LABELS[field]}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                              )}
                            </div>
                          ))}
                        </div>
                        {docError && <div className="text-sm bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-lg px-4 py-3">{docError}</div>}
                        <Button className="w-full gap-2 mt-2" onClick={handleGenerateDoc} disabled={aiGenerating} size="lg">
                          {aiGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating with AI…</> : "✍️ Generate with AI"}
                        </Button>
                      </CardContent>
                    </Card>
                    {docHtml && (
                      <Card className="flex flex-col overflow-hidden border-secondary/30">
                        <div className="px-4 py-3 border-b border-secondary/20 bg-secondary/5 flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-secondary flex-1">
                            {docAiGenerated ? "🤖 AI-Generated — Official Format" : "📄 Official Format"}
                          </span>
                          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handlePrintDraft}>🖨️ Print / PDF</Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleDownloadDraft} disabled={pdfLoading}>
                            {pdfLoading ? <><Loader2 className="h-3 w-3 animate-spin" />Generating…</> : "⬇️ Download PDF"}
                          </Button>
                        </div>
                        <iframe ref={draftIframeRef} srcDoc={docHtml}
                          style={{ width: "100%", height: 560, border: "none", background: "#f0ebe3" }}
                          title="Official Document Preview" />
                        <div className="px-4 py-2.5 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-700 font-medium">
                          ⚠️ DRAFT — Must be reviewed and certified by a licensed Advocate before filing.
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )
          )}

          {/* ══ HEARINGS (auth gated) ══ */}
          {activeTab === "calendar" && (
            !isLoggedIn ? <LoginBanner returnTo="/vakil-sahayak" /> : (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="t-heading mb-1">Hearing Diary</h1>
                    <p className="text-sm text-muted-foreground">{hearings.length} upcoming hearings scheduled</p>
                  </div>
                  <Button onClick={() => setShowAddHearing(true)} className="gap-2">
                    <Plus className="h-4 w-4" />Add Hearing
                  </Button>
                </div>

                {hearingsLoading ? (
                  <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
                ) : hearings.length === 0 ? (
                  <Card><CardContent className="p-12 text-center space-y-4">
                    <div className="text-4xl">📅</div>
                    <h3 className="font-display text-xl font-semibold">No hearings scheduled</h3>
                    <p className="text-sm text-muted-foreground">Add upcoming hearing dates to keep your diary up to date.</p>
                    <Button onClick={() => setShowAddHearing(true)} className="gap-2"><Plus className="h-4 w-4" />Schedule First Hearing</Button>
                  </CardContent></Card>
                ) : (
                  <div className="space-y-3">
                    {[...hearings].sort((a, b) => a.hearing_date.localeCompare(b.hearing_date)).map(h => {
                      const d = new Date(h.hearing_date);
                      const daysUntil = Math.ceil((d.getTime() - Date.now()) / 86400000);
                      const isPast = daysUntil < 0;
                      const isUrgent = daysUntil >= 0 && daysUntil <= 3;
                      return (
                        <Card key={h.id} className={`${isUrgent ? "border-destructive/30" : isPast ? "opacity-60" : ""}`}>
                          <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                            <div className={`h-16 w-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${isUrgent ? "bg-destructive/10 text-destructive" : isPast ? "bg-muted text-muted-foreground" : "bg-primary/5 text-primary"}`}>
                              <span className="font-display text-2xl font-bold leading-none">{d.getDate()}</span>
                              <span className="text-[10px] font-semibold uppercase mt-1 tracking-wider">{d.toLocaleString("en-IN", { month: "short" })}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-base font-semibold truncate">{h.client_name} — {h.purpose || "Hearing"}</h3>
                              <p className="text-sm text-muted-foreground truncate">{h.court}</p>
                            </div>
                            <div className={`text-sm font-semibold ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                              {isPast ? "Past" : daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {showAddClient && (
        <AddClientModal
          editing={editingClient}
          apiCall={apiCall}
          onClose={() => { setShowAddClient(false); setEditingClient(null); }}
          onAdded={client => {
            if (editingClient) setClients(prev => prev.map(c => c.id === client.id ? client : c));
            else setClients(prev => [client, ...prev]);
          }} />
      )}

      {showAddHearing && (
        <AddHearingModal
          clients={clients}
          apiCall={apiCall}
          onClose={() => setShowAddHearing(false)}
          onAdded={h => setHearings(prev => [h, ...prev])} />
      )}
    </div>
  );
}
