import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calculator, Info, ChevronDown } from "lucide-react";

// ─── Fee tables per state ───────────────────────────────────────────────────
// All amounts in INR. ad_valorem = % of suit value. max_cap = upper limit.
const STATE_CONFIG: Record<string, {
  name: string;
  ad_valorem: number;   // percentage
  max_cap: number | null;
  base_fee: number;
  process_fee: number;
  vakalatnama: number;
  affidavit: number;
  slabs?: Array<{ upto: number; rate: number }>;
}> = {
  maharashtra: {
    name: "Maharashtra",
    ad_valorem: 2.0, max_cap: 300000, base_fee: 500,
    process_fee: 200, vakalatnama: 50, affidavit: 10,
    slabs: [
      { upto: 100000, rate: 2.0 },
      { upto: 500000, rate: 2.5 },
      { upto: 1000000, rate: 3.0 },
      { upto: Infinity, rate: 3.5 },
    ],
  },
  delhi: {
    name: "Delhi",
    ad_valorem: 1.5, max_cap: null, base_fee: 500,
    process_fee: 250, vakalatnama: 50, affidavit: 10,
    slabs: [
      { upto: 50000, rate: 1.5 },
      { upto: 200000, rate: 2.0 },
      { upto: Infinity, rate: 2.5 },
    ],
  },
  karnataka: {
    name: "Karnataka",
    ad_valorem: 2.5, max_cap: 250000, base_fee: 600,
    process_fee: 300, vakalatnama: 75, affidavit: 15,
  },
  tamilnadu: {
    name: "Tamil Nadu",
    ad_valorem: 2.0, max_cap: 200000, base_fee: 500,
    process_fee: 200, vakalatnama: 50, affidavit: 10,
  },
  telangana: {
    name: "Telangana",
    ad_valorem: 2.0, max_cap: 150000, base_fee: 500,
    process_fee: 200, vakalatnama: 50, affidavit: 10,
  },
  gujarat: {
    name: "Gujarat",
    ad_valorem: 2.0, max_cap: 250000, base_fee: 500,
    process_fee: 200, vakalatnama: 50, affidavit: 10,
  },
  rajasthan: {
    name: "Rajasthan",
    ad_valorem: 2.5, max_cap: 200000, base_fee: 500,
    process_fee: 200, vakalatnama: 50, affidavit: 10,
  },
  up: {
    name: "Uttar Pradesh",
    ad_valorem: 1.5, max_cap: null, base_fee: 500,
    process_fee: 150, vakalatnama: 30, affidavit: 10,
  },
  other: {
    name: "Other States (Generic)",
    ad_valorem: 2.0, max_cap: null, base_fee: 500,
    process_fee: 200, vakalatnama: 50, affidavit: 10,
  },
};

const CASE_TYPES = [
  { id: "money_recovery", label: "Money Recovery Suit", adValorem: true },
  { id: "injunction", label: "Injunction / Declaration", adValorem: false, fixed: 1000 },
  { id: "property_possession", label: "Property / Possession", adValorem: true },
  { id: "matrimonial", label: "Matrimonial / Divorce", adValorem: false, fixed: 200 },
  { id: "consumer", label: "Consumer Complaint", adValorem: false, fixed: 0 },
  { id: "writ", label: "Writ Petition (HC)", adValorem: false, fixed: 500 },
  { id: "criminal_revision", label: "Criminal Revision", adValorem: false, fixed: 300 },
];

function calcAdValorem(value: number, cfg: typeof STATE_CONFIG["maharashtra"]): number {
  if (cfg.slabs) {
    let fee = 0;
    let remaining = value;
    let prev = 0;
    for (const slab of cfg.slabs) {
      const chunk = Math.min(remaining, slab.upto - prev);
      if (chunk <= 0) break;
      fee += chunk * (slab.rate / 100);
      remaining -= chunk;
      prev = slab.upto;
    }
    if (cfg.max_cap !== null) fee = Math.min(fee, cfg.max_cap);
    return Math.round(fee);
  }
  let fee = value * (cfg.ad_valorem / 100);
  if (cfg.max_cap !== null) fee = Math.min(fee, cfg.max_cap);
  return Math.round(fee);
}

