"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle, ExternalLink, Building, FileText, Users, Shield, ArrowLeft } from "lucide-react";

type TabId = "incorporation" | "agreements" | "compliance" | "ip";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "incorporation", label: "Incorporation", icon: Building },
  { id: "agreements", label: "Agreements", icon: Users },
  { id: "compliance", label: "Compliance Calendar", icon: Clock },
  { id: "ip", label: "IP & Trademark", icon: Shield },
];

const INCORPORATION_STEPS = [
  { title: "Digital Signature Certificate (DSC)", body: "All proposed directors need a Class 3 DSC from MCA-approved certifying authorities (e.g., eMudhra, Sify, NSDL). Required before DIN application.", days: "Day 1–2", status: "prereq" },
  { title: "Director Identification Number (DIN)", body: "Apply for DIN via SPICe+ form (DIN is automatically allotted during incorporation). Each proposed director needs one.", days: "During SPICe+", status: "prereq" },
  { title: "Name Reservation — RUN Form", body: "File 'Reserve Unique Name' (RUN) on MCA21 portal with up to 2 name options. MCA approves/rejects within 1–3 days. Approved name is valid for 20 days.", days: "Day 1–3", status: "step" },
  { title: "SPICe+ Form Filing", body: "Single consolidated form for: Company Incorporation + PAN + TAN + GSTIN + ESIC + EPFO + Professional Tax + Bank Account opening. File on mca.gov.in.", days: "Day 3–5", status: "step" },
  { title: "Memorandum & Articles of Association", body: "Draft your MoA (objects clause) and AoA (internal rules). For standard private limited companies, use the model forms in Schedule I of Companies Act 2013.", days: "Day 3", status: "step" },
  { title: "Certificate of Incorporation", body: "MCA issues the COI (CIN number) via email typically within 1–5 working days of SPICe+ submission. Your company legally exists from this date.", days: "Day 5–10", status: "done" },
  { title: "Post-Incorporation: Open Bank Account", body: "Use the COI + MoA/AoA + board resolution to open a current account. Fintech banks (RazorpayX, Fi Money for Business) open in 1–3 days vs traditional banks taking 7–10 days.", days: "Day 10–14", status: "step" },
  { title: "MSME / Udyam Registration", body: "Register at udyamregistration.gov.in if your investment + turnover meets MSME thresholds. Unlocks priority sector lending, govt procurement preferences, and statutory benefits.", days: "Day 14–15", status: "optional" },
];

const AGREEMENTS = [
  { title: "Co-Founder Agreement", icon: "🤝", description: "Defines roles, equity split, vesting schedule (typically 4-year vesting with 1-year cliff), and IP assignment from each founder to the company.", critical: true },
  { title: "ESOP Plan", icon: "📈", description: "Employee Stock Option Pool — typically 10–15% of authorized capital. Created by board resolution + shareholder approval. Governed by Companies Act 2013, Sec 62(1)(b).", critical: true },
  { title: "Shareholder Agreement", icon: "📋", description: "Governs investor rights: anti-dilution protection, tag-along/drag-along, right of first refusal (ROFR), board representation, and information rights.", critical: false },
  { title: "Employment Agreement", icon: "👔", description: "Offer letter + NDA + IP assignment clause + non-solicitation. Must comply with applicable state Shops & Establishments Act in addition to central labour laws.", critical: true },
  { title: "Convertible Note / SAFE", icon: "💳", description: "India-specific convertible instruments for pre-seed funding. Requires RBI approval for foreign investors under FEMA. Get a CA to structure the valuation cap and discount rate.", critical: false },
  { title: "Privacy Policy (DPDP Compliant)", icon: "🔏", description: "Mandatory under DPDP Act 2023 if your product collects any personal data. Must use plain language, describe data usage, provide deletion rights and contact details.", critical: true },
];

