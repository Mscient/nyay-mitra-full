"use client";

// AI-GENERATED: Antigravity — Direct port of CaseStatusPage.tsx from legacy-vite
import { useState } from "react";
import Link from "next/link";

interface HearingEntry { date: string; stage: string; remarks: string; }
interface CaseData {
  cnr_number: string; case_title: string; court_name: string; filing_date: string;
  status: string; next_hearing_date: string; judge: string; case_type: string;
  petitioner: string; respondent: string; history: HearingEntry[];
}
type FetchState = "idle" | "loading" | "success" | "error";

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  Pending: { bg: "rgba(245,158,11,0.12)", text: "#b45309", dot: "#f59e0b" },
  Disposed: { bg: "rgba(16,185,129,0.12)", text: "#047857", dot: "#10b981" },
  "Stay Granted": { bg: "rgba(99,102,241,0.12)", text: "#4338ca", dot: "#6366f1" },
};
function getStatusStyle(status: string) {
  return STATUS_COLOR[status] || { bg: "rgba(100,116,139,0.12)", text: "#475569", dot: "#94a3b8" };
}

export default function CaseStatusPage() {
  const [cnr, setCnr] = useState("");
  const [state, setState] = useState<FetchState>("idle");
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = cnr.trim().toUpperCase().replace(/\s+/g, "");
    if (!q || q.length < 10) { setError("Please enter a valid CNR number (e.g. MHPN0100012023)."); return; }
    setError(""); setState("loading"); setCaseData(null);
    try {
      const res = await fetch(`/api/legal/ecourts/cnr/${encodeURIComponent(q)}`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to fetch case."); }
      const d = await res.json();
      setCaseData(d.data); setSource(d.source); setState("success");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Could not fetch case details. Please try again."); setState("error"); }
  }

  const isMock = source === "mock";

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(249,245,238,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ textDecoration: "none" }}><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer" }}>← Nyay Mitra</span></Link>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Case Status</div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-muted)", fontWeight: 500 }}>Powered by eCourts India</div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>⚖️</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>eCourts India</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 500, color: "var(--ink)", lineHeight: 1.1, marginBottom: 12 }}>Check Your Case Status</h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            Enter your <strong>CNR (Case Number Record)</strong> to instantly get your case status, next hearing date, and full history.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32, marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>CNR Number</label>
          <div style={{ display: "flex", gap: 12 }}>
            <input type="text" value={cnr} onChange={e => setCnr(e.target.value.toUpperCase())} placeholder="e.g. MHPN0100012023" maxLength={20}
              style={{ flex: 1, padding: "12px 16px", border: "1.5px solid var(--border-color)", borderRadius: 10, fontFamily: "monospace", fontSize: 16, letterSpacing: 2, color: "var(--ink)", background: "var(--cream)", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
            <button type="submit" disabled={state === "loading"}
              style={{ padding: "12px 28px", background: state === "loading" ? "var(--ink-muted)" : "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, fontWeight: 700, cursor: state === "loading" ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: state === "loading" ? "none" : "0 2px 12px rgba(42,68,42,0.25)" }}>
              {state === "loading" ? "Searching…" : "Search →"}
            </button>
          </div>
          {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(166,58,30,0.08)", border: "1px solid rgba(166,58,30,0.2)", borderRadius: 8, fontSize: 13, color: "#a63a1e" }}>⚠️ {error}</div>}
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(196,160,79,0.08)", borderRadius: 8, fontSize: 12, color: "var(--ink-muted)" }}>
            <strong>How to find your CNR:</strong> Your CNR number is printed on your case filing receipt, vakalatnama, or any court order. It is a unique 16-character code like <code style={{ fontFamily: "monospace", fontWeight: 700 }}>MHPN0100012023</code>.
          </div>
        </form>

        {state === "loading" && (
          <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 18, background: "var(--cream-dark)", borderRadius: 6, marginBottom: 16, width: i === 3 ? "60%" : "100%", opacity: 0.6 }} />
            ))}
          </div>
        )}

        {state === "success" && caseData && (
          <div>
            {isMock && <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, fontSize: 12, color: "#4338ca", fontWeight: 500 }}>📋 Showing sample case data — live eCourts integration requires ECIAPI_TOKEN in your environment.</div>}

            <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>{caseData.cnr_number}</div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: "var(--ink)", margin: "0 0 6px" }}>{caseData.case_title}</h2>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{caseData.court_name}</div>
                </div>
                {(() => {
                  const s = getStatusStyle(caseData.status);
                  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: s.bg, borderRadius: 20, fontSize: 12, fontWeight: 700, color: s.text }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{caseData.status}</span>;
                })()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border-color)" }}>
                {[
                  { label: "Case Type", value: caseData.case_type },
                  { label: "Filed On", value: new Date(caseData.filing_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                  { label: "Presiding Judge", value: caseData.judge },
                  { label: "Next Hearing", value: caseData.next_hearing_date ? new Date(caseData.next_hearing_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not Scheduled", highlight: true },
                  { label: "Petitioner", value: caseData.petitioner },
                  { label: "Respondent", value: caseData.respondent },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: item.highlight ? 700 : 500, color: item.highlight ? "var(--forest)" : "var(--ink)" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {caseData.history?.length > 0 && (
              <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 24 }}>Hearing History</div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: "var(--border-gold)", borderRadius: 2 }} />
                  {caseData.history.map((entry, i) => (
                    <div key={i} style={{ display: "flex", gap: 24, marginBottom: i < caseData.history.length - 1 ? 28 : 0, position: "relative" }}>
                      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: i === caseData.history.length - 1 ? "var(--forest)" : "var(--ivory)", border: `2px solid ${i === caseData.history.length - 1 ? "var(--forest)" : "var(--border-gold)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i === caseData.history.length - 1 ? "var(--gold-pale)" : "var(--gold)", zIndex: 1 }}>
                        {caseData.history.length - i}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>{entry.stage}</span>
                          <span style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 500 }}>{new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{entry.remarks}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <a href="https://ecourts.gov.in/ecourts_home/" target="_blank" rel="noopener noreferrer" style={{ padding: "10px 20px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>🔗 View on eCourts Official Portal</a>
              <button onClick={() => { setCaseData(null); setState("idle"); setCnr(""); }} style={{ padding: "10px 20px", background: "var(--cream-dark)", color: "var(--ink-muted)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Search Another Case</button>
            </div>
          </div>
        )}

        {state === "idle" && (
          <div style={{ marginTop: 24, padding: "20px 24px", background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>Try these example CNR numbers</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["MHPN0100012023", "DLHC0200342024", "GJTK0500122023"].map(ex => (
                <button key={ex} onClick={() => setCnr(ex)} style={{ padding: "8px 16px", background: "var(--cream)", border: "1px solid var(--border-gold)", borderRadius: 8, fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "var(--gold)", cursor: "pointer", letterSpacing: 1 }}>{ex}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
