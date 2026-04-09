"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, AlertTriangle, Phone, FileText, ChevronRight } from "lucide-react";

type ActKey = "ipc" | "crpc" | "rti" | "consumer" | "dv" | "pocso";

interface ActInfo {
  key: ActKey;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  summary: string;
  rights: { title: string; description: string }[];
}

const ACTS: ActInfo[] = [
  {
    key: "ipc",
    name: "IPC",
    fullName: "Indian Penal Code 1860",
    icon: "⚖️",
    color: "var(--red)",
    summary: "India's primary criminal code defining offences and punishments. Applies to all citizens and even offences committed outside India in some cases.",
    rights: [
      { title: "Right to Know the Charge", description: "Section 50 CrPC: You must be told the full reason for your arrest immediately." },
      { title: "Right to Legal Counsel", description: "Article 22(1): You have the right to consult and be defended by a lawyer of your choice from the moment of arrest." },
      { title: "Right Against Self-Incrimination", description: "Article 20(3): You cannot be compelled to be a witness against yourself." },
      { title: "Right to Bail", description: "For bailable offences, bail is a right not a privilege. For non-bailable, apply before a magistrate." },
      { title: "Produced Before Magistrate in 24 Hours", description: "Section 57 CrPC: Police must produce you before the nearest magistrate within 24 hours of arrest (excludes travel time)." },
    ],
  },
  {
    key: "crpc",
    name: "CrPC",
    fullName: "Code of Criminal Procedure 1973 (BNSS 2023)",
    icon: "🔏",
    color: "var(--purple)",
    summary: "Governs the procedural aspects of criminal law — arrest, bail, trial, and sentencing. Recently replaced/updated by BNSS 2023 (Bharatiya Nagarik Suraksha Sanhita).",
    rights: [
      { title: "Right to File a Zero FIR", description: "You can file an FIR at ANY police station irrespective of where the crime occurred. The police MUST register it and send it to the appropriate station." },
      { title: "Right to Copy of FIR", description: "Section 154: You are entitled to a free copy of the FIR immediately after it is registered." },
      { title: "Section 436A — Default Bail", description: "If you have been an undertrial for half the maximum sentence of the alleged offence, you are entitled to bail as a right." },
      { title: "Right to Speedy Trial", description: "Article 21 includes the right to speedy justice. Undue delay in trial can be challenged by filing a writ of habeas corpus." },
      { title: "Section 41A Notice", description: "For offences punishable up to 7 years, police must issue a notice to appear before arresting. Only if you don't comply can they arrest without warrant." },
    ],
  },
  {
    key: "rti",
    name: "RTI",
    fullName: "Right to Information Act 2005",
    icon: "📂",
    color: "var(--blue)",
    summary: "Every Indian citizen can demand information from any government body within 30 days. One of India's most powerful citizen empowerment tools.",
    rights: [
      { title: "File RTI for Any Government Information", description: "Write an RTI application with ₹10 court fee to the Public Information Officer (PIO) of the relevant government department." },
      { title: "Response in 30 Days", description: "The PIO must respond within 30 days (or 48 hours if the matter concerns life and liberty)." },
      { title: "First Appeal", description: "If unsatisfied, appeal within 30 days to the First Appellate Authority (usually a senior officer in the same department). Decision in 30–45 days." },
      { title: "Second Appeal — CIC/SIC", description: "Appeal to Central/State Information Commission within 90 days of First AA's decision. Commissioners can impose ₹25,000 penalty on errant PIOs." },
      { title: "Exemptions", description: "Certain categories are exempt: Cabinet papers, national security information, info that prejudices the sovereignty of India, personal information with no public interest." },
    ],
  },
  {
    key: "consumer",
    name: "Consumer Protection",
    fullName: "Consumer Protection Act 2019",
    icon: "🛒",
    color: "var(--forest)",
    summary: "Protects buyers of goods and services from unfair trade practices, defective products, and overcharging. Covers e-commerce platforms explicitly since 2019.",
    rights: [
      { title: "Right to Safety", description: "Protection against goods and services hazardous to life and property." },
      { title: "Right to Information", description: "Right to be informed about quality, quantity, potency, purity, standard, and price of goods." },
      { title: "Right to Compensation", description: "Compensation for deficient services or defective goods, including unfair trade practices." },
      { title: "File Complaint Online", description: "e-DAAKHIL (edaakhil.nic.in) allows online filing. District Consumer Forum handles claims up to ₹50 lakh. State Commission up to ₹2 crore. National Commission (NCDRC) above ₹2 crore." },
      { title: "No Lawyer Required", description: "Consumer forums are designed to allow citizens to file and argue their own complaints without a lawyer. Filing fees are nominal (₹200 for claims up to ₹5 lakh)." },
    ],
  },
  {
    key: "dv",
    name: "Domestic Violence",
    fullName: "Protection of Women from DV Act 2005",
    icon: "🏠",
    color: "var(--pink)",
    summary: "Provides civil remedies to women facing domestic violence. Covers not just physical violence but emotional, verbal, economic, and sexual abuse.",
    rights: [
      { title: "Right to Reside in Shared Household", description: "Section 17: You have the right to live in the shared household regardless of your ownership interest in it." },
      { title: "Protection Order", description: "Courts can grant a protection order prohibiting the abuser from committing acts of domestic violence, contacting, or coming near you." },
      { title: "Maintenance/Monetary Relief", description: "Courts can direct the abuser to pay maintenance for you and your children, and to cover medical expenses and loss of earnings." },
      { title: "Custody Order", description: "Temporary custody of children can be granted under PWDVA while your case is pending." },
      { title: "Protection Officer", description: "Every district has a Protection Officer appointed under the Act. They can help you file the Domestic Incident Report and access services — free of charge." },
    ],
  },
  {
    key: "pocso",
    name: "POCSO",
    fullName: "Protection of Children from Sexual Offences Act 2012",
    icon: "🛡️",
    color: "var(--orange)",
    summary: "Protects children (under 18) from sexual abuse, harassment, and exploitation. Creates child-friendly investigation and trial procedures.",
    rights: [
      { title: "Mandatory Reporting", description: "Section 19: Every person who knows or believes that a POCSO offence is being committed MUST report it to the police or the Special Juvenile Police Unit (SJPU). Failure to report is an offence." },
      { title: "Special Courts", description: "POCSO cases are tried in designated Special Courts. Trial must be completed within 1 year (though often delayed in practice)." },
      { title: "Statement Recorded by Woman Officer", description: "Statement of a child victim must be recorded by a woman police officer, and the child cannot be detained in the police station." },
      { title: "Identity Protection", description: "Identity of the child victim must never be disclosed by media or anyone. Violation is a criminal offence." },
      { title: "Compensation", description: "Courts can award interim and final compensation from the State's Victim Compensation Fund under Section 33(8) and Section 357B CrPC." },
    ],
  },
];