const COMPLIANCE_ITEMS = [
  { name: "MCA Annual Return (MGT-7)", frequency: "Annual", deadline: "Nov 29", penalty: "₹100/day", authority: "MCA" },
  { name: "Financial Statements (AOC-4)", frequency: "Annual", deadline: "Oct 29", penalty: "₹100/day", authority: "MCA" },
  { name: "GST Return GSTR-1", frequency: "Monthly/Quarterly", deadline: "11th of next month", penalty: "₹50/day + interest", authority: "GSTN" },
  { name: "GST Return GSTR-3B", frequency: "Monthly/Quarterly", deadline: "20th of next month", penalty: "₹50/day + interest", authority: "GSTN" },
  { name: "TDS Filing (24Q/26Q)", frequency: "Quarterly", deadline: "31st of following month", penalty: "₹200/day + 1.5%/mo", authority: "IT Dept" },
  { name: "PF Contribution (EPFO)", frequency: "Monthly", deadline: "15th of next month", penalty: "Prosecution risk", authority: "EPFO" },
  { name: "ESI Contribution", frequency: "Monthly", deadline: "15th of next month", penalty: "₹5,000 per offence", authority: "ESIC" },
  { name: "Director KYC (DIR-3 KYC)", frequency: "Annual", deadline: "Sep 30", penalty: "₹5,000 per director", authority: "MCA" },
  { name: "Income Tax Return (ITR-6)", frequency: "Annual", deadline: "Oct 31 (audit) / Jul 31", penalty: "₹5,000–10,000", authority: "IT Dept" },
  { name: "StartupIndia Recognition", frequency: "One-time", deadline: "ASAP", penalty: "Miss tax exemptions (80-IAC)", authority: "DPIIT" },
];

const IP_GUIDE = [
  { title: "Trademark Class Search", description: "Search the IP India Trademark Registry at ipindiaonline.gov.in BEFORE filing. Use the Nice Classification (45 classes). A lawyer can do a clearance search for ₹3,000–5,000.", icon: "™️" },
  { title: "Trademark Filing", description: "File Form TM-A online at ipindiaonline.gov.in. Government fee: ₹4,500 for individuals/startups, ₹9,000 for others per class. Examination within 12–18 months.", icon: "📝" },
  { title: "Patent — Provisional Specification", description: "File a Provisional Application at the Indian Patent Office to secure a priority date while your complete specification is being prepared. Valid for 12 months. Fee: ₹1,600 (natural person).", icon: "🔬" },
  { title: "Copyright Registration", description: "Not mandatory in India (copyright exists automatically with creation) but registration is useful as evidence. Form XIV on copyright.gov.in takes a few months.", icon: "©️" },
  { title: "Trade Secret Protection", description: "No separate Trade Secrets Act in India yet — protect via confidentiality agreements (NDAs), restricted data access policies, and employment contracts with IP assignment clauses.", icon: "🔐" },
];

