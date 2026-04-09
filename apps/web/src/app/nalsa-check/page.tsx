"use client";

import { useState } from "react";
import Link from "next/link";

// AI-GENERATED: Antigravity — Direct port of NALSACheckerPage.tsx from legacy-vite
const QUESTIONS = [
  { id: "income", question: "What is your annual family income?", hint: "NALSA provides free legal aid if annual income is below ₹3 lakh",
    options: [{ label: "Below ₹1 lakh", value: "below_1l" }, { label: "₹1 – ₹3 lakh", value: "1l_3l" }, { label: "₹3 – ₹5 lakh", value: "3l_5l" }, { label: "Above ₹5 lakh", value: "above_5l" }] },
  { id: "category", question: "Do you belong to any of these groups?", hint: "These groups get free legal aid regardless of income",
    options: [{ label: "SC / ST Community", value: "sc_st" }, { label: "Woman (any income)", value: "woman" }, { label: "Child (under 18)", value: "child" }, { label: "Person with Disability", value: "pwd" }, { label: "Industrial / Agricultural Labourer", value: "labourer" }, { label: "Victim of Trafficking / Mass Disaster", value: "victim" }, { label: "None of the above", value: "none" }] },
  { id: "custody", question: "Are you or someone you represent currently in custody / detention?", hint: "All persons in custody are entitled to free legal aid under Section 304 CrPC",
    options: [{ label: "Yes, in judicial custody / jail", value: "jail" }, { label: "Yes, in police custody", value: "police" }, { label: "No, I am free", value: "free" }] },
  { id: "matter", question: "What is your legal matter?", hint: "Some matters have special free aid arrangements",
    options: [{ label: "Criminal case (accused)", value: "criminal" }, { label: "Domestic violence / family", value: "family" }, { label: "Labour / employment dispute", value: "labour" }, { label: "Property / civil dispute", value: "civil" }, { label: "RTI / government service", value: "rti" }, { label: "Consumer dispute", value: "consumer" }] },
  { id: "state", question: "Which state are you in?", hint: "DLSA offices are in every district. Select your state for contact details.",
    options: [{ label: "Maharashtra", value: "MH" }, { label: "Delhi", value: "DL" }, { label: "Uttar Pradesh", value: "UP" }, { label: "Karnataka", value: "KA" }, { label: "Tamil Nadu", value: "TN" }, { label: "West Bengal", value: "WB" }, { label: "Gujarat", value: "GJ" }, { label: "Rajasthan", value: "RJ" }, { label: "Other State / UT", value: "other" }] },
];

const DLSA_CONTACTS: Record<string, string> = {
  MH: "SLSA Maharashtra: 022-22630956 | jd-slsa-mah@nic.in", DL: "SLSA Delhi: 011-23386164 | dslsa@nic.in",
  UP: "SLSA UP: 0522-2237870 | upslsa@nic.in", KA: "SLSA Karnataka: 080-22253298 | kslsa@karnataka.gov.in",
  TN: "SLSA Tamil Nadu: 044-25671094 | tnslsa@nic.in", WB: "SLSA West Bengal: 033-22143240 | wbslsa@nic.in",
  GJ: "SLSA Gujarat: 079-27562343 | slsagujarat@nic.in", RJ: "SLSA Rajasthan: 0141-2740740 | rajslsa@nic.in",
  other: "NALSA Helpline: 15100 (free call) | nalsa@nic.in",
};

