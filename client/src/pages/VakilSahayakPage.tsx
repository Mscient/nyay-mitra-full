import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export interface CaseResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  year: number;
  section: string[];
  topic: string;
  summary: string;
  goodLaw: boolean;
  legal_principles?: string;
}

type TabId = "search" | "tracker" | "drafts" | "calendar";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "search", label: "Case Research", icon: "🔍" },
  { id: "tracker", label: "My Clients", icon: "👥" },
  { id: "drafts", label: "Draft Studio", icon: "📝" },
  { id: "calendar", label: "Hearings", icon: "📅" },
];

// Mock client tracker data
const MOCK_CLIENTS = [
  { id: "1", name: "Ramesh Kumar", case: "State v. Ramesh Kumar", section: "302 IPC", court: "Sessions Court, Pune", nextHearing: "2026-03-28", status: "bail_pending", daysInCustody: 340 },
  { id: "2", name: "Priya Sharma", case: "Priya Sharma v. M/s ABC Pvt Ltd", section: "Consumer Complaint", court: "DCDRC, Mumbai", nextHearing: "2026-03-31", status: "active", daysInCustody: 0 },
  { id: "3", name: "Mohammed Iqbal", case: "State v. Mohammed Iqbal", section: "420, 467 IPC", court: "CJM, Nashik", nextHearing: "2026-04-05", status: "bail_granted", daysInCustody: 0 },
];

