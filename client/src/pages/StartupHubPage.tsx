import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Moon, Sun, ChevronRight, CheckCircle2, Clock, AlertTriangle, ExternalLink, Building, FileText, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavBar } from "@/components/NavBar";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("incorporation");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Startup Hub" badge="Legal Suite" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold text-foreground mb-3">Startup Legal Hub</h1>
          <p className="text-muted-foreground max-w-2xl">Everything an early-stage founder needs — incorporation guide, compliance checklist, and key agreement templates. All DPDP and Companies Act 2013 compliant.</p>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-800 dark:text-amber-300 flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          All AI-generated templates are marked <strong>DRAFT — FOR LAWYER REVIEW</strong>. Book a 30-minute lawyer review before signing.
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 border-b border-border">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Incorporation Tab */}
        {activeTab === "incorporation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Step-by-step guide to incorporating a Private Limited Company in India via MCA21 SPICe+</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://www.mca.gov.in/" target="_blank" rel="noopener noreferrer">
                  Open MCA21 <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </a>
              </Button>
            </div>
            {INCORPORATION_STEPS.map((step, i) => (
              <div key={i} className="relative pl-10">
                {i < INCORPORATION_STEPS.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                )}
                <div className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                  step.status === "done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                  step.status === "prereq" ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
                  step.status === "optional" ? "bg-muted border-border text-muted-foreground" :
                  "bg-primary/10 border-primary/20 text-primary"
                }`}>
                  {step.status === "done" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground">{step.title}</h3>
                          {step.status === "optional" && <Badge variant="secondary" className="text-[10px]">Optional</Badge>}
                          {step.status === "prereq" && <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700">Prerequisite</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap shrink-0 text-[10px]">
                        <Clock className="h-3 w-3 mr-1" />{step.days}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Agreements Tab */}
        {activeTab === "agreements" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Key legal agreements every startup needs. All marked as DRAFT — for lawyer review before execution.</p>
            {AGREEMENTS.map((ag, i) => (
              <Card key={i} className={`border-l-4 ${ag.critical ? "border-l-primary" : "border-l-muted"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{ag.icon}</span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{ag.title}</h3>
                        {ag.critical && <Badge className="bg-primary/10 text-primary border-none text-[10px]">Essential</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ag.description}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => window.location.hash = "/documents"}>
                      <FileText className="h-3.5 w-3.5 mr-1" /> Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Compliance Calendar Tab */}
        {activeTab === "compliance" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Key compliance obligations for a Private Limited Company. Missing deadlines triggers heavy penalties.</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Compliance</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Frequency</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Deadline</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-destructive">Penalty</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Authority</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPLIANCE_ITEMS.map((item, i) => (
                    <tr key={i} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="p-4 font-medium text-foreground">{item.name}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{item.frequency}</td>
                      <td className="p-4 text-foreground">{item.deadline}</td>
                      <td className="p-4 text-destructive font-medium text-xs">{item.penalty}</td>
                      <td className="p-4 hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{item.authority}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-sm flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <strong className="text-foreground">Pro tip:</strong> <span className="text-muted-foreground">Register on StartupIndia (DPIIT) to get a 3-year income tax holiday under Sec 80-IAC, self-certification under 9 labour laws, and fast-track IP processing.</span>
                <a href="https://www.startupindia.gov.in/" target="_blank" rel="noopener noreferrer" className="text-primary font-medium ml-1 hover:underline inline-flex items-center gap-1">Apply now <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>
          </div>
        )}

        {/* IP Tab */}
        {activeTab === "ip" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Protect your startup's intellectual property proactively — before raising funding or hiring team members.</p>
            {IP_GUIDE.map((item, i) => (
              <Card key={i} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5 flex gap-4">
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full mt-4" asChild>
              <a href="https://ipindiaonline.gov.in/tmrpublicsearch/" target="_blank" rel="noopener noreferrer">
                🔍 Search Trademark Registry <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
