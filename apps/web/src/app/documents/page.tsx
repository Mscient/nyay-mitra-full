"use client";

// AI-GENERATED: Antigravity — Direct port of DocumentGeneratorPage.tsx from legacy-vite
import { useState, useRef } from "react";
import Link from "next/link";
import { generateOfficialDoc, type DocumentType } from "@/lib/DocumentTemplates";

const DOCUMENT_TYPES = [
  { id: "rti", icon: "📋", title: "RTI Application", subtitle: "Right to Information Act 2005", desc: "Request information from any government authority", docInfo: "RTI allows any Indian citizen to formally request records, documents, or data from government bodies. A fundamental tool for transparency.", fields: ["authority", "subject", "information_needed", "applicant_name", "applicant_address"] },
  { id: "legal_notice", icon: "📜", title: "Legal Notice", subtitle: "Demand / Cease & Desist", desc: "Send a formal legal notice before filing a case", docInfo: "A Legal Notice is a formal written communication informing a person of your intention to undertake legal proceedings. The formal first step in civil litigation.", fields: ["notice_to", "notice_to_address", "your_name", "your_address", "claim_details", "demand", "timeline"] },
  { id: "bail_petition", icon: "⚖️", title: "Bail Application", subtitle: "Under Section 436 / 437 CrPC", desc: "Apply for regular or anticipatory bail", docInfo: "A Bail Application is filed to seek the release of a person accused of a criminal offense, protecting their constitutional right to liberty while awaiting trial.", fields: ["accused_name", "fir_number", "police_station", "charges", "grounds_for_bail", "surety_name"] },
  { id: "complaint", icon: "📢", title: "Consumer Complaint", subtitle: "Consumer Protection Act 2019", desc: "File a complaint against a defective product or service", docInfo: "A Consumer Complaint is a formal grievance filed when a consumer experiences defective goods or deficient services resulting in financial loss.", fields: ["opposite_party", "opposite_party_address", "your_name", "your_address", "complaint_details", "relief_sought", "purchase_date"] },
  { id: "affidavit", icon: "🖊️", title: "General Affidavit", subtitle: "Notarised sworn statement", desc: "Generate a standard affidavit template", docInfo: "An Affidavit is a written, sworn statement of fact made under an oath administered by a Notary Public.", fields: ["deponent_name", "deponent_age", "deponent_address", "statement_of_facts"] },
  { id: "founder_agreement", icon: "🤝", title: "Co-Founder Agreement", subtitle: "Startup Incorporation", desc: "Define roles, equity split, and vesting for founders", docInfo: "A Co-Founder Agreement outlines equity ownership, roles, responsibilities, and vesting schedules to legally prevent internal disputes.", fields: ["startup_name", "founder1_name", "founder1_equity", "founder2_name", "founder2_equity", "vesting_period", "cliff_period", "jurisdiction"] },
  { id: "esop_policy", icon: "📈", title: "ESOP Policy", subtitle: "Employee Stock Options", desc: "Generate an Employee Stock Option Plan for your startup", docInfo: "An ESOP Policy allows employees to acquire ownership interest in the startup over time, aligning financial incentives with long-term success.", fields: ["startup_name", "total_pool_size", "vesting_period", "cliff_period", "exercise_period", "board_approver"] },
];

const FIELD_LABELS: Record<string, string> = {
  authority: "Government Authority / Department", subject: "Subject of your RTI",
  information_needed: "What information do you need?", applicant_name: "Your Full Name",
  applicant_address: "Your Address", notice_to: "Notice To (Name of Person / Company)",
  notice_to_address: "Their Address", your_name: "Your Full Name", your_address: "Your Address",
  claim_details: "Details of the dispute / claim", demand: "What you demand (e.g., payment, action)",
  timeline: "Days given to comply (e.g., 15 days)", accused_name: "Name of Accused",
  fir_number: "FIR Number", police_station: "Police Station Name", charges: "Charges / Sections",
  grounds_for_bail: "Grounds for requesting bail", surety_name: "Name of Surety / Guarantor",
  opposite_party: "Name of Opposite Party", opposite_party_address: "Address of Opposite Party",
  complaint_details: "Details of the defect or deficiency", relief_sought: "Relief/Compensation sought",
  purchase_date: "Date of Purchase", deponent_name: "Deponent's Full Name",
  deponent_age: "Age", deponent_address: "Permanent Address", statement_of_facts: "Statement of Facts",
  startup_name: "Startup / Company Name", founder1_name: "Founder 1 Name",
  founder1_equity: "Founder 1 Equity (%)", founder2_name: "Founder 2 Name",
  founder2_equity: "Founder 2 Equity (%)", vesting_period: "Vesting Period (e.g., 4 years)",
  cliff_period: "Cliff Period (e.g., 1 year)", jurisdiction: "Jurisdiction (City/State)",
  total_pool_size: "Total ESOP Pool Size (%)", exercise_period: "Exercise Period (e.g., 5 years)",
  board_approver: "Board Approver (e.g., Board of Directors)",
};

const TEXTAREA_FIELDS = ["information_needed", "claim_details", "grounds_for_bail", "complaint_details", "relief_sought", "statement_of_facts"];

