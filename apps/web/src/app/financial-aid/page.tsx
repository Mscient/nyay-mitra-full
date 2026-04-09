"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";

type ModuleId = "sarfaesi" | "cheque" | "taxnotice" | "banking" | "insurance" | "gst";

interface Module {
  id: ModuleId;
  title: string;
  subtitle: string;
  icon: string;
  tag: string;
  tagColor: string;
}

const MODULES: Module[] = [
  { id: "sarfaesi", title: "SARFAESI & DRT", subtitle: "Bank action on secured loans", icon: "🏦", tag: "Debt Recovery", tagColor: "#b45309" },
  { id: "cheque", title: "Cheque Bounce — Sec 138", subtitle: "NI Act demand notice & court process", icon: "🧾", tag: "Criminal", tagColor: "#b91c1c" },
  { id: "taxnotice", title: "Income Tax Notices", subtitle: "Sec 143(1), 148, 263 reply guide", icon: "📋", tag: "Tax Dispute", tagColor: "#1d4ed8" },
  { id: "banking", title: "Banking Ombudsman", subtitle: "RBI CMS complaint for bank grievances", icon: "⚖️", tag: "Banking", tagColor: "#7e22ce" },
  { id: "insurance", title: "Insurance Disputes", subtitle: "IRDAI Bima Bharosa grievance portal", icon: "🛡️", tag: "Insurance", tagColor: "#047857" },
  { id: "gst", title: "GST Disputes", subtitle: "Show-cause notice reply & GSTAT appeal", icon: "🧮", tag: "Tax", tagColor: "#0f766e" },
];