export default function VakilSahayakPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(q = searchQuery) {
    if (!q.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setSelectedCase(null);
    setSearchQuery(q);
    try {
      const res = await fetch(`/api/legal/search/cases?q=${encodeURIComponent(q)}&limit=10`);
      if (res.ok) {
        const rows = await res.json();
        const mapped = rows.map((r: any) => ({
          id: r.id.toString(),
          title: r.case_title,
          citation: r.case_number || "Citation Missing",
          court: r.court_type || "Court",
          year: r.year_decided,
          section: [],
          topic: r.issue_categories,
          summary: r.summary,
          goodLaw: r.precedent_value > 60,
          legal_principles: r.legal_principles
        }));
        setResults(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "var(--forest)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/"><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer" }}>← Nyay Mitra</span></Link>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ivory)" }}>Vakil Sahayak</div>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", background: "rgba(201,146,10,0.15)", padding: "3px 10px", borderRadius: 12 }}>Advocate Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={toggleTheme}
            style={{ padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--gold)" }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
              Adv. {user.name}
            </span>
          ) : (
            <Link href="/login">
              <button style={{ padding: "7px 16px", background: "var(--gold)", color: "var(--forest)", border: "none", borderRadius: 7, fontFamily: "'Instrument Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Login</button>
            </Link>
          )}
        </div>
      </nav>

      <div style={{ display: "flex", height: "100vh", paddingTop: 60 }}>
        {/* Side tabs */}
        <div style={{ width: 200, background: "var(--forest-mid)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                fontFamily: "'Instrument Sans',sans-serif", fontSize: 13,
                background: activeTab === tab.id ? "rgba(201,146,10,0.2)" : "transparent",
                color: activeTab === tab.id ? "var(--gold-pale)" : "rgba(255,255,255,0.5)",
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: "all 0.15s"
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />
          <Link href="/undertrial-tracker">
            <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", width: "100%", borderRadius: 10, border: "1px solid rgba(201,146,10,0.2)", cursor: "pointer", fontFamily: "'Instrument Sans',sans-serif", fontSize: 12, background: "transparent", color: "var(--gold)", fontWeight: 600 }}>
              ⚖️ Undertrial 436A
            </button>
          </Link>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* ── CASE SEARCH ── */}
          {activeTab === "search" && (
            <div style={{ padding: 32 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>Case Law Research</div>
                <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>Semantic search over Supreme Court & High Court judgments. Demo uses 10 landmark cases.</p>
              </div>

              {/* Search box */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search by topic, section, party name... e.g. 'bail undertrial' or '498A'"
                  style={{ flex: 1, padding: "12px 18px", border: "1px solid var(--border-color)", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, color: "var(--ink)", background: "var(--ivory)", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
                />
                <button onClick={() => handleSearch()} style={{ padding: "12px 24px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Search</button>
              </div>

              {/* Quick searches */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                {["498A arrest", "bail undertrial", "right to privacy", "custodial torture", "FIR mandatory"].map(q => (
                  <button key={q} onClick={() => handleSearch(q)} style={{ padding: "6px 14px", background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, fontSize: 12, cursor: "pointer", color: "var(--ink-mid)", fontFamily: "'Instrument Sans',sans-serif" }}>
                    {q}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div style={{ display: "grid", gridTemplateColumns: selectedCase ? "1fr 1fr" : "1fr", gap: 20 }}>
                <div>
                  {hasSearched && results.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--ink-muted)", fontSize: 14 }}>
                      No matching cases found. Try different keywords.
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {results.map(c => (
                      <div
                        key={c.id}
                        className="case-card"
                        onClick={() => setSelectedCase(c)}
                        style={{ cursor: "pointer", background: selectedCase?.id === c.id ? "var(--gold-whisper)" : "var(--ivory)", border: `1px solid ${selectedCase?.id === c.id ? "var(--border-gold)" : "var(--border-color)"}`, borderRadius: 14, padding: "18px 20px", transition: "all 0.2s" }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 4, lineHeight: 1.3 }}>{c.title}</div>
                            <div style={{ fontSize: 11.5, color: "var(--gold)", fontWeight: 600, marginBottom: 8 }}>{c.citation}</div>
                            <div style={{ fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.55 }}>{c.summary.substring(0, 120)}…</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                            {c.goodLaw && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--teal)", background: "var(--teal-light)", padding: "3px 8px", borderRadius: 8 }}>✓ Good Law</span>}
                            <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>{c.court} · {c.year}</span>
                          </div>
                        </div>
                        {c.section.length > 0 && (
                          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                            {c.section.map(s => (
                              <span key={s} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "var(--cream-dark)", color: "var(--ink-mid)" }}>Sec {s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Case detail panel */}
                {selectedCase && (
                  <div style={{ background: "var(--ivory)", border: "1px solid var(--border-gold)", borderRadius: 16, padding: 24, position: "sticky", top: 20, maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
                    <button onClick={() => setSelectedCase(null)} style={{ fontSize: 11, color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>✕ Close</button>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2, marginBottom: 6 }}>{selectedCase.title}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>{selectedCase.citation}</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--teal)", background: "var(--teal-light)", padding: "3px 10px", borderRadius: 8 }}>{selectedCase.court}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-muted)", background: "var(--cream-dark)", padding: "3px 10px", borderRadius: 8 }}>{selectedCase.year}</span>
                      {selectedCase.goodLaw && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", background: "var(--teal-light)", padding: "3px 10px", borderRadius: 8 }}>✓ Good Law (not overruled)</span>}
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>AI Summary</div>
                    <p style={{ fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.75, marginBottom: 12 }}>{selectedCase.summary}</p>
                    
                    {selectedCase.legal_principles && (() => {
                      let principles = selectedCase.legal_principles;
                      try { principles = JSON.parse(selectedCase.legal_principles).join("\\n• "); } catch {}
                      return (
                        <>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>Legal Principles Established</div>
                          <p style={{ fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.75, marginBottom: 20 }}>• {principles}</p>
                        </>
                      );
                    })()}

                    {selectedCase.section.length > 0 && (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>Relevant Sections</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                          {selectedCase.section.map(s => (
                            <span key={s} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 8, background: "var(--cream-dark)", color: "var(--ink-mid)" }}>Sec {s}</span>
                          ))}
                        </div>
                      </>
                    )}

                    <a
                      href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(selectedCase.title)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: "block", padding: "10px 16px", background: "var(--forest)", color: "var(--gold-pale)", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                    >
                      View full judgment on IndianKanoon →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CLIENTS ── */}
          {activeTab === "tracker" && (
            <div style={{ padding: 32 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 24 }}>My Clients</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {MOCK_CLIENTS.map(c => (
                  <div key={c.id} style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "var(--gold-pale)", flexShrink: 0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{c.case} · {c.section}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{c.court}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, color: c.status === "bail_pending" ? "var(--rust)" : c.status === "bail_granted" ? "var(--teal)" : "var(--ink-muted)" }}>
                        {c.status === "bail_pending" ? "🔴 Bail Pending" : c.status === "bail_granted" ? "🟢 Bail Granted" : "⚪ Active"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Hearing: {new Date(c.nextHearing).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                      {c.daysInCustody > 0 && <div style={{ fontSize: 11, color: "var(--rust)", fontWeight: 600, marginTop: 2 }}>{c.daysInCustody} days in custody</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DRAFT STUDIO ── */}
          {activeTab === "drafts" && (
            <div style={{ padding: 32 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 12 }}>Draft Studio</div>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 28 }}>Generate legal documents directly from here, or go to the full Document Generator.</p>
              <Link href="/documents">
                <button style={{ padding: "14px 32px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                  📄 Open Document Generator →
                </button>
              </Link>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {activeTab === "calendar" && (
            <div style={{ padding: 32 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 24 }}>Upcoming Hearings</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {MOCK_CLIENTS.sort((a, b) => a.nextHearing.localeCompare(b.nextHearing)).map(c => {
                  const d = new Date(c.nextHearing);
                  const daysUntil = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
                  return (
                    <div key={c.id} style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "16px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 12, background: daysUntil <= 3 ? "var(--rust)" : "var(--forest)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--ivory)", flexShrink: 0 }}>
                        <div style={{ fontSize: 20, fontFamily: "'Cormorant Garamond',serif", fontWeight: 700 }}>{d.getDate()}</div>
                        <div style={{ fontSize: 10 }}>{d.toLocaleString("en-IN", { month: "short" }).toUpperCase()}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{c.name} — {c.section}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{c.court}</div>
                      </div>
                      <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: daysUntil <= 3 ? "var(--rust)" : "var(--ink-muted)" }}>
                        {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
