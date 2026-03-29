import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Moon, Sun, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavBar } from "@/components/NavBar";
import { useTheme } from "@/components/ThemeProvider";

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
  { id: "sarfaesi", title: "SARFAESI & DRT", subtitle: "Bank action on secured loans", icon: "🏦", tag: "Debt Recovery", tagColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { id: "cheque", title: "Cheque Bounce — Sec 138", subtitle: "NI Act demand notice & court process", icon: "🧾", tag: "Criminal", tagColor: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { id: "taxnotice", title: "Income Tax Notices", subtitle: "Sec 143(1), 148, 263 reply guide", icon: "📋", tag: "Tax Dispute", tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { id: "banking", title: "Banking Ombudsman", subtitle: "RBI CMS complaint for bank grievances", icon: "⚖️", tag: "Banking", tagColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  { id: "insurance", title: "Insurance Disputes", subtitle: "IRDAI Bima Bharosa grievance portal", icon: "🛡️", tag: "Insurance", tagColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { id: "gst", title: "GST Disputes", subtitle: "Show-cause notice reply & GSTAT appeal", icon: "🧮", tag: "Tax", tagColor: "bg-teal-500/10 text-teal-700 dark:text-teal-400" },
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
  const { theme, toggleTheme } = useTheme();
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  const active = activeModule ? MODULE_CONTENT[activeModule] : null;
  const activeInfo = activeModule ? MODULES.find(m => m.id === activeModule) : null;

  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Financial Aid" badge="Legal Rights Module" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back to modules button */}
        {activeModule && (
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" onClick={() => setActiveModule(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to all topics
          </Button>
        )}

        {!activeModule ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-4xl font-semibold text-foreground mb-3">Financial Legal Aid</h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                Step-by-step legal guidance for financial disputes — debt recovery, tax notices, banking complaints, and more. Select a topic to get started.
              </p>
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                ⚠️ <strong>Disclaimer:</strong> This is legal information, not legal advice. Always consult a qualified lawyer or CA for decisions affecting your rights or finances.
              </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map(mod => (
                <Card
                  key={mod.id}
                  className="cursor-pointer group hover:shadow-lg hover:-translate-y-1 transition-all border-border hover:border-primary/30"
                  onClick={() => setActiveModule(mod.id)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="text-4xl">{mod.icon}</div>
                    <div className="space-y-1">
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{mod.title}</h3>
                      <p className="text-sm text-muted-foreground">{mod.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={`text-[10px] font-semibold uppercase tracking-wide rounded-full ${mod.tagColor}`}>
                        {mod.tag}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Module Detail View */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{activeInfo?.icon}</span>
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">{activeInfo?.title}</h1>
                <p className="text-muted-foreground">{activeInfo?.subtitle}</p>
              </div>
            </div>

            {active?.steps.map((step, i) => (
              <div key={i} className="relative pl-10">
                {/* Step connector line */}
                {i < (active?.steps.length ?? 0) - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                )}
                {/* Step number circle */}
                <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-base font-semibold">{step.heading}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                    {step.tip && (
                      <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 text-sm text-secondary-foreground/80 flex gap-2">
                        <span className="shrink-0 text-secondary">💡</span>
                        <span>{step.tip}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}

            {active?.portal && (
              <div className="mt-8 pt-6 border-t border-border">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href={active.portal.url} target="_blank" rel="noopener noreferrer">
                    {active.portal.label}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}

            <div className="p-4 bg-muted/40 rounded-xl border border-border text-sm text-muted-foreground">
              ⚖️ Need professional help? <Link href="/nalsa-check"><span className="text-primary font-medium cursor-pointer hover:underline">Check NALSA eligibility</span></Link> for free legal aid, or {" "}
              <Link href="/vakil-sahayak"><span className="text-primary font-medium cursor-pointer hover:underline">consult a lawyer on Vakil Sahayak</span></Link>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
