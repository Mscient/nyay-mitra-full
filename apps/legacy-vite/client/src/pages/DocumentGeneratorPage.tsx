import { useState, useRef } from "react";
import { Link } from "wouter";
import { generateOfficialDoc, type DocumentType } from "../lib/DocumentTemplates";

const DOCUMENT_TYPES = [
  {
    id: "rti",
    icon: "📋",
    title: "RTI Application",
    subtitle: "Right to Information Act 2005",
    desc: "Request information from any government authority",
    docInfo: "RTI (Right to Information) allows any Indian citizen to formally request records, documents, or data from government bodies. It is a fundamental tool for ensuring transparency and holding public authorities accountable.",
    fields: ["authority", "subject", "information_needed", "applicant_name", "applicant_address"],
  },
  {
    id: "legal_notice",
    icon: "📜",
    title: "Legal Notice",
    subtitle: "Demand / Cease & Desist",
    desc: "Send a formal legal notice before filing a case",
    docInfo: "A Legal Notice is a formal, written communication to a person or entity informing them of your intention to undertake legal proceedings against them. It serves as the formal first step in civil litigation before approaching a court.",
    fields: ["notice_to", "notice_to_address", "your_name", "your_address", "claim_details", "demand", "timeline"],
  },
  {
    id: "bail_petition",
    icon: "⚖️",
    title: "Bail Application",
    subtitle: "Under Section 436 / 437 CrPC",
    desc: "Apply for regular or anticipatory bail",
    docInfo: "A Bail Application is formally filed to seek the release of a person accused of a criminal offense. Establishing bail ensures the accused's constitutional right to liberty is protected while awaiting trial or judgment.",
    fields: ["accused_name", "fir_number", "police_station", "charges", "grounds_for_bail", "surety_name"],
  },
  {
    id: "complaint",
    icon: "📢",
    title: "Consumer Complaint",
    subtitle: "Consumer Protection Act 2019",
    desc: "File a complaint against a defective product or service",
    docInfo: "A Consumer Complaint is a formal grievance filed under the Consumer Protection Act when a consumer experiences defective goods or deficient services resulting in financial loss or harassment from a seller.",
    fields: ["opposite_party", "opposite_party_address", "your_name", "your_address", "complaint_details", "relief_sought", "purchase_date"],
  },
  {
    id: "affidavit",
    icon: "🖊️",
    title: "General Affidavit",
    subtitle: "Notarised sworn statement",
    desc: "Generate a standard affidavit template",
    docInfo: "An Affidavit is a written, sworn statement of fact voluntarily made by an affiant or deponent under an oath administered by a person authorized to do so by law (like a Notary Public).",
    fields: ["deponent_name", "deponent_age", "deponent_address", "statement_of_facts"],
  },
  {
    id: "founder_agreement",
    icon: "🤝",
    title: "Co-Founder Agreement",
    subtitle: "Startup Incorporation",
    desc: "Define roles, equity split, and vesting for founders",
    docInfo: "A Co-Founder Agreement establishes the core legal framework for a startup's founding team. It outlines equity ownership splits, roles, responsibilities, and specific vesting schedules to legally prevent future internal disputes.",
    fields: ["startup_name", "founder1_name", "founder1_equity", "founder2_name", "founder2_equity", "vesting_period", "cliff_period", "jurisdiction"],
  },
  {
    id: "esop_policy",
    icon: "📈",
    title: "ESOP Policy",
    subtitle: "Employee Stock Options",
    desc: "Generate an Employee Stock Option Plan for your startup",
    docInfo: "An Employee Stock Option Plan (ESOP) Policy legally allows employees to acquire ownership interest in the startup over time, aligning their financial incentives with the company's long-term macro success.",
    fields: ["startup_name", "total_pool_size", "vesting_period", "cliff_period", "exercise_period", "board_approver"],
  },
];