export default function CourtFeeCalculatorPage() {
  const [stateKey, setStateKey] = useState("maharashtra");
  const [caseTypeId, setCaseTypeId] = useState("money_recovery");
  const [suitValue, setSuitValue] = useState("");
  const [result, setResult] = useState<{
    adValorem: number; base: number; process: number; vakalatnama: number;
    affidavit: number; total: number; note?: string;
  } | null>(null);

  const cfg = STATE_CONFIG[stateKey];
  const caseType = CASE_TYPES.find(c => c.id === caseTypeId)!;

  function calculate() {
    const value = parseFloat(suitValue.replace(/,/g, ""));
    let adValorem = 0;
    let note: string | undefined;

    if (caseType.adValorem) {
      if (isNaN(value) || value < 0) return;
      adValorem = calcAdValorem(value, cfg);
    } else if (caseType.fixed !== undefined) {
      adValorem = caseType.fixed;
      if (caseType.id === "consumer") note = "Consumer complaints are free of court fee under Consumer Protection Act 2019.";
    }

    setResult({
      adValorem,
      base: cfg.base_fee,
      process: cfg.process_fee,
      vakalatnama: cfg.vakalatnama,
      affidavit: cfg.affidavit,
      total: adValorem + cfg.base_fee + cfg.process_fee + cfg.vakalatnama + cfg.affidavit,
      note,
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", border: "1px solid var(--border-color)",
    borderRadius: 10, fontFamily: "'Instrument Sans', sans-serif", fontSize: 15,
    color: "var(--ink)", background: "var(--cream)", outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 7,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(249,245,238,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "0 clamp(16px, 4vw, 40px)", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/"><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><ArrowLeft size={13} /> Nyay Mitra</span></Link>
        <div style={{ width: 1, height: 18, background: "var(--border-gold)" }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 500, color: "var(--ink)" }}>Court Fee Calculator</div>
      </nav>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(80px, 10vw, 100px) clamp(16px, 4vw, 40px) 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,146,10,0.1)", border: "1px solid rgba(201,146,10,0.25)", borderRadius: 100, padding: "4px 14px", marginBottom: 18 }}>
            <Calculator size={13} color="var(--gold)" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)" }}>Legal Utility Tool</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(38px, 5vw, 58px)", fontWeight: 500, color: "var(--ink)", lineHeight: 1.1, margin: "0 0 14px" }}>
            Stamp Duty & Court Fee <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Calculator</em>
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            Estimate ad-valorem court fees, stamp duty, and ancillary charges across Indian states and case types.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 28, alignItems: "start" }}>

          {/* ── Input Panel ── */}
          <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 24, padding: "clamp(24px, 4vw, 36px)", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: "var(--ink)", marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid var(--border-gold)" }}>
              Parameters
            </h2>

            {/* State */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Jurisdiction (State)</label>
              <div style={{ position: "relative" }}>
                <select value={stateKey} onChange={e => { setStateKey(e.target.value); setResult(null); }}
                  style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}>
                  {Object.entries(STATE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Case Type */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Case / Suit Type</label>
              <div style={{ position: "relative" }}>
                <select value={caseTypeId} onChange={e => { setCaseTypeId(e.target.value); setResult(null); }}
                  style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}>
                  {CASE_TYPES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Suit Value (only for ad-valorem types) */}
            {caseType.adValorem && (
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Suit Valuation (₹)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: "var(--ink-muted)", fontWeight: 500 }}>₹</span>
                  <input type="number" value={suitValue} onChange={e => { setSuitValue(e.target.value); setResult(null); }}
                    placeholder="e.g. 500000"
                    style={{ ...inputStyle, paddingLeft: 38, fontSize: 18 }}
                    onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
                  />
                </div>
                {cfg.slabs && (
                  <p style={{ marginTop: 6, fontSize: 11, color: "var(--ink-muted)" }}>
                    {cfg.name} uses slab-based rates. {cfg.max_cap ? `Capped at ₹${cfg.max_cap.toLocaleString("en-IN")}.` : "No upper cap."}
                  </p>
                )}
              </div>
            )}

            {!caseType.adValorem && (
              <div style={{ marginBottom: 28, padding: "12px 16px", background: "rgba(201,146,10,0.07)", border: "1px solid rgba(201,146,10,0.2)", borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: "var(--gold-dark, #92600a)", margin: 0 }}>
                  {caseType.id === "consumer"
                    ? "✅ Consumer complaints have zero court fee under the Consumer Protection Act 2019."
                    : `📌 This case type has a fixed fee of ₹${(caseType.fixed || 0).toLocaleString("en-IN")} (not ad-valorem).`}
                </p>
              </div>
            )}

            <button onClick={calculate}
              disabled={caseType.adValorem && !suitValue}
              style={{ width: "100%", padding: "15px", background: (caseType.adValorem && !suitValue) ? "var(--border-color)" : "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 12, fontFamily: "'Instrument Sans', sans-serif", fontSize: 16, fontWeight: 700, cursor: (caseType.adValorem && !suitValue) ? "not-allowed" : "pointer", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
              <Calculator size={17} />
              Calculate Fee Estimate
            </button>
          </div>

          {/* ── Result Panel ── */}
          <div style={{ background: "var(--forest)", borderRadius: 24, padding: "clamp(28px, 4vw, 40px)", color: "var(--ivory)", position: "relative", overflow: "hidden", minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* glows */}
            <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: "var(--gold)", opacity: 0.08, filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -80, left: -80, width: 220, height: 220, borderRadius: "50%", background: "#4ade80", opacity: 0.05, filter: "blur(50px)", pointerEvents: "none" }} />

            {!result ? (
              <div style={{ textAlign: "center", opacity: 0.65, zIndex: 1, position: "relative" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>⚖️</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>
                  Select your jurisdiction, case type, and suit value, then click <strong>Calculate</strong>.
                </div>
              </div>
            ) : (
              <div style={{ zIndex: 1, position: "relative" }}>
                {/* Total */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>Estimated Total Court Fee</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(52px, 7vw, 72px)", fontWeight: 300, color: "var(--ivory)", lineHeight: 1, letterSpacing: -1 }}>
                    ₹{result.total.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
                    {cfg.name} · {caseType.label}
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 20px 8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>Fee Breakdown</div>
                  {[
                    { label: caseType.adValorem ? "Ad-Valorem Court Fee" : "Fixed Court Fee", value: result.adValorem },
                    { label: "Base Filing Fee", value: result.base },
                    { label: "Process / Summons Fee", value: result.process },
                    { label: "Vakalatnama Stamp", value: result.vakalatnama },
                    { label: "Affidavit Stamp", value: result.affidavit },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: 14 }}>
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>{row.label}</span>
                      <span style={{ fontWeight: 600 }}>₹{row.value.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 6px", fontSize: 15, fontWeight: 700 }}>
                    <span>Total Payable</span>
                    <span style={{ color: "var(--gold)" }}>₹{result.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {result.note && (
                  <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(74,222,128,0.12)", borderRadius: 8, fontSize: 12, color: "#86efac", lineHeight: 1.5 }}>
                    ✅ {result.note}
                  </div>
                )}

                <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(201,146,10,0.12)", borderRadius: 8, fontSize: 11, color: "var(--gold)", lineHeight: 1.5, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Info size={12} style={{ marginTop: 1, shrink: 0 }} />
                  <span>Approximate estimate only. Actual fees depend on specific reliefs, local schedules, and court amendments. Consult a qualified advocate before filing.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* State fee table */}
        <div style={{ marginTop: 56, background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-gold)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: "var(--ink)" }}>State Fee Reference</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Ad-valorem rates</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(201,146,10,0.06)" }}>
                  {["State", "Base Rate", "Max Cap", "Base Fee", "Process Fee"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-muted)", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(STATE_CONFIG).filter(s => s.name !== "Other States (Generic)").map((s, i) => (
                  <tr key={s.name} style={{ background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)" }}>
                    <td style={{ padding: "10px 20px", fontWeight: 600, color: "var(--ink)", borderBottom: "1px solid var(--border-color)" }}>{s.name}</td>
                    <td style={{ padding: "10px 20px", color: "var(--ink-mid)", borderBottom: "1px solid var(--border-color)" }}>{s.ad_valorem}%{s.slabs ? " (slab)" : ""}</td>
                    <td style={{ padding: "10px 20px", color: "var(--ink-mid)", borderBottom: "1px solid var(--border-color)" }}>{s.max_cap ? `₹${s.max_cap.toLocaleString("en-IN")}` : "None"}</td>
                    <td style={{ padding: "10px 20px", color: "var(--ink-mid)", borderBottom: "1px solid var(--border-color)" }}>₹{s.base_fee}</td>
                    <td style={{ padding: "10px 20px", color: "var(--ink-mid)", borderBottom: "1px solid var(--border-color)" }}>₹{s.process_fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