const MODULE_CONTENT: Record<ModuleId, { steps: { heading: string; body: string; tip?: string }[]; portal?: { label: string; url: string } }> = {
  sarfaesi: {
    steps: [
      { heading: "What is SARFAESI?", body: "The Securitisation and Reconstruction of Financial Assets and Enforcement of Securities Interests Act (SARFAESI) 2002 allows banks to recover non-performing assets (NPA) without going to court." },
      { heading: "Day 0 — Demand Notice", body: "After classifying the loan as NPA, the bank sends a 60-day demand notice under Section 13(2) of SARFAESI. You have 60 days to repay or dispute the notice." },
      { heading: "Responding to the Notice", body: "You can file a written objection to the bank within 15 days. The bank must provide a reasoned reply within 15 days of receiving your objection. Keep all correspondence in writing." },
      { heading: "After 60 days — Possession Notice", body: "If the bank proceeds, they send a symbolic possession notice and then apply for physical possession. You can challenge this at the Debt Recovery Tribunal (DRT) under Section 17.", tip: "File DRT application within 45 days of the possession notice. Beyond this window, challenging becomes harder." },
      { heading: "DRT Application", body: "File a petition before the relevant DRT. You must deposit 25% of the outstanding loan amount or the disputed amount as per the court's direction before the DRT can entertain the application." },
      { heading: "DRAT Appeal", body: "If DRT order is not in your favour, appeal before Debt Recovery Appellate Tribunal (DRAT) within 30 days. Deposit 50% of the debt as security (court has discretion to reduce this)." },
    ],
    portal: { label: "Debt Recovery Tribunal Portal", url: "https://drt.gov.in/" },
  },
  cheque: {
    steps: [
      { heading: "Section 138 — When it applies", body: "When a cheque is returned by the bank for 'insufficient funds' or 'payment stopped by drawer', the payee can initiate criminal action under Section 138 of the Negotiable Instruments Act 1881." },
      { heading: "Step 1 — Receive Dishonour Memo", body: "Collect the bank's cheque return memo clearly stating the reason for dishonour. This is your starting document." },
      { heading: "Step 2 — Send Legal Demand Notice", body: "Within 30 days of receiving the dishonour memo, send a registered post demand notice to the drawer's address demanding payment within 15 days.", tip: "Send by both registered post AND speed post. Keep the postal receipt and track delivery. Courts require proof of delivery." },
      { heading: "Step 3 — Wait 15 Days", body: "Give the drawer 15 days to pay. If they pay, the matter ends. If not, you can proceed with filing a complaint." },
      { heading: "Step 4 — File Complaint in Magistrate Court", body: "Within 30 days of expiry of the 15-day notice period, file a criminal complaint before the Judicial Magistrate First Class (JMFC) in the area where the cheque was presented at the bank." },
      { heading: "Punishment on Conviction", body: "Under Section 138 NI Act, conviction carries imprisonment up to 2 years OR fine up to twice the cheque amount OR both." },
    ],
  },
  taxnotice: {
    steps: [
      { heading: "Section 143(1) — Intimation Notice", body: "This is an automated intimation from CPC Bengaluru after processing your return. It's NOT a scrutiny notice. It may demand additional tax based on mismatches or arithmetic errors.", tip: "If you agree with the demand, pay it. If not, file a rectification application under Section 154 within 30 days." },
      { heading: "Section 148 — Escaped Income Notice", body: "The tax officer believes income has escaped assessment and wants to reopen your case. The notice must be issued within 3 years from end of assessment year (10 years if escaped income > ₹50 lakh)." },
      { heading: "Responding to Section 148", body: "Within 30 days of receipt, file your return for the year mentioned in the notice. You can also raise jurisdictional objections. Submit all supporting documents proactively." },
      { heading: "Section 263 — Revision by PCIT", body: "Principal Commissioner of Income Tax can revise an assessment order if it is 'erroneous and prejudicial to the interest of revenue'. You have the right to be heard before such revision." },
      { heading: "How to File A Reply", body: "Log in to incometax.gov.in → 'e-Proceedings' → Select the notice → Upload your point-by-point reply with supporting documents (bank statements, invoices, Form 26AS/AIS)." },
      { heading: "If Not Satisfied — Appeal to CIT(A)", body: "Appeal to Commissioner of Income Tax (Appeals) within 30 days of receiving the assessment order. File Form 35 online at the IT portal." },
    ],
    portal: { label: "Income Tax e-Filing Portal", url: "https://www.incometax.gov.in/" },
  },
  banking: {
    steps: [
      { heading: "When to use Banking Ombudsman", body: "First complain to your bank's grievance officer. If not resolved within 30 days OR if you are dissatisfied with the response, approach the Banking Ombudsman (now called Reserve Bank — Integrated Ombudsman Scheme 2021)." },
      { heading: "Covered Complaints", body: "Unauthorized transactions, mis-selling of insurance/mutual funds, excessive charges, failed ATM transactions, non-credit of funds, delay in loan processing, and more." },
      { heading: "File Complaint at RBI CMS", body: "Visit cms.rbi.org.in. Select your bank and branch. Describe the grievance clearly with all reference numbers, dates, and transaction amounts.", tip: "Attach all evidence: SMS alerts, emails from bank, rejection letters. Without evidence, resolution is difficult." },
      { heading: "Timeline", body: "The Ombudsman aims to resolve complaints within 30 days. Complex cases may take up to 3 months. You can track your complaint status on the CMS portal." },
      { heading: "Compensation", body: "Ombudsman can direct the bank to pay compensation up to ₹20 lakh for loss suffered, plus ₹1 lakh for harassment and mental agony." },
      { heading: "If Unsatisfied", body: "You can appeal to the Appellate Authority (Deputy Governor, RBI) within 30 days of the Ombudsman's decision." },
    ],
    portal: { label: "RBI Complaint Management System", url: "https://cms.rbi.org.in/" },
  },
  insurance: {
    steps: [
      { heading: "Step 1 — Complain to the Insurer", body: "Contact your insurance company's grievance officer first. They must respond within 14 days under IRDAI guidelines. Get a written acknowledgement with a reference number." },
      { heading: "Step 2 — IRDAI Bima Bharosa", body: "If unresolved after 14 days or unsatisfied response, file a complaint at bimabharosa.irdai.gov.in. This is IRDAI's integrated grievance portal covering all insurers." },
      { heading: "Step 3 — Insurance Ombudsman", body: "For disputes up to ₹50 lakh involving personal lines of insurance (life, health, motor), you can approach the Insurance Ombudsman in your jurisdiction.", tip: "The Insurance Ombudsman is free of charge and resolves claims within 3 months. Highly recommended before going to consumer court." },
      { heading: "Coverage Areas", body: "Claim rejection or partial payment, premium disputes, delay in claim settlement, policy terms interpretation, mis-selling of insurance products." },
      { heading: "Consumer Court", body: "If the Ombudsman's decision is not acceptable, you can file a consumer complaint under the Consumer Protection Act 2019 in the relevant consumer forum." },
    ],
    portal: { label: "IRDAI Bima Bharosa Portal", url: "https://bimabharosa.irdai.gov.in/" },
  },
  gst: {
    steps: [
      { heading: "Receiving a Show-Cause Notice (SCN)", body: "GSTN officers issue SCNs for tax evasion, ITC mismatch, wrong classification, or non-filing. You have 30 days to reply. Request an extension in writing if needed." },
      { heading: "Drafting the SCN Reply", body: "Reply point-by-point to each allegation. Submit reconciliation statements, GSTR-2A/2B vs purchase register, and supporting invoices. Avoid admitting liability on contested points.", tip: "Never respond informally. All replies must be filed through the GST portal under 'User Services → Notices → Reply'." },
      { heading: "Personal Hearing", body: "Request a personal hearing. You have the right to present your case before the officer. Bring all documents and your CA or legal representative." },
      { heading: "Order in Original (OIO)", body: "After the hearing, the officer passes an Order in Original. If you disagree, you can appeal within 3 months." },
      { heading: "Appeal to Appellate Authority", body: "File GST APL-01 form within 3 months of OIO. Deposit 10% of the disputed tax (or as directed). The Appellate Authority has 1 year to decide." },
      { heading: "GSTAT Appeal", body: "Appeal to the GST Appellate Tribunal within 3 months of the Appellate Authority's order. GSTAT is functional in most states from 2024 onwards." },
    ],
    portal: { label: "GST Portal", url: "https://www.gst.gov.in/" },
  },
};

