import { useState } from "react";
import { Link } from "wouter";
import { Search, Calculator, Clock, CheckCircle2, AlertCircle } from "lucide-react";

// Section 436A CrPC: Undertrial who has served half the maximum sentence gets bail
// Maximum sentences by major IPC sections
const SECTION_DATA: Array<{ section: string; offence: string; maxYears: number; bailable: boolean }> = [
  { section: "302", offence: "Murder", maxYears: 99, bailable: false },
  { section: "307", offence: "Attempt to Murder", maxYears: 10, bailable: false },
  { section: "376", offence: "Rape", maxYears: 20, bailable: false },
  { section: "379", offence: "Theft", maxYears: 3, bailable: false },
  { section: "420", offence: "Cheating", maxYears: 7, bailable: false },
  { section: "304", offence: "Culpable Homicide (not murder)", maxYears: 10, bailable: false },
  { section: "323", offence: "Voluntarily causing hurt", maxYears: 1, bailable: true },
  { section: "324", offence: "Hurt with dangerous weapon", maxYears: 3, bailable: false },
  { section: "325", offence: "Grievous hurt", maxYears: 7, bailable: false },
  { section: "363", offence: "Kidnapping", maxYears: 7, bailable: false },
  { section: "395", offence: "Dacoity", maxYears: 99, bailable: false },
  { section: "406", offence: "Criminal breach of trust", maxYears: 3, bailable: false },
  { section: "498A", offence: "Cruelty against wife", maxYears: 3, bailable: false },
  { section: "509", offence: "Words/gestures insulting modesty", maxYears: 3, bailable: true },
  { section: "SC/ST Act", offence: "Atrocities (SC/ST Act)", maxYears: 5, bailable: false },
  { section: "POCSO", offence: "Child sexual abuse (POCSO)", maxYears: 20, bailable: false },
  { section: "NDPS", offence: "Drug offences (NDPS)", maxYears: 10, bailable: false },
];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function UndertrialTrackerPage() {
  const [activeTab, setActiveTab] = useState<"calculator" | "tracker">("calculator");

  // Calculator State
  const [form, setForm] = useState({
    name: "",
    section: "",
    customSection: "",
    customMaxYears: "",
    arrestDate: "",
    remandDate: "",
    policeStation: "",
    courtName: "",
    nextHearing: "",
  });
  const [result, setResult] = useState<any>(null);

  // Tracker State
  const [cnr, setCnr] = useState("");
  const [isFetchingTracker, setIsFetchingTracker] = useState(false);
  const [trackerData, setTrackerData] = useState<any>(null);
  const [trackerError, setTrackerError] = useState<string | null>(null);

  const selectedSection = SECTION_DATA.find(s => s.section === form.section);

  function calculate() {
    const maxYears = selectedSection
      ? selectedSection.maxYears
      : parseFloat(form.customMaxYears) || 0;

    if (!form.arrestDate || maxYears === 0) return;

    const arrest = new Date(form.arrestDate);
    const today = new Date();
    const remand = form.remandDate ? new Date(form.remandDate) : arrest;

    // Days served from remand to today
    const daysServed = Math.max(0, Math.floor((today.getTime() - remand.getTime()) / 86400000));

    // Half of max sentence in days (excluding life/death penalty cases)
    const halfMaxDays = maxYears === 99 ? Infinity : Math.floor((maxYears * 365) / 2);
    const isEligible = daysServed >= halfMaxDays;
    const daysRemaining = Math.max(0, halfMaxDays - daysServed);
    const eligibilityDate = halfMaxDays === Infinity ? null : addDays(remand, halfMaxDays);

    const isBailable = selectedSection?.bailable || false;

    setResult({
      name: form.name || "The undertrial",
      section: selectedSection?.section || form.customSection,
      offence: selectedSection?.offence || "Offence under Sections " + form.customSection,
      maxYears,
      daysServed,
      halfMaxDays,
      isEligible,
      daysRemaining,
      eligibilityDate,
      isBailable,
      isLifeSentence: maxYears === 99,
      courtName: form.courtName,
      nextHearing: form.nextHearing,
    });
  }

  async function fetchCaseStatus() {
    if (!cnr || cnr.length < 10) {
      setTrackerError("Please enter a valid CNR number (e.g. MHAU010002132023)");
      return;
    }
    setIsFetchingTracker(true);
    setTrackerError(null);
    setTrackerData(null);
    try {
      const res = await fetch(`/api/legal/ecourts/cnr/${cnr}`);
      if (res.ok) {
        const json = await res.json();
        setTrackerData(json.data);
      } else {
        const err = await res.json();
        setTrackerError(err.error || "Failed to fetch case status.");
      }
    } catch (err) {
      setTrackerError("Network error. Could not connect to courts database.");
    } finally {
      setIsFetchingTracker(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    border: "1px solid var(--border-color)", borderRadius: 8,
    fontFamily: "'Instrument Sans',sans-serif", fontSize: 14,
    color: "var(--ink)", background: "var(--cream)", outline: "none"
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 10, fontWeight: 600,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "var(--ink-muted)", marginBottom: 6
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(249,245,238,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/"><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer" }}>← Nyay Mitra</span></Link>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Undertrial Tracker — Section 436A</div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Justice & Rights</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 500, color: "var(--ink)", lineHeight: 1.1 }}>Undertrial Case Hub</h1>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 10, lineHeight: 1.65, maxWidth: 600 }}>
              Track live district court case statuses or calculate statutory bail eligibility under Section 436A of the CrPC.
            </p>
          </div>
          <div style={{ display: "flex", background: "rgba(201,146,10,0.1)", borderRadius: 12, padding: 4 }}>
            <button onClick={() => setActiveTab("tracker")} style={{ border: "none", background: activeTab === "tracker" ? "var(--ivory)" : "transparent", color: activeTab === "tracker" ? "var(--forest)" : "var(--ink-muted)", boxShadow: activeTab === "tracker" ? "var(--shadow-sm)" : "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Search size={14} /> Live Tracking
            </button>
            <button onClick={() => setActiveTab("calculator")} style={{ border: "none", background: activeTab === "calculator" ? "var(--ivory)" : "transparent", color: activeTab === "calculator" ? "var(--forest)" : "var(--ink-muted)", boxShadow: activeTab === "calculator" ? "var(--shadow-sm)" : "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Calculator size={14} /> Bail Calculator
            </button>
          </div>
        </div>

        {activeTab === "calculator" ? (
        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 24 }}>
          {/* Form */}
          <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: "var(--ink)", marginBottom: 24 }}>Enter Details</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Accused Person's Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
              </div>

              <div>
                <label style={labelStyle}>IPC / Special Law Section</label>
                <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">— Select section or enter custom —</option>
                  {SECTION_DATA.map(s => (
                    <option key={s.section} value={s.section}>Sec {s.section} — {s.offence} ({s.maxYears === 99 ? "Life/Death" : s.maxYears + " yrs"})</option>
                  ))}
                  <option value="custom">Custom Section (enter below)</option>
                </select>
              </div>

              {form.section === "custom" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Section Number</label>
                    <input type="text" value={form.customSection} onChange={e => setForm(f => ({ ...f, customSection: e.target.value }))} placeholder="e.g., 120B" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Sentence (years)</label>
                    <input type="number" value={form.customMaxYears} onChange={e => setForm(f => ({ ...f, customMaxYears: e.target.value }))} placeholder="e.g., 7" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date of Arrest</label>
                  <input type="date" value={form.arrestDate} onChange={e => setForm(f => ({ ...f, arrestDate: e.target.value }))} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
                </div>
                <div>
                  <label style={labelStyle}>Judicial Remand From</label>
                  <input type="date" value={form.remandDate} onChange={e => setForm(f => ({ ...f, remandDate: e.target.value }))} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Court Name</label>
                <input type="text" value={form.courtName} onChange={e => setForm(f => ({ ...f, courtName: e.target.value }))} placeholder="Sessions Court, Mumbai" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
              </div>
              <div>
                <label style={labelStyle}>Next Hearing Date</label>
                <input type="date" value={form.nextHearing} onChange={e => setForm(f => ({ ...f, nextHearing: e.target.value }))} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
              </div>
            </div>

            <button onClick={calculate} style={{ marginTop: 24, width: "100%", padding: "13px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              ⚖️ Check Bail Eligibility
            </button>
          </div>

          {/* Result */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Status card */}
              <div style={{
                borderRadius: 20, overflow: "hidden", border: `2px solid ${result.isEligible ? "var(--teal)" : "var(--border-gold)"}`,
                background: "var(--ivory)"
              }}>
                <div style={{ padding: "20px 24px", background: result.isEligible ? "var(--teal)" : result.isLifeSentence ? "var(--ink)" : "var(--forest)", color: "var(--ivory)" }}>
                  <div style={{ fontSize: 30, marginBottom: 4 }}>{result.isEligible ? "✅" : result.isLifeSentence ? "⛔" : "⏳"}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500 }}>
                    {result.isLifeSentence ? "Life sentence — Sec 436A does not apply" :
                     result.isEligible ? "Eligible for bail under Sec 436A" :
                     "Not yet eligible — still in count-down"}
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    {[
                      ["Accused", result.name],
                      ["Offence", `Sec ${result.section} — ${result.offence}`],
                      ["Max Sentence", result.maxYears === 99 ? "Life / Death" : result.maxYears + " years"],
                      ["Half of Max", result.halfMaxDays === Infinity ? "N/A" : `${result.halfMaxDays} days (${(result.halfMaxDays/365).toFixed(1)} yrs)`],
                      ["Days Served", `${result.daysServed} days (${(result.daysServed/365).toFixed(1)} yrs)`],
                      ["Days Remaining", result.isEligible ? "—" : `${result.daysRemaining} more days`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {result.eligibilityDate && !result.isEligible && (
                    <div style={{ background: "var(--gold-whisper)", border: "1px solid var(--border-gold)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "var(--ink-mid)" }}>
                      📅 Eligible for Sec 436A bail from: <strong>{result.eligibilityDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
                    </div>
                  )}

                  {result.nextHearing && (
                    <div style={{ background: "var(--teal-light)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "var(--teal)" }}>
                      🗓 Next Hearing: <strong>{new Date(result.nextHearing).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
                      {result.courtName ? ` — ${result.courtName}` : ""}
                    </div>
                  )}

                  <div style={{ background: "var(--rust-light)", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "var(--rust)", lineHeight: 1.5 }}>
                    ⚠️ Section 436A does not apply if: (a) death sentence may be imposed on conviction; (b) the person has been convicted previously of the same offence. Consult a lawyer.
                  </div>
                </div>
              </div>

              {/* What to do next */}
              {result.isEligible && (
                <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--forest)", marginBottom: 12 }}>Action Items</div>
                  {[
                    "File a bail application under Section 436A CrPC in the Sessions Court",
                    "Attach: Warrant/Remand orders to show custody period",
                    "Cite: Hussainara Khatoon (1979) & SC Re: Prisons (2016) judgments",
                    "Approach DLSA if you don't have a lawyer — they must assist",
                    "NALSA helpline: 15100 | Legal Aid 24×7"
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border-color)", fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>{i + 1}.</span>
                      {item}
                    </div>
                  ))}
                </div>
              )}

              <Link href="/chat">
                <button style={{ width: "100%", padding: "12px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  💬 Ask AI for More Help
                </button>
              </Link>
            </div>
          )}
        </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Tracker Input */}
            <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>Track Court Case via CNR</div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>Enter your 16-digit Case Number Record (CNR) to fetch live status from eCourts.</p>
              
              <div style={{ display: "flex", gap: 12 }}>
                <input 
                  type="text" 
                  value={cnr} 
                  onChange={e => setCnr(e.target.value.toUpperCase())} 
                  placeholder="e.g., MHAU010002132023" 
                  style={{ ...inputStyle, flex: 1, textTransform: "uppercase", letterSpacing: 1 }}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
                />
                <button 
                  onClick={fetchCaseStatus}
                  disabled={isFetchingTracker || !cnr.trim()}
                  style={{ padding: "12px 24px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 8, fontWeight: 600, cursor: isFetchingTracker ? "default" : "pointer", opacity: isFetchingTracker ? 0.7 : 1 }}
                >
                  {isFetchingTracker ? "Fetching..." : "Track Case"}
                </button>
              </div>
              {trackerError && <div style={{ color: "var(--rust)", fontSize: 13, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14}/> {trackerError}</div>}
            </div>

            {/* Tracker Results */}
            {trackerData && (
              <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, overflow: "hidden" }}>
                <div style={{ background: "var(--forest)", padding: "24px 32px", color: "var(--ivory)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "var(--gold-pale)", marginBottom: 8 }}>{trackerData.cnr_number}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, marginBottom: 4 }}>{trackerData.case_title}</div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>{trackerData.court_name} • {trackerData.case_type}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    Status: {trackerData.status}
                  </div>
                </div>

                <div style={{ padding: 32, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 40 }}>
                  
                  {/* Metadata Sidebar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--ink-muted)", marginBottom: 4 }}>Presiding Judge</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{trackerData.judge}</div>
                    </div>
                    <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--ink-muted)", marginBottom: 4 }}>Next Hearing</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{new Date(trackerData.next_hearing_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                    </div>
                    <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--ink-muted)", marginBottom: 4 }}>Petitioner</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{trackerData.petitioner}</div>
                    </div>
                    <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--ink-muted)", marginBottom: 4 }}>Respondent</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{trackerData.respondent}</div>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={16} color="var(--gold)"/> Case History
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
                      {trackerData.history?.map((event: any, idx: number) => {
                        const isLast = idx === trackerData.history.length - 1;
                        return (
                          <div key={idx} style={{ display: "flex", gap: 20, position: "relative" }}>
                            {/* Line connecting nodes */}
                            {!isLast && <div style={{ position: "absolute", left: 11, top: 24, bottom: -8, width: 2, background: "var(--gold-whisper)", zIndex: 0 }} />}
                            
                            {/* Dot */}
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--gold-pale)", border: "2px solid var(--gold)", zIndex: 1, marginTop: 2, flexShrink: 0 }} />
                            
                            {/* Content */}
                            <div style={{ flex: 1, paddingBottom: 32 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 2 }}>
                                {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{event.stage}</div>
                              <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{event.remarks}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