const DISTRICT_DLSA: Record<string, { district: string; address: string; phone: string; email: string }[]> = {
  MH: [{ district: "Mumbai City", address: "City Civil & Sessions Court Complex, Kala Ghoda, Mumbai 400001", phone: "022-22630956", email: "dlsa.mumbai@nic.in" }, { district: "Pune", address: "District Court Complex, Shivajinagar, Pune 411005", phone: "020-25532219", email: "dlsa.pune@nic.in" }, { district: "Nagpur", address: "District Court Campus, Civil Lines, Nagpur 440001", phone: "0712-2562315", email: "dlsa.nagpur@nic.in" }],
  DL: [{ district: "New Delhi", address: "Patiala House Courts, New Delhi 110001", phone: "011-23386164", email: "dlsa.newdelhi@nic.in" }, { district: "Saket", address: "Saket District Courts, New Delhi 110017", phone: "011-29563015", email: "dlsa.saket@nic.in" }, { district: "Rohini", address: "Rohini Courts Complex, Delhi 110085", phone: "011-27040311", email: "dlsa.rohini@nic.in" }],
  UP: [{ district: "Lucknow", address: "High Court of Allahabad (Lucknow Bench), Lucknow 226001", phone: "0522-2237870", email: "dlsa.lucknow@nic.in" }, { district: "Kanpur", address: "District Court, Collector Ganj, Kanpur 208001", phone: "0512-2540132", email: "dlsa.kanpur@nic.in" }],
  KA: [{ district: "Bengaluru Urban", address: "City Civil Court Building, Bengaluru 560001", phone: "080-22253298", email: "dlsa.bengaluru@karnataka.gov.in" }, { district: "Mysuru", address: "District Court Campus, Mysuru 570001", phone: "0821-2425430", email: "dlsa.mysuru@karnataka.gov.in" }],
  TN: [{ district: "Chennai", address: "City Civil Court, Chennai 600104", phone: "044-25671094", email: "dlsa.chennai@tn.gov.in" }, { district: "Coimbatore", address: "District Court, Coimbatore 641001", phone: "0422-2302140", email: "dlsa.coimbatore@tn.gov.in" }],
  WB: [{ district: "Kolkata", address: "City Sessions Court, Kolkata 700027", phone: "033-22143240", email: "dlsa.kolkata@wbslsa.in" }],
  GJ: [{ district: "Ahmedabad", address: "City Civil Court, Navrangpura, Ahmedabad 380009", phone: "079-27562343", email: "dlsa.ahmedabad@gslsa.in" }, { district: "Surat", address: "District Court, Surat 395001", phone: "0261-2421440", email: "dlsa.surat@gslsa.in" }],
  RJ: [{ district: "Jaipur", address: "District Court, Jaipur 302001", phone: "0141-2740740", email: "dlsa.jaipur@rajslsa.in" }],
  other: [{ district: "National NALSA", address: "Supreme Court of India, Tilak Marg, New Delhi 110001", phone: "15100", email: "nalsa@nic.in" }],
};

type Answers = Record<string, string>;

function determineEligibility(answers: Answers) {
  if (["sc_st","woman","child","pwd","labourer","victim"].includes(answers.category || "")) {
    return { eligible: true as const, reason: `You qualify for free legal aid as a ${answers.category === "sc_st" ? "member of SC/ST community" : answers.category === "woman" ? "woman" : answers.category === "child" ? "child (under 18)" : answers.category === "pwd" ? "person with disability" : answers.category === "labourer" ? "industrial/agricultural labourer" : "victim of trafficking or mass disaster"} — guaranteed under Section 12 of the Legal Services Authorities Act, 1987.`,
      nextSteps: ["Visit your nearest District Legal Services Authority (DLSA)", "Call NALSA helpline: 15100", "Carry any ID proof + a brief written description of your matter", answers.state ? `Your local DLSA: ${DLSA_CONTACTS[answers.state] || DLSA_CONTACTS.other}` : "Find nearest DLSA at nalsa.gov.in"] };
  }
  if (["jail","police"].includes(answers.custody || "")) {
    return { eligible: true as const, reason: "All persons in custody are entitled to free legal aid under Section 304 CrPC and Article 22(1) of the Constitution — regardless of income.",
      nextSteps: ["Request the jail/police to contact the nearest DLSA Panel Lawyer", "The duty magistrate must be informed if no lawyer is provided", answers.state ? `Your DLSA: ${DLSA_CONTACTS[answers.state] || DLSA_CONTACTS.other}` : "Call NALSA: 15100"] };
  }
  if (["below_1l","1l_3l"].includes(answers.income || "")) {
    return { eligible: true as const, reason: "Your income is within the NALSA threshold (below ₹3 lakh per annum) — you qualify for free legal aid under Section 12(h) of the Legal Services Authorities Act.",
      nextSteps: ["Visit nearest DLSA with income certificate or ration card", answers.state ? `Contact: ${DLSA_CONTACTS[answers.state] || DLSA_CONTACTS.other}` : "NALSA Helpline: 15100", "Bring documents related to your legal matter"] };
  }
  if (answers.income === "3l_5l" && ["criminal","family","labour","rti"].includes(answers.matter || "")) {
    return { eligible: "partial" as const, reason: "Your income is slightly above the standard threshold, but your type of case may qualify under state-specific schemes.",
      nextSteps: ["Apply to your DLSA and explain your financial situation", "Ask specifically about state SLSA special schemes", answers.state ? `Contact: ${DLSA_CONTACTS[answers.state] || DLSA_CONTACTS.other}` : "NALSA Helpline: 15100"] };
  }
  return { eligible: false as const, reason: "Based on your inputs, you may not qualify for government-funded free legal aid. However, you have other options.",
    nextSteps: ["Consult a private lawyer — Bar Association can refer you at nominal fees", "Many High Court Bar Associations offer free legal aid camps", "Contact local NGO legal aid clinics (e.g., CLPR, HSF, HRLN)", "Pro bono platforms: LawRato.com, NyayaDeep, Vakil No.1"] };
}