export default function FinancialAidPage() {
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  const active = activeModule ? MODULE_CONTENT[activeModule] : null;
  const activeInfo = activeModule ? MODULES.find(m => m.id === activeModule) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--forest)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "0 clamp(16px,4vw,48px)", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
          <ArrowLeft size={14} /> Home
        </Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ivory)" }}>Financial Legal Aid</div>
      </nav>

      <div style={{ padding: "40px clamp(16px,4vw,48px)", maxWidth: 1000, margin: "0 auto" }}>
      
      {activeModule && (
        <button 
          onClick={() => setActiveModule(null)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--ink-muted)", cursor: "pointer", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: 0, marginBottom: 24, transition: "color 0.2s" }}
        >
          <ArrowLeft size={16} /> Back to Topics
        </button>
      )}

      {!activeModule ? (
        <>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Financial Legal Aid</h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 640 }}>Step-by-step legal guidance for financial disputes — debt recovery, tax notices, banking complaints, and more. Select a topic to get started.</p>
            
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: 12, fontSize: 14, color: "#854d0e" }}>
              ⚠️ <strong>Disclaimer:</strong> This is legal information, not legal advice. Always consult a qualified lawyer or CA for decisions affecting your rights or finances.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {MODULES.map(mod => (
              <div 
                key={mod.id} 
                onClick={() => setActiveModule(mod.id)}
                style={{ background: "var(--ivory)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{mod.icon}</div>
                <div style={{ marginBottom: 12, flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px 0" }}>{mod.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--ink-mid)", margin: 0, lineHeight: 1.5 }}>{mod.subtitle}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", background: `${mod.tagColor}1A`, border: `1px solid ${mod.tagColor}33`, borderRadius: 20, color: mod.tagColor }}>{mod.tag}</span>
                  <ChevronRight size={18} color="var(--ink-muted)" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        activeInfo && active && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
              <div style={{ fontSize: 48 }}>{activeInfo.icon}</div>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "var(--ink)", margin: "0 0 4px 0" }}>{activeInfo.title}</h1>
                <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)" }}>{activeInfo.subtitle}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingLeft: 12, borderLeft: "2px dashed var(--border-color)" }}>
              {active.steps.map((step, i) => (
                <div key={i} style={{ position: "relative", paddingLeft: 24 }}>
                  <div style={{ position: "absolute", left: -14, top: 4, width: 24, height: 24, borderRadius: "50%", background: "var(--cream)", border: "2px solid var(--forest)", color: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", margin: "0 0 10px 0" }}>{step.heading}</h3>
                    <p style={{ margin: 0, fontSize: 15, color: "var(--ink-mid)", lineHeight: 1.6 }}>{step.body}</p>
                    
                    {step.tip && (
                      <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(10, 43, 29, 0.04)", border: "1px solid rgba(10, 43, 29, 0.1)", borderRadius: 10, fontSize: 14, color: "var(--forest)", display: "flex", gap: 8 }}>
                        <span>💡</span>
                        <span>{step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {active.portal && (
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border-color)" }}>
                <a 
                  href={active.portal.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", background: "var(--forest)", color: "var(--gold-pale)", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15 }}
                >
                  {active.portal.label}
                  <ExternalLink size={16} />
                </a>
              </div>
            )}

            <div style={{ marginTop: 32, padding: "16px 20px", background: "var(--cream)", borderRadius: 12, border: "1px solid var(--border-color)", color: "var(--ink-muted)", fontSize: 14 }}>
              ⚖️ Need professional help?{" "}
              <Link href="/nalsa-check" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "none" }}>Check NALSA eligibility</Link> for free legal aid, or{" "}
              <Link href="/vakil-sahayak" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "none" }}>consult a lawyer on Vakil Sahayak</Link>.
            </div>
          </div>
        )
      )}
      </div>
    </div>
  );
}