const FIELD_LABELS: Record<string, string> = {
  authority: "Government Authority / Department",
  subject: "Subject of your RTI",
  information_needed: "What information do you need?",
  applicant_name: "Your Full Name",
  applicant_address: "Your Address",
  notice_to: "Notice To (Name of Person / Company)",
  notice_to_address: "Their Address",
  your_name: "Your Full Name",
  your_address: "Your Address",
  claim_details: "Details of the dispute / claim",
  demand: "What you demand (e.g., payment, action)",
  timeline: "Days given to comply (e.g., 15 days)",
  accused_name: "Name of Accused",
  fir_number: "FIR Number",
  police_station: "Police Station Name",
  charges: "Charges / Sections",
  grounds_for_bail: "Grounds for requesting bail",
  surety_name: "Name of Surety / Guarantor",
  opposite_party: "Name of Opposite Party",
  opposite_party_address: "Address of Opposite Party",
  complaint_details: "Details of the defect or deficiency",
  relief_sought: "Relief/Compensation sought",
  purchase_date: "Date of Purchase",
  deponent_name: "Deponent's Full Name",
  deponent_age: "Age",
  deponent_address: "Permanent Address",
  statement_of_facts: "Statement of Facts",
  startup_name: "Startup / Company Name",
  founder1_name: "Founder 1 Name",
  founder1_equity: "Founder 1 Equity (%)",
  founder2_name: "Founder 2 Name",
  founder2_equity: "Founder 2 Equity (%)",
  vesting_period: "Vesting Period (e.g., 4 years)",
  cliff_period: "Cliff Period (e.g., 1 year)",
  jurisdiction: "Jurisdiction (City/State)",
  total_pool_size: "Total ESOP Pool Size (%)",
  exercise_period: "Exercise Period (e.g., 5 years)",
  board_approver: "Board Approver (e.g., Board of Directors)",
};

