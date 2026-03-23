import { useState } from "react";
import { Link } from "wouter";

const DOCUMENT_TYPES = [
  {
    id: "rti",
    icon: "📋",
    title: "RTI Application",
    subtitle: "Right to Information Act 2005",
    desc: "Request information from any government authority",
    fields: ["authority", "subject", "information_needed", "applicant_name", "applicant_address"],
  },
  {
    id: "legal_notice",
    icon: "📜",
    title: "Legal Notice",
    subtitle: "Demand / Cease & Desist",
    desc: "Send a formal legal notice before filing a case",
    fields: ["notice_to", "notice_to_address", "your_name", "your_address", "claim_details", "demand", "timeline"],
  },
  {
    id: "bail_petition",
    icon: "⚖️",
    title: "Bail Application",
    subtitle: "Under Section 436 / 437 CrPC",
    desc: "Apply for regular or anticipatory bail",
    fields: ["accused_name", "fir_number", "police_station", "charges", "grounds_for_bail", "surety_name"],
  },
  {
    id: "complaint",
    icon: "📢",
    title: "Consumer Complaint",
    subtitle: "Consumer Protection Act 2019",
    desc: "File a complaint against a defective product or service",
    fields: ["opposite_party", "opposite_party_address", "your_name", "your_address", "complaint_details", "relief_sought", "purchase_date"],
  },
  {
    id: "affidavit",
    icon: "🖊️",
    title: "General Affidavit",
    subtitle: "Notarised sworn statement",
    desc: "Generate a standard affidavit template",
    fields: ["deponent_name", "deponent_age", "deponent_address", "statement_of_facts"],
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

    default:
      return "";
  }
}

export default function DocumentGeneratorPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedType = DOCUMENT_TYPES.find(d => d.id === selected);

  function handleGenerate() {
    if (!selected) return;
    setGenerated(generateDocument(selected, values));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([generated], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected}_nyaymitra.txt`;
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
                onClick={() => { setSelected(doc.id); setValues({}); setGenerated(""); }}
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
          <div style={{ display: "grid", gridTemplateColumns: generated ? "1fr 1fr" : "1fr", gap: 24 }}>
            {/* Form */}
            <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 24 }}>{selectedType?.icon}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: "var(--ink)" }}>{selectedType?.title}</div>
                </div>
                <button onClick={() => { setSelected(null); setGenerated(""); }} style={{ background: "var(--cream-dark)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, color: "var(--ink-muted)" }}>← Back</button>
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

              <button
                onClick={handleGenerate}
                style={{ marginTop: 24, width: "100%", padding: "13px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
              >
                ✍️ Generate Document
              </button>
            </div>

            {/* Preview */}
            {generated && (
              <div style={{ background: "var(--ivory)", border: "1px solid var(--border-gold)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-gold)", display: "flex", alignItems: "center", gap: 12, background: "var(--gold-whisper)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--forest)", flex: 1 }}>Document Draft</span>
                  <button onClick={handleCopy} style={{ padding: "6px 14px", background: copied ? "var(--teal)" : "var(--cream-dark)", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", color: copied ? "white" : "var(--ink-mid)", fontWeight: 600 }}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload} style={{ padding: "6px 14px", background: "var(--forest)", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", color: "var(--gold-pale)", fontWeight: 600 }}>Download</button>
                </div>
                <pre style={{ flex: 1, padding: 24, margin: 0, fontFamily: "'Instrument Sans',sans-serif", fontSize: 12.5, lineHeight: 1.8, color: "var(--ink-mid)", whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: 600 }}>
                  {generated}
                </pre>
                <div style={{ padding: "12px 24px", background: "var(--rust-light)", borderTop: "1px solid rgba(166,58,30,0.15)", fontSize: 11, color: "var(--rust)" }}>
                  ⚠️ This is a template draft only. Consult a qualified lawyer before filing.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