const FIR_STEPS = [
  { step: 1, heading: "Go to Any Police Station", body: "You can file an FIR at ANY police station (Zero FIR) regardless of jurisdiction.  The officer in charge CANNOT refuse." },
  { step: 2, heading: "Narrate the Incident", body: "Describe what happened in detail — date, time, location, accused's description, witnesses present. Be factual and specific." },
  { step: 3, heading: "Get Your Free Copy", body: "After the FIR is registered, you are entitled to a free copy immediately under Section 154(2) CrPC. Insist on it." },
  { step: 4, heading: "If Police Refuse", body: "If police refuse to file the FIR, send a written complaint by registered post to the Superintendent of Police. You can also file a private complaint directly with the Magistrate." },
  { step: 5, heading: "Track Your Case", body: "Use the eCourts app or ecourts.gov.in to track your case number once it reaches court. Keep all documents safely." },
];

export default function KnowYourRightsPage() {
  const [activeAct, setActiveAct] = useState<ActKey | null>(null);
  const [activeTab, setActiveTab] = useState<"acts" | "fir">("acts");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = ACTS.filter(a =>
    !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const detail = activeAct ? ACTS.find(a => a.key === activeAct) : null;

  return (
    <div style={{ padding: "40px 24px", maxWidth: 1000, margin: "0 auto", fontFamily: "'Instrument Sans', sans-serif" }}>
      
      {activeAct && (
        <button 
          onClick={() => setActiveAct(null)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--ink-muted)", cursor: "pointer", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: 0, marginBottom: 24, transition: "color 0.2s" }}
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
      )}

      {!activeAct ? (
        <>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Know Your Rights</h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 640 }}>Plain-language explainers on Indian laws. Understand your fundamental and statutory rights clearly before talking to a lawyer.</p>
          </div>

          <div style={{ display: "flex", gap: 24, marginBottom: 32, borderBottom: "1px solid var(--border-color)" }}>
            <button
              onClick={() => setActiveTab("acts")}
              style={{ padding: "12px 0", background: "none", border: "none", borderBottom: activeTab === "acts" ? "2px solid var(--forest)" : "2px solid transparent", color: activeTab === "acts" ? "var(--forest)" : "var(--ink-muted)", cursor: "pointer", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
            >
              <FileText size={18} /> Laws & Acts
            </button>
            <button
              onClick={() => setActiveTab("fir")}
              style={{ padding: "12px 0", background: "none", border: "none", borderBottom: activeTab === "fir" ? "2px solid var(--forest)" : "2px solid transparent", color: activeTab === "fir" ? "var(--forest)" : "var(--ink-muted)", cursor: "pointer", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
            >
              <AlertTriangle size={18} /> FIR Assistant
            </button>
          </div>

          {activeTab === "acts" && (
            <>
              <div style={{ position: "relative", marginBottom: 32, maxWidth: 400 }}>
                <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)" }} />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="Search an act (e.g. RTI, Consumer)" 
                  style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "1.5px solid var(--border-color)", background: "var(--cream)", fontSize: 15, fontFamily: "'Instrument Sans', sans-serif", outline: "none", boxSizing: "border-box" }} 
                  onFocus={e => e.target.style.borderColor = "var(--gold)"}
                  onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {filtered.map(act => (
                  <div 
                    key={act.key} 
                    onClick={() => setActiveAct(act.key)}
                    style={{ background: "var(--ivory)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)"; }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 16 }}>{act.icon}</div>
                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px 0" }}>{act.name}</h3>
                      <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: 0 }}>{act.fullName}</p>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-mid)", lineHeight: 1.5, margin: "0 0 20px 0", flex: 1 }}>{act.summary.length > 80 ? act.summary.substring(0, 80) + "..." : act.summary}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", background: "var(--cream)", border: "1px solid var(--border-color)", borderRadius: 20, color: act.color }}>{act.rights.length} Rights Covered</span>
                      <ChevronRight size={18} color="var(--ink-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "fir" && (
            <div style={{ maxWidth: 680 }}>
              <div style={{ padding: 16, background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: 12, display: "flex", gap: 12, marginBottom: 32, alignItems: "flex-start" }}>
                <AlertTriangle size={20} color="#eab308" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 14, color: "#854d0e", lineHeight: 1.5 }}>
                  In an emergency, call <strong>100</strong> (Police), <strong>1091</strong> (Women in distress), or <strong>112</strong> (National Emergency). This guide is for when you are safe and ready to file a formal complaint.
                </p>
              </div>

              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: "var(--ink)", marginBottom: 24 }}>How to File an FIR</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {FIR_STEPS.map(step => (
                  <div key={step.step} style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, display: "flex", gap: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--cream)", border: "1px solid var(--gold)", color: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                      {step.step}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", margin: "0 0 8px 0" }}>{step.heading}</h3>
                      <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)", lineHeight: 1.5 }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
                <Link href="/chat" style={{ padding: "14px 28px", background: "var(--forest)", color: "var(--gold-pale)", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  Ask AI Legal Help
                </Link>
                <a href="tel:100" style={{ padding: "14px 28px", background: "var(--ivory)", border: "1.5px solid var(--border-color)", color: "var(--ink)", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Phone size={18} /> Call Police (100)
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        detail && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 48 }}>{detail.icon}</div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: detail.color }}>{detail.name}</span>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "var(--ink)", margin: "4px 0 0 0" }}>{detail.fullName}</h1>
              </div>
            </div>
            
            <div style={{ background: "var(--cream)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, marginBottom: 40 }}>
              <p style={{ margin: 0, fontSize: 16, color: "var(--ink-mid)", lineHeight: 1.6 }}>{detail.summary}</p>
            </div>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "var(--ink)", marginBottom: 20 }}>Your Rights Under This Act</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {detail.rights.map((r, i) => (
                <div key={i} style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--forest)" }}>✓</span> {r.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)", lineHeight: 1.6 }}>{r.description}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40, padding: 24, textAlign: "center", background: "rgba(10, 43, 29, 0.03)", borderRadius: 16, border: "1px solid rgba(10, 43, 29, 0.1)" }}>
              <p style={{ margin: 0, fontSize: 15, color: "var(--ink-muted)" }}>
                Need more specific legal guidance?{" "}
                <Link href="/chat" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "none" }}>Chat with AI Legal Assistant</Link> or{" "}
                <Link href="/nalsa-check" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "none" }}>check NALSA eligibility for free legal aid</Link>.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