function generateDocument(type: string, values: Record<string, string>): string {
  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  switch (type) {
    case "rti":
      return `TO,
The Public Information Officer,
${values.authority || "[Authority Name]"}

Subject: Application under RTI Act 2005 — ${values.subject || "[Subject]"}

Date: ${date}

Sir/Madam,

I, ${values.applicant_name || "[Your Name]"}, residing at ${values.applicant_address || "[Your Address]"}, hereby request the following information under Section 6(1) of the Right to Information Act, 2005:

${values.information_needed || "[Describe the information needed]"}

I am depositing a fee of Rs. 10/- as stipulated under the RTI Act. If the information requested is not available with your office, please transfer this application to the concerned Public Authority under Section 6(3) of the RTI Act.

Please provide the information within 30 days as mandated by Section 7(1) of the RTI Act.

Yours sincerely,
${values.applicant_name || "[Your Name]"}
${values.applicant_address || "[Your Address]"}
Date: ${date}

---
⚖️ Drafted by Nyay Mitra — Not a substitute for professional legal advice`;

    case "legal_notice":
      return `LEGAL NOTICE

FROM:
${values.your_name || "[Your Name]"}
${values.your_address || "[Your Address]"}

TO:
${values.notice_to || "[Recipient Name]"}
${values.notice_to_address || "[Recipient Address]"}

Date: ${date}

SUBJECT: Legal Notice for ${values.claim_details ? values.claim_details.substring(0, 50) + "..." : "[Matter]"}

TAKE NOTICE THAT:

My client, ${values.your_name || "[Name]"}, instructs me to address you this legal notice as under:

${values.claim_details || "[Describe the dispute/claim in detail]"}

You are hereby called upon to ${values.demand || "[state what you demand]"} within ${values.timeline || "15"} days from receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you before the competent court for recovery of dues along with interest at 18% per annum and costs of legal proceedings.

This notice is without prejudice to all other rights and remedies available to my client.

Issued by:
${values.your_name || "[Your Name]"}
Date: ${date}

---
⚖️ Drafted by Nyay Mitra — Consult a lawyer before sending`;

    case "bail_petition":
      return `IN THE COURT OF THE SESSIONS JUDGE
[District]

IN THE MATTER OF:
BAIL APPLICATION UNDER SECTION 437 CrPC

Petitioner: ${values.accused_name || "[Name of Accused]"}
FIR No.: ${values.fir_number || "[FIR Number]"}
Police Station: ${values.police_station || "[Police Station]"}
Case: Under Sections ${values.charges || "[IPC Sections]"}

BAIL APPLICATION

Most Respectfully Showeth,

1. That the applicant ${values.accused_name || "[Name]"} has been arrested in connection with FIR No. ${values.fir_number || "[FIR No.]"} at ${values.police_station || "[Police Station]"} under Sections ${values.charges || "[Sections]"}.

2. Grounds for releasing the applicant on bail:
${values.grounds_for_bail || "[State detailed grounds — co-operation, no flight risk, family responsibilities, sickness, etc.]"}

3. The applicant offers ${values.surety_name || "[Surety Name]"} as surety for the above-mentioned bail.

4. The applicant undertakes to co-operate with the investigation and not tamper with evidence.

PRAYER:
The applicant therefore prays that this Hon'ble Court may be pleased to:
a) Release the applicant on bail;
b) Pass such other orders as this Hon'ble Court may deem fit.

Date: ${date}
Place: [City]

Applicant / Counsel for Applicant

---
⚖️ Drafted by Nyay Mitra — Requires a licensed Advocate to file`;

    case "complaint":
      return `TO,
The District Consumer Disputes Redressal Commission
[District]

CONSUMER COMPLAINT

Complainant: ${values.your_name || "[Your Name]"}
Address: ${values.your_address || "[Your Address]"}

Opposite Party: ${values.opposite_party || "[Company / Person]"}
Address: ${values.opposite_party_address || "[Their Address]"}

Date of Filing: ${date}

FACTS OF THE COMPLAINT:

1. The Complainant purchased/availed services from the Opposite Party on ${values.purchase_date || "[Date]"}.

2. Details of defect / deficiency of service:
${values.complaint_details || "[Describe the issue in detail]"}

3. RELIEF SOUGHT:
${values.relief_sought || "[Compensation / replacement / refund]"}

PRAYER:
That this Commission may be pleased to direct the Opposite Party to:
a) ${values.relief_sought || "Pay compensation"}
b) Pay litigation costs
c) Any other relief this Commission deems fit.

Place: [City]
Date: ${date}
Complainant Signature: ________________

---
⚖️ Drafted by Nyay Mitra — File with relevant supporting documents`;

    case "affidavit":
      return `AFFIDAVIT

I, ${values.deponent_name || "[Name]"}, aged ${values.deponent_age || "[Age]"} years, residing at ${values.deponent_address || "[Address]"}, do hereby solemnly affirm and declare as under:

THAT I am the deponent above named. I am competent to swear this affidavit.

That the following is true and correct to the best of my knowledge and belief:

${values.statement_of_facts || "[State all relevant facts clearly and separately numbered]"}

I say that the contents of this affidavit are true and correct to the best of my knowledge, belief, and information and nothing material has been concealed therefrom.

DEPONENT

Verified at [City] on ${date}

${values.deponent_name || "[Name]"}

(To be notarised by a Notary Public / Oath Commissioner)

---
⚖️ Drafted by Nyay Mitra — Must be notarised to be legally valid`;

    case "founder_agreement":
      return `CO-FOUNDER AGREEMENT

This Co-Founder Agreement ("Agreement") is made and entered into on this ${date}, by and between:

1. ${values.founder1_name || "[Founder 1 Name]"} ("Founder 1")
2. ${values.founder2_name || "[Founder 2 Name]"} ("Founder 2")

Collectively referred to as the "Founders" of ${values.startup_name || "[Startup Name]"} (the "Company").

1. PURPOSE
The Founders are collaborating to develop and launch the Company. This Agreement outlines the ownership rights, responsibilities, and equity vesting schedules to ensure the successful operation of the Company.

2. EQUITY OWNERSHIP
The Founders agree to apportion the equity in the Company as follows:
- ${values.founder1_name || "[Founder 1 Name]"}: ${values.founder1_equity || "[%]"}%
- ${values.founder2_name || "[Founder 2 Name]"}: ${values.founder2_equity || "[%]"}%

3. VESTING SCHEDULE
The equity shares issued to the Founders shall be subject to a vesting schedule of ${values.vesting_period || "[4 years]"} with a ${values.cliff_period || "[1 year]"} cliff. 
- No shares shall vest until the completion of the cliff period.
- After the cliff period, shares shall vest in equal monthly installments over the remaining vesting period.
- If a Founder leaves the Company prior to full vesting, the unvested shares will be repurchased by the Company at a nominal value.

4. ROLES AND RESPONSIBILITIES
The Founders shall devote their full time, attention, and efforts to the Company. Any outside business activities require mutual written consent.

5. INTELLECTUAL PROPERTY
Any inventions, designs, code, or intellectual property created by the Founders for the Company shall be the exclusive property of the Company.

6. GOVERNING LAW & DISPUTE RESOLUTION
This Agreement shall be governed by the laws of India. Any disputes arising out of this Agreement shall be resolved via binding arbitration in ${values.jurisdiction || "[City/State]"}, subject to the exclusive jurisdiction of its courts.

IN WITNESS WHEREOF, the Founders have executed this Agreement on the date first written above.

___________________________            ___________________________
${values.founder1_name || "[Founder 1 Name]"}                           ${values.founder2_name || "[Founder 2 Name]"}

---
⚖️ Drafted by Nyay Mitra — Startup templates must be reviewed by legal counsel.`;

    case "esop_policy":
      return `${values.startup_name ? values.startup_name.toUpperCase() : "[STARTUP NAME]"}
EMPLOYEE STOCK OPTION PLAN (ESOP) POLICY

1. PURPOSE
This Employee Stock Option Plan ("Plan") is designed to attract, retain, and motivate highly qualified employees, directors, and consultants by providing them with the opportunity to acquire an equity interest in ${values.startup_name || "[Startup Name]"} (the "Company").

2. POOL SIZE
The maximum aggregate number of shares that may be issued under this Plan shall represent ${values.total_pool_size || "[%]"}% of the fully diluted share capital of the Company, subject to adjustment by the ${values.board_approver || "Board of Directors"}.

3. ADMINISTRATION
This Plan shall be administered by the ${values.board_approver || "Board of Directors"} or a Compensation Committee appointed by the Board (the "Administrator"). The Administrator has the exclusive power to select Grantees and determine the terms of each Option.

4. VESTING SCHEDULE
Unless otherwise specified in a specific Grant Letter, Options granted under this Plan shall be subject to a ${values.vesting_period || "[4-year]"} vesting schedule with a ${values.cliff_period || "[1-year]"} cliff.
- 25% of the Options shall vest upon the 1-year anniversary of the Grant Date.
- The remaining 75% shall vest in equal monthly installments over the subsequent months.

5. EXERCISE OF OPTIONS
Vested Options may be exercised by the Grantee upon the payment of the Exercise Price. Options must be exercised within the Exercise Period of ${values.exercise_period || "[5 years]"} from the vesting date. Upon termination of employment for cause, all unvested and unexercised Options shall immediately expire.

6. LIQUIDITY EVENT / EXIT
In the event of a Change in Control (merger, acquisition, or IPO), the Administrator may determine that unvested Options shall accelerate, or be substituted with equivalent options by the acquiring entity.

This ESOP Policy has been adopted by the Company as of ${date}.

By Order of the ${values.board_approver || "Board of Directors"},

___________________________
Authorized Signatory

---
⚖️ Drafted by Nyay Mitra — Compliant with Companies Act, 2013 broad framework. Get reviewed by a CS or lawyer before Board adoption.`;

    default:
      return "";
  }
}