export default function StartupHubPage() {
  const [activeTab, setActiveTab] = useState<TabId>("incorporation");

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--forest)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "0 clamp(16px,4vw,48px)", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
          <ArrowLeft size={14} /> Home
        </Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ivory)" }}>Startup Legal Hub</div>
      </nav>

      <div style={{ padding: "40px clamp(16px,4vw,48px)", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Startup Legal Hub</h1>
        <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 640 }}>Everything an early-stage founder needs — incorporation guide, compliance checklist, and key agreement templates. All DPDP and Companies Act 2013 compliant.</p>
        
        <div style={{ marginTop: 24, padding: "12px 16px", background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: 12, fontSize: 14, color: "#854d0e", display: "flex", gap: 8, alignItems: "center" }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>All AI-generated templates are marked <strong>DRAFT — FOR LAWYER REVIEW</strong>. Book a 30-minute lawyer review before signing.</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 40, borderBottom: "1px solid var(--border-color)", overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "none", border: "none", cursor: "pointer",
                borderBottom: isActive ? "2px solid var(--forest)" : "2px solid transparent",
                color: isActive ? "var(--forest)" : "var(--ink-muted)",
                fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", transition: "all 0.2s"
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "incorporation" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
            <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)" }}>Step-by-step guide to incorporating a Private Limited Company in India via MCA21 SPICe+</p>
            <a 
              href="https://www.mca.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ padding: "8px 16px", border: "1.5px solid var(--border-color)", borderRadius: 8, textDecoration: "none", color: "var(--ink)", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Open MCA21 <ExternalLink size={14} />
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 16, borderLeft: "2px solid var(--border-color)" }}>
            {INCORPORATION_STEPS.map((step, i) => {
              const statusColor = step.status === "done" ? "#059669" : step.status === "prereq" ? "#d97706" : step.status === "optional" ? "var(--ink-muted)" : "var(--forest)";
              const statusBg = step.status === "done" ? "rgba(5, 150, 105, 0.1)" : step.status === "prereq" ? "rgba(217, 119, 6, 0.1)" : step.status === "optional" ? "var(--border-color)" : "rgba(10, 43, 29, 0.1)";

              return (
                <div key={i} style={{ position: "relative", paddingLeft: 24 }}>
                  <div style={{ position: "absolute", left: -30, top: 4, width: 28, height: 28, borderRadius: "50%", background: statusBg, border: `1.5px solid ${statusColor}`, color: statusColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                    {step.status === "done" ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  
                  <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{step.title}</h3>
                          {step.status === "optional" && <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, padding: "2px 8px", background: "var(--cream)", border: "1px solid var(--border-color)", borderRadius: 12, color: "var(--ink-muted)" }}>Optional</span>}
                          {step.status === "prereq" && <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, padding: "2px 8px", background: "rgba(217, 119, 6, 0.1)", borderRadius: 12, color: "#b45309" }}>Prerequisite</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)", lineHeight: 1.5 }}>{step.body}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 8px", border: "1px solid var(--border-color)", borderRadius: 8, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                        <Clock size={12} /> {step.days}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "agreements" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <p style={{ margin: "0 0 16px 0", fontSize: 15, color: "var(--ink-muted)" }}>Key legal agreements every startup needs. Use the AI Document Generator to create DRAFT versions.</p>
          
          {AGREEMENTS.map((ag, i) => (
            <div key={i} style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderLeft: `4px solid ${ag.critical ? "var(--forest)" : "var(--border-color)"}`, borderRadius: 12, padding: 24, display: "flex", gap: 20, alignItems: "flex-start" }}>
              <span style={{ fontSize: 32 }}>{ag.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{ag.title}</h3>
                  {ag.critical && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "rgba(10, 43, 29, 0.1)", borderRadius: 12, color: "var(--forest)" }}>ESSENTIAL</span>}
                </div>
                <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)", lineHeight: 1.5 }}>{ag.description}</p>
              </div>
              <Link 
                href="/documents" 
                style={{ padding: "8px 16px", border: "1.5px solid var(--border-color)", borderRadius: 8, textDecoration: "none", color: "var(--ink)", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
              >
                <FileText size={14} /> Draft
              </Link>
            </div>
          ))}
        </div>
      )}

      {activeTab === "compliance" && (
        <div>
          <p style={{ margin: "0 0 24px 0", fontSize: 15, color: "var(--ink-muted)" }}>Key compliance obligations for a Private Limited Company. Missing deadlines triggers heavy penalties.</p>
          
          <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: 12 }}>
            <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--cream)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--ink-muted)", fontSize: 14 }}>Compliance</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--ink-muted)", fontSize: 14 }}>Frequency</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--ink-muted)", fontSize: 14 }}>Deadline</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "#b91c1c", fontSize: 14 }}>Penalty</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--ink-muted)", fontSize: 14 }}>Authority</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_ITEMS.map((item, i) => (
                  <tr key={i} style={{ borderBottom: i === COMPLIANCE_ITEMS.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{item.name}</td>
                    <td style={{ padding: "16px 20px", color: "var(--ink-mid)", fontSize: 14 }}>{item.frequency}</td>
                    <td style={{ padding: "16px 20px", color: "var(--ink)", fontSize: 14, fontWeight: 500 }}>{item.deadline}</td>
                    <td style={{ padding: "16px 20px", color: "#b91c1c", fontSize: 13, fontWeight: 600 }}>{item.penalty}</td>
                    <td style={{ padding: "16px 20px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", border: "1px solid var(--border-color)", borderRadius: 8, color: "var(--ink-muted)" }}>{item.authority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(10, 43, 29, 0.05)", border: "1px solid rgba(10, 43, 29, 0.1)", borderRadius: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <CheckCircle2 color="var(--forest)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 15, color: "var(--ink-mid)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--ink)" }}>Pro tip:</strong> Register on StartupIndia (DPIIT) to get a 3-year income tax holiday under Sec 80-IAC, self-certification under 9 labour laws, and fast-track IP processing.
              <a href="https://www.startupindia.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "none", marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                Apply now <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ip" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <p style={{ margin: "0 0 16px 0", fontSize: 15, color: "var(--ink-muted)" }}>Protect your startup's intellectual property proactively — before raising funding or hiring team members.</p>
          
          {IP_GUIDE.map((item, i) => (
            <div key={i} style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, display: "flex", gap: 20 }}>
              <span style={{ fontSize: 32 }}>{item.icon}</span>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)", lineHeight: 1.6 }}>{item.description}</p>
              </div>
            </div>
          ))}

          <a 
            href="https://ipindiaonline.gov.in/tmrpublicsearch/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ marginTop: 16, padding: "14px 24px", border: "1.5px solid var(--border-color)", background: "var(--cream)", borderRadius: 10, textDecoration: "none", color: "var(--ink)", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            🔍 Search Trademark Registry <ExternalLink size={16} />
          </a>
        </div>
      )}
      </div>
    </div>
  );
}