export default function NALSACheckerPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ReturnType<typeof determineEligibility> | null>(null);
  const [districtFilter, setDistrictFilter] = useState("");

  const currentQ = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  function handleAnswer(value: string) {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setResult(determineEligibility(newAnswers));
  }

  function reset() { setStep(0); setAnswers({}); setResult(null); setDistrictFilter(""); }

  const stateCode = answers.state || "other";
  const allOffices = DISTRICT_DLSA[stateCode] || DISTRICT_DLSA.other;
  const filteredOffices = districtFilter.trim()
    ? allOffices.filter(o => o.district.toLowerCase().includes(districtFilter.toLowerCase()))
    : allOffices;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(249,245,238,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ textDecoration: "none" }}><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer" }}>← Nyay Mitra</span></Link>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>NALSA Eligibility Checker</div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Free Legal Aid</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 500, color: "var(--ink)", lineHeight: 1.1 }}>Am I eligible for free legal aid?</h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 10, lineHeight: 1.65 }}>Answer 5 quick questions to find out if you qualify under the Legal Services Authorities Act, 1987.</p>
        </div>

        {!result ? (
          <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--border-color)", background: "var(--gold-whisper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-muted)", marginBottom: 8 }}>
                <span>Question {step + 1} of {QUESTIONS.length}</span><span>{progress}%</span>
              </div>
              <div style={{ height: 4, background: "var(--cream-dark)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--gold)", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>
            <div style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>{currentQ.question}</h2>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 24, padding: "8px 12px", background: "rgba(196,160,79,0.08)", borderRadius: 8, lineHeight: 1.5 }}>ℹ️ {currentQ.hint}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentQ.options.map(opt => (
                  <button key={opt.value} onClick={() => handleAnswer(opt.value)} style={{ padding: "14px 20px", border: "1.5px solid var(--border-color)", borderRadius: 12, background: "var(--cream)", fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, color: "var(--ink-mid)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "var(--forest)"; el.style.background = "var(--ivory)"; el.style.color = "var(--ink)"; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "var(--border-color)"; el.style.background = "var(--cream)"; el.style.color = "var(--ink-mid)"; }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {step > 0 && <button onClick={() => setStep(step - 1)} style={{ marginTop: 20, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--ink-muted)" }}>← Back</button>}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "var(--ivory)", border: `2px solid ${result.eligible === true ? "#10b981" : result.eligible === "partial" ? "var(--gold)" : "var(--border-color)"}`, borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "28px 32px", background: result.eligible === true ? "#10b981" : result.eligible === "partial" ? "var(--gold)" : "var(--ink)", color: "var(--ivory)" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{result.eligible === true ? "✅" : result.eligible === "partial" ? "⚠️" : "❌"}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500 }}>
                  {result.eligible === true ? "You qualify for free legal aid" : result.eligible === "partial" ? "You may partially qualify" : "Standard free aid may not apply"}
                </div>
              </div>
              <div style={{ padding: 32 }}>
                <p style={{ fontSize: 14, color: "var(--ink-mid)", lineHeight: 1.7, marginBottom: 28 }}>{result.reason}</p>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 14 }}>Next Steps</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.nextSteps.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", background: "var(--cream)", borderRadius: 10, fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>{i + 1}.</span>{s}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={reset} style={{ flex: 1, padding: "12px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Start Over</button>
                  <Link href="/chat" style={{ flex: 1 }}><button style={{ width: "100%", padding: "12px", background: "transparent", color: "var(--forest)", border: "1.5px solid var(--forest)", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Ask AI for Help</button></Link>
                </div>
                <p style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 16, textAlign: "center" }}>NALSA Helpline: 15100 (free, 24×7) · nalsa.gov.in</p>
              </div>
            </div>

            <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-color)", background: "rgba(196,160,79,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🗺️</span>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Find Your Nearest DLSA Office</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>District Legal Services Authority — Free walk-in assistance</div>
                </div>
              </div>
              <div style={{ padding: "20px 28px" }}>
                <input type="text" placeholder="Search district… (e.g. Pune, Rohini)" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border-color)", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 14, color: "var(--ink)", background: "var(--cream)", marginBottom: 16, boxSizing: "border-box", outline: "none" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                  {filteredOffices.map(office => (
                    <div key={office.district} style={{ padding: "14px 16px", background: "var(--cream)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                      <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14, marginBottom: 4 }}>📍 {office.district}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6 }}>{office.address}</div>
                      <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                        <a href={`tel:${office.phone}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--forest)", textDecoration: "none" }}>📞 {office.phone}</a>
                        <a href={`mailto:${office.email}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", textDecoration: "none" }}>✉️ {office.email}</a>
                      </div>
                    </div>
                  ))}
                  {filteredOffices.length === 0 && <div style={{ textAlign: "center", color: "var(--ink-muted)", fontSize: 13, padding: "20px 0" }}>No districts found. Try another search term or call NALSA: 15100.</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