export default function DocumentGeneratorPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  // `docHtml` holds the full official-format HTML document string
  const [docHtml, setDocHtml] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiError, setAiError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedType = DOCUMENT_TYPES.find(d => d.id === selected);

  async function handleGenerateAI() {
    if (!selected) return;
    setAiGenerating(true); setAiError(""); setDocHtml(""); setAiGenerated(false);
    try {
      const token = localStorage.getItem("nyay_token");
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type: selected, fields: values, language: "en" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fallback) {
          // No Sarvam key — fall back to template-only (no AI body)
          setDocHtml(generateOfficialDoc(selected as DocumentType, values));
          setAiGenerated(false);
          setAiError("AI unavailable (SARVAM_API_KEY not set). Showing formatted template.");
        } else {
          setAiError(data.error || "AI generation failed. Try again.");
        }
      } else {
        // AI returned a body — inject into the official template
        setDocHtml(generateOfficialDoc(selected as DocumentType, values, data.aiBody));
        setAiGenerated(true);
      }
    } catch {
      setAiError("Network error. Showing formatted template.");
      setDocHtml(generateOfficialDoc(selected as DocumentType, values));
      setAiGenerated(false);
    } finally {
      setAiGenerating(false);
    }
  }

  function handleGenerate() {
    if (!selected) return;
    // Template-only: no AI body, fields fill the placeholders
    setDocHtml(generateOfficialDoc(selected as DocumentType, values));
    setAiGenerated(false);
  }

  function handlePrint() {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.print();
  }

  function handleDownload() {
    const blob = new Blob([docHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected}_nyaymitra_official.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(249,245,238,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/"><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer" }}>← Nyay Mitra</span></Link>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Document Generator</div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px 60px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>AI-Powered</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 500, color: "var(--ink)", lineHeight: 1.1 }}>Legal Document Generator</h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 10, maxWidth: 560, lineHeight: 1.7 }}>Generate standard legal documents in seconds. Fill in the details, we'll create the formatted draft. Always get a lawyer to review before filing.</p>
        </div>

        {/* Document type picker */}
        {!selected ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {DOCUMENT_TYPES.map(doc => (
              <button
                key={doc.id}
                onClick={() => { setSelected(doc.id); setValues({}); setDocHtml(""); }}
                style={{
                  background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16,
                  padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.25s"
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "var(--border-gold)"; el.style.boxShadow = "var(--shadow)"; el.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "var(--border-color)"; el.style.boxShadow = "none"; el.style.transform = "none"; }}
              >
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 24 }}>{selectedType?.icon}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: "var(--ink)" }}>{selectedType?.title}</div>
                  {/* Document Information Display */}
                  {selectedType?.docInfo && (
                    <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8, maxWidth: 620, lineHeight: 1.6 }}>
                      {selectedType.docInfo}
                    </div>
                  )}
                </div>
                <button onClick={() => { setSelected(null); setDocHtml(""); }} style={{ background: "var(--cream-dark)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, color: "var(--ink-muted)" }}>← Back</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {selectedType?.fields.map(field => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>
                      {FIELD_LABELS[field] || field}
                    </label>
                    {["information_needed", "claim_details", "grounds_for_bail", "complaint_details", "relief_sought", "statement_of_facts"].includes(field) ? (
                      <textarea
                        rows={3}
                        value={values[field] || ""}
                        onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))}
                        placeholder={FIELD_LABELS[field]}
                        style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: 8, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, color: "var(--ink)", background: "var(--cream)", outline: "none", resize: "vertical" }}
                        onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                        onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[field] || ""}
                        onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))}
                        placeholder={FIELD_LABELS[field]}
                        style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: 8, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, color: "var(--ink)", background: "var(--cream)", outline: "none" }}
                        onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                        onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Generate buttons */}
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  style={{ width: "100%", padding: "13px", background: aiGenerating ? "var(--ink-muted)" : "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, fontWeight: 600, cursor: aiGenerating ? "not-allowed" : "pointer" }}
                >
                  {aiGenerating ? "🤖 Generating with AI…" : "🤖 Generate with AI"}
                </button>
                <button
                  onClick={handleGenerate}
                  style={{ width: "100%", padding: "10px", background: "transparent", color: "var(--ink-muted)", border: "1px solid var(--border-color)", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                  Use Template Only
                </button>
                {aiError && (
                  <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 12, color: "#92400e" }}>⚠️ {aiError}</div>
                )}
              </div>
            </div>

            {/* Official Document Preview */}
            {docHtml && (
              <div style={{ border: "1px solid var(--border-gold)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--ivory)" }}>
                {/* Toolbar */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-gold)", display: "flex", alignItems: "center", gap: 10, background: "var(--gold-whisper)", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--forest)", flex: 1 }}>
                    {aiGenerated ? "🤖 AI-Generated — Official Format" : "📄 Official Format Template"}
                  </span>
                  <button
                    onClick={handlePrint}
                    style={{ padding: "7px 16px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    🖨️ Print / Save as PDF
                  </button>
                  <button
                    onClick={handleDownload}
                    style={{ padding: "7px 16px", background: "var(--cream-dark)", color: "var(--ink-mid)", border: "1px solid var(--border-color)", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    ⬇️ Download HTML
                  </button>
                </div>
                {/* Iframe — renders the A4 official document */}
                <iframe
                  ref={iframeRef}
                  srcDoc={docHtml}
                  style={{ width: "100%", height: 700, border: "none", background: "#e8e0d5" }}
                  title="Document Preview"
                />
                <div style={{ padding: "10px 20px", background: "rgba(166,58,30,0.06)", borderTop: "1px solid rgba(166,58,30,0.15)", fontSize: 11, color: "var(--rust)", fontFamily: "'Instrument Sans', sans-serif" }}>
                  ⚠️ DRAFT — Must be reviewed and certified by a licensed Advocate before filing. Use Ctrl+P or the Print button to save as PDF.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

