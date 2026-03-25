import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Moon, Sun, ChevronRight, Search, AlertTriangle, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NavBar } from "@/components/NavBar";
import { useTheme } from "@/components/ThemeProvider";

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
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
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
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
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
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
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
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
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
    color: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
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
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
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
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [activeAct, setActiveAct] = useState<ActKey | null>(null);
  const [activeTab, setActiveTab] = useState<"acts" | "fir">("acts");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = ACTS.filter(a =>
    !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const detail = activeAct ? ACTS.find(a => a.key === activeAct) : null;

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        title="Know Your Rights" 
        badge="Citizen Guide" 
        onBack={activeAct ? () => setActiveAct(null) : undefined}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!activeAct ? (
          <>
            <div className="mb-8">
              <h1 className="font-display text-4xl font-semibold text-foreground mb-3">Know Your Rights</h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">Plain-language explainers on Indian laws. Understand your rights before talking to a lawyer.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab("acts")}
                className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${activeTab === "acts" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <FileText className="inline h-4 w-4 mr-2" />Laws & Acts
              </button>
              <button
                onClick={() => setActiveTab("fir")}
                className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${activeTab === "fir" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <AlertTriangle className="inline h-4 w-4 mr-2" />FIR Assistant
              </button>
            </div>

            {activeTab === "acts" && (
              <>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search an act (e.g. RTI, IPC, Consumer)" className="pl-10" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(act => (
                    <Card key={act.key} className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group" onClick={() => setActiveAct(act.key)}>
                      <CardContent className="p-5 space-y-3">
                        <div className="text-3xl">{act.icon}</div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{act.name}</h3>
                          <p className="text-xs text-muted-foreground">{act.fullName}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{act.summary}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className={`text-[10px] font-semibold rounded-full ${act.color}`}>{act.rights.length} Rights</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {activeTab === "fir" && (
              <div className="space-y-4 max-w-2xl">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-800 dark:text-amber-300 flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>In an emergency, call <strong>100</strong> (Police), <strong>1091</strong> (Women in distress), or <strong>112</strong> (National Emergency). This guide is for when you are safe and ready to file a formal complaint.</span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">How to File an FIR</h2>
                <div className="space-y-3">
                  {FIR_STEPS.map(step => (
                    <Card key={step.step}>
                      <CardContent className="p-5 flex gap-4">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">{step.step}</div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{step.heading}</h3>
                          <p className="text-sm text-muted-foreground">{step.body}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => navigate("/chat")} className="flex-1 sm:flex-none">
                    Ask AI Legal Help
                  </Button>
                  <Button variant="outline" asChild className="flex-1 sm:flex-none">
                    <a href="tel:100"><Phone className="h-4 w-4 mr-2" />Call Police (100)</a>
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          detail && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{detail.icon}</span>
                <div>
                  <Badge variant="secondary" className={`text-[10px] font-semibold rounded-full mb-2 ${detail.color}`}>{detail.name}</Badge>
                  <h1 className="font-display text-2xl font-semibold text-foreground">{detail.fullName}</h1>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-8 text-base bg-muted/30 p-4 rounded-xl border border-border">{detail.summary}</p>

              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Your Rights</h2>
              <div className="space-y-3">
                {detail.rights.map((r, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground mb-1.5">✓ {r.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 p-4 bg-muted/40 rounded-xl border border-border text-sm text-muted-foreground">
                Need legal help? <Link href="/chat"><span className="text-primary font-medium cursor-pointer hover:underline">Chat with AI Legal Assistant</span></Link> or <Link href="/nalsa-check"><span className="text-primary font-medium cursor-pointer hover:underline">check NALSA eligibility for free aid</span></Link>.
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