export default function DocumentGeneratorPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [docHtml, setDocHtml] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiError, setAiError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedType = DOCUMENT_TYPES.find(d => d.id === selected);

  async function handleGenerateAI() {
    if (!selected) return;
    setAiGenerating(true); setAiError(""); setDocHtml(""); setAiGenerated(false);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selected, fields: values, language: "en" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fallback) {
          setDocHtml(generateOfficialDoc(selected as DocumentType, values));
          setAiError("AI unavailable (SARVAM_API_KEY not set). Showing formatted template.");
        } else {
          setAiError(data.error || "AI generation failed. Try again.");
        }
      } else {
        setDocHtml(generateOfficialDoc(selected as DocumentType, values, data.aiBody));
        setAiGenerated(true);
      }
    } catch {
      setAiError("Network error. Showing formatted template.");
      setDocHtml(generateOfficialDoc(selected as DocumentType, values));
    } finally {
      setAiGenerating(false);
    }
  }

  function handleGenerate() {
    if (!selected) return;
    setDocHtml(generateOfficialDoc(selected as DocumentType, values));
    setAiGenerated(false);
  }

  function handlePrint() { iframeRef.current?.contentWindow?.print(); }

  async function handleDownload() {
    if (!docHtml || !selected) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/documents/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: docHtml, filename: `${selected}_nyaymitra`, format: "A4" }),
      });
      if (res.ok && res.headers.get("Content-Type")?.includes("pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${selected}_nyaymitra.pdf`; a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback to HTML
        const blob = new Blob([docHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${selected}_nyaymitra.html`; a.click();
        URL.revokeObjectURL(url);
        setAiError("PDF service offline — downloaded as HTML. Run docgen-svc for PDF output.");
      }
    } catch {
      const blob = new Blob([docHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${selected}_nyaymitra.html`; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(249,245,238,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ textDecoration: "none" }}><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer" }}>← Nyay Mitra</span></Link>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Document Generator</div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px 60px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>AI-Powered</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 500, color: "var(--ink)", lineHeight: 1.1 }}>Legal Document Generator</h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 10, maxWidth: 560, lineHeight: 1.7 }}>Generate standard legal documents in seconds. Fill in the details, we'll create the formatted draft. Always get a lawyer to review before filing.</p>
        </div>

        {!selected ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {DOCUMENT_TYPES.map(doc => (
              <button key={doc.id} onClick={() => { setSelected(doc.id); setValues({}); setDocHtml(""); setAiError(""); }}
                style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16, padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.25s" }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "var(--border-gold)"; el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)"; el.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "var(--border-color)"; el.style.boxShadow = "none"; el.style.transform = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{doc.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>{doc.title}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gold)", marginBottom: 8 }}>{doc.subtitle}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>{doc.desc}</div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: docHtml ? "1fr 1fr" : "1fr", gap: 24 }}>
            {/* Form */}
            <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{selectedType?.icon}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: "var(--ink)" }}>{selectedType?.title}</div>
                  {selectedType?.docInfo && <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8, lineHeight: 1.6 }}>{selectedType.docInfo}</div>}
                </div>
                <button onClick={() => { setSelected(null); setDocHtml(""); setAiError(""); }} style={{ background: "var(--cream-dark)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, color: "var(--ink-muted)", flexShrink: 0 }}>← Back</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {selectedType?.fields.map(field => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>{FIELD_LABELS[field] || field}</label>
                    {TEXTAREA_FIELDS.includes(field) ? (
                      <textarea rows={3} value={values[field] || ""} onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))} placeholder={FIELD_LABELS[field]}
                        style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: 8, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, color: "var(--ink)", background: "var(--cream)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                        onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
                    ) : (
                      <input type="text" value={values[field] || ""} onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))} placeholder={FIELD_LABELS[field]}
                        style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: 8, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, color: "var(--ink)", background: "var(--cream)", outline: "none", boxSizing: "border-box" }}
                        onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-color)")} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={handleGenerateAI} disabled={aiGenerating}
                  style={{ width: "100%", padding: "13px", background: aiGenerating ? "#94a3b8" : "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, fontWeight: 600, cursor: aiGenerating ? "not-allowed" : "pointer" }}>
                  {aiGenerating ? "🤖 Generating with AI…" : "🤖 Generate with AI"}
                </button>
                <button onClick={handleGenerate}
                  style={{ width: "100%", padding: "10px", background: "transparent", color: "var(--ink-muted)", border: "1px solid var(--border-color)", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Use Template Only
                </button>
                {aiError && <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 12, color: "#92400e" }}>⚠️ {aiError}</div>}
              </div>
            </div>

            {/* Document Preview */}
            {docHtml && (
              <div style={{ border: "1px solid var(--border-gold)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--ivory)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-gold)", display: "flex", alignItems: "center", gap: 10, background: "rgba(196,160,79,0.06)", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--forest)", flex: 1 }}>{aiGenerated ? "🤖 AI-Generated — Official Format" : "📄 Official Format Template"}</span>
                  <button onClick={handlePrint} style={{ padding: "7px 16px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🖨️ Print / Save as PDF</button>
                  <button onClick={handleDownload} disabled={pdfLoading} style={{ padding: "7px 16px", background: "var(--cream-dark)", color: "var(--ink-mid)", border: "1px solid var(--border-color)", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: pdfLoading ? "not-allowed" : "pointer", opacity: pdfLoading ? 0.7 : 1 }}>
                    {pdfLoading ? "⏳ Generating PDF…" : "⬇️ Download PDF"}
                  </button>
                </div>
                <iframe ref={iframeRef} srcDoc={docHtml} style={{ width: "100%", height: 700, border: "none", background: "#e8e0d5" }} title="Document Preview" />
                <div style={{ padding: "10px 20px", background: "rgba(166,58,30,0.06)", borderTop: "1px solid rgba(166,58,30,0.15)", fontSize: 11, color: "#a63a1e" }}>
                  ⚠️ DRAFT — Must be reviewed and certified by a licensed Advocate before filing.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
