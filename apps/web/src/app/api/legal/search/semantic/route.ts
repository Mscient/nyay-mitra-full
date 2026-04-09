import { NextRequest, NextResponse } from "next/server";

// ── IndianKanoon API integration + 25-case fallback dataset ──────────────────
// Register at https://api.indiankanoon.org/ for a free non-commercial API key.
// Without the key, this route uses a high-quality curated 25-case dataset.

// Rate limiting
const RATE_MAP = new Map<string, { count: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_MAP.get(ip);
  if (!entry || entry.reset < now) { RATE_MAP.set(ip, { count: 1, reset: now + 60_000 }); return true; }
  if (entry.count >= 60) return false;
  entry.count++;
  return true;
}

// ── 25 landmark SC judgments (fallback when no IndianKanoon key) ─────────────
const FALLBACK_CASES = [
  { id:"1", case_title:"Maneka Gandhi v. Union of India", case_number:"AIR 1978 SC 597", court_type:"Supreme Court of India", year_decided:1978, issue_categories:"Personal Liberty, Passport, Article 21, Due Process", summary:"Expanded Article 21 beyond mere procedure — procedure must be fair, just and reasonable. Established right to travel abroad is part of personal liberty.", legal_principles:JSON.stringify(["Article 21 includes right to travel abroad","Procedure must be fair, just and reasonable","Articles 14, 19 and 21 are interrelated"]), precedent_value:98 },
  { id:"2", case_title:"Arnesh Kumar v. State of Bihar", case_number:"(2014) 8 SCC 273", court_type:"Supreme Court of India", year_decided:2014, issue_categories:"Arrest, Section 498A IPC, Section 41 CrPC, Domestic Violence", summary:"Guidelines to prevent automatic arrests under Section 498A IPC. Police must apply mind before arresting. Section 41A notice must be issued for offences carrying up to 7 years.", legal_principles:JSON.stringify(["Police must justify necessity of arrest","Section 41A notice mandatory before arrest in 7-year offences","Arrest is not mandatory even if offence is cognizable"]), precedent_value:95 },
  { id:"3", case_title:"K.S. Puttaswamy v. Union of India", case_number:"(2017) 10 SCC 1", court_type:"Supreme Court of India", year_decided:2017, issue_categories:"Right to Privacy, Fundamental Rights, Aadhaar, Data Protection", summary:"Nine-judge bench unanimously held right to privacy is a fundamental right under Article 21. Privacy includes decisional autonomy, bodily integrity, and informational self-determination.", legal_principles:JSON.stringify(["Privacy is a fundamental right","State must justify intrusion with legitimate aim and proportionality","Informational privacy protects against data surveillance"]), precedent_value:99 },
  { id:"4", case_title:"Lalita Kumari v. Government of Uttar Pradesh", case_number:"(2014) 2 SCC 1", court_type:"Supreme Court of India", year_decided:2013, issue_categories:"FIR, Mandatory Registration, Section 154 CrPC, Police", summary:"Registration of FIR is mandatory under Section 154 CrPC if information discloses a cognizable offence. Police cannot conduct preliminary inquiry before registering FIR.", legal_principles:JSON.stringify(["FIR registration is mandatory for cognizable offences","Police have no discretion to refuse FIR registration","Preliminary inquiry only for non-cognizable or doubtful cases"]), precedent_value:94 },
  { id:"5", case_title:"Vishaka v. State of Rajasthan", case_number:"AIR 1997 SC 3011", court_type:"Supreme Court of India", year_decided:1997, issue_categories:"Sexual Harassment, Workplace, POSH Act, Article 19, Women Rights", summary:"Vishaka Guidelines for prevention of sexual harassment at workplace. Every employer must constitute a Complaints Committee. Led to POSH Act 2013.", legal_principles:JSON.stringify(["Employer has duty to protect from sexual harassment","Sexual harassment violates Articles 14, 19 and 21","Complaints Committee must be headed by a woman"]), precedent_value:97 },
  { id:"6", case_title:"Hussainara Khatoon v. Home Secretary, Bihar", case_number:"AIR 1979 SC 1360", court_type:"Supreme Court of India", year_decided:1979, issue_categories:"Undertrial Prisoners, Bail, Speedy Trial, Free Legal Aid, NALSA", summary:"Right to speedy trial is a fundamental right under Article 21. Prolonged incarceration of undertrials violates fundamental right to liberty. Free legal aid is mandatory for indigent accused.", legal_principles:JSON.stringify(["Right to speedy trial is part of Article 21","Excessive undertrial detention is unconstitutional","State must provide free legal aid to those who cannot afford it"]), precedent_value:96 },
  { id:"7", case_title:"Re: Inhuman Conditions in 1382 Prisons", case_number:"WP (Civil) 406/2013", court_type:"Supreme Court of India", year_decided:2016, issue_categories:"Section 436A CrPC, Default Bail, Undertrial, Prison Reform, BNSS", summary:"Section 436A mandates release of undertrials who have served half the maximum imprisonment. Courts must suo motu examine eligibility.", legal_principles:JSON.stringify(["Section 436A bail is a statutory right","Jail superintendent must identify eligible undertrial prisoners","Courts must periodically review undertrial detention"]), precedent_value:88 },
  { id:"8", case_title:"Satender Kumar Antil v. CBI", case_number:"(2022) 10 SCC 51", court_type:"Supreme Court of India", year_decided:2022, issue_categories:"Bail, Arrest, Section 41A CrPC, BNSS, Criminal Procedure", summary:"Comprehensive bail and arrest guidelines. Category-wise classification of offences. Bail applications must be decided in 2 weeks.", legal_principles:JSON.stringify(["Bail is the rule, jail is the exception","Section 41A notice mandatory before arrest in category B offences","Bail applications should be decided expeditiously"]), precedent_value:92 },
  { id:"9", case_title:"Nandini Satpathy v. P.L. Dani", case_number:"AIR 1978 SC 1025", court_type:"Supreme Court of India", year_decided:1978, issue_categories:"Self-Incrimination, Article 20(3), Right to Silence, Police Interrogation", summary:"Right against self-incrimination under Article 20(3) applies to all investigations, not just court proceedings. An accused cannot be compelled to answer incriminating questions.", legal_principles:JSON.stringify(["Article 20(3) protects against compelled self-incrimination","Right to silence extends to police interrogation","Compulsion includes psychological coercion"]), precedent_value:90 },
  { id:"10", case_title:"Navtej Singh Johar v. Union of India", case_number:"(2018) 10 SCC 1", court_type:"Supreme Court of India", year_decided:2018, issue_categories:"Section 377 IPC, LGBT Rights, Privacy, Dignity, Decriminalisation", summary:"Read down Section 377 IPC to decriminalize consensual same-sex acts between adults. LGBT persons have equal constitutional rights. Constitutional morality must prevail over popular morality.", legal_principles:JSON.stringify(["Sexual orientation is innate and cannot be criminalized","Constitutional morality supersedes social morality","Minority rights cannot be subject to majoritarian opinion"]), precedent_value:97 },
  { id:"11", case_title:"Shayara Bano v. Union of India", case_number:"(2017) 9 SCC 1", court_type:"Supreme Court of India", year_decided:2017, issue_categories:"Triple Talaq, Muslim Personal Law, Article 14, Women Rights, Divorce", summary:"3:2 majority struck down instant triple talaq as unconstitutional — manifestly arbitrary under Article 14. Muslim Women (Protection of Rights on Marriage) Act 2019 followed.", legal_principles:JSON.stringify(["Triple talaq is manifestly arbitrary","Religious practice cannot override fundamental rights","Muslim Women Act 2019 codified this ruling"]), precedent_value:93 },
  { id:"12", case_title:"M.C. Mehta v. Union of India (Taj Trapezium)", case_number:"AIR 1997 SC 735", court_type:"Supreme Court of India", year_decided:1996, issue_categories:"Environment, Pollution, Precautionary Principle, PIL, Public Interest", summary:"PIL ordering relocation of polluting industries from Taj Trapezium Zone. Established Precautionary Principle and Polluter Pays Principle in Indian environmental law.", legal_principles:JSON.stringify(["Precautionary principle applies even without scientific certainty","Polluter must pay for remediation","Right to healthy environment is part of Article 21"]), precedent_value:93 },
  { id:"13", case_title:"S.P. Gupta v. Union of India (Judges Transfer Case)", case_number:"AIR 1982 SC 149", court_type:"Supreme Court of India", year_decided:1981, issue_categories:"PIL, Locus Standi, Public Interest Litigation, Judicial Independence", summary:"Expanded locus standi in PIL — any public-spirited person can file PIL for enforcement of rights of disadvantaged persons. Liberalised access to justice for the poor.", legal_principles:JSON.stringify(["PIL can be filed by any person acting bona fide for public interest","Locus standi liberalised for disadvantaged groups","Courts can issue directions to government for enforcement of rights"]), precedent_value:89 },
  { id:"14", case_title:"Shreya Singhal v. Union of India", case_number:"(2015) 5 SCC 1", court_type:"Supreme Court of India", year_decided:2015, issue_categories:"Section 66A IT Act, Free Speech, Internet Freedom, Article 19", summary:"Struck down Section 66A IT Act as unconstitutional — vague and overbroad. Free speech online protected by Article 19(1)(a). Government cannot restrict speech merely because it causes annoyance.", legal_principles:JSON.stringify(["Free speech online is protected by Article 19(1)(a)","Law cannot restrict speech for being annoying or inconvenient","Section 66A IT Act struck down in entirety"]), precedent_value:96 },
  { id:"15", case_title:"Indra Sawhney v. Union of India (Mandal Case)", case_number:"AIR 1993 SC 477", court_type:"Supreme Court of India", year_decided:1992, issue_categories:"OBC Reservation, Article 16, 50% Cap, Creamy Layer, Backward Classes", summary:"Upheld 27% OBC reservations. Established 50% ceiling on total reservations. Introduced creamy layer exclusion from OBC reservation benefits.", legal_principles:JSON.stringify(["Reservations cannot exceed 50% of total posts","Creamy layer must be excluded from OBC reservation","Reservations are for backward classes, not for individual advancement"]), precedent_value:94 },
  { id:"16", case_title:"Olga Tellis v. Bombay Municipal Corporation", case_number:"AIR 1986 SC 180", court_type:"Supreme Court of India", year_decided:1985, issue_categories:"Right to Livelihood, Eviction, Pavement Dwellers, Article 21, Housing", summary:"Right to livelihood is part of right to life under Article 21. Forced eviction of pavement dwellers without notice or rehabilitation violates fundamental right.", legal_principles:JSON.stringify(["Right to livelihood is integral to right to life","Forced eviction without rehabilitation violates Article 21","State must hear persons before depriving them of livelihood"]), precedent_value:91 },
  { id:"17", case_title:"Joseph Shine v. Union of India", case_number:"(2019) 3 SCC 39", court_type:"Supreme Court of India", year_decided:2018, issue_categories:"Adultery, Section 497 IPC, Women Rights, Equality, Marital Rights", summary:"Struck down Section 497 IPC (adultery law) as unconstitutional. Women are not property of their husbands. Consensual adult relationships cannot be criminalised.", legal_principles:JSON.stringify(["Adultery law violated Articles 14, 15 and 21","Women have equal autonomy in sexual decisions","Consensual adult relationships cannot be criminalised"]), precedent_value:91 },
  { id:"18", case_title:"Bandhua Mukti Morcha v. Union of India", case_number:"AIR 1984 SC 802", court_type:"Supreme Court of India", year_decided:1984, issue_categories:"Bonded Labour, Article 21, Labour Rights, Forced Labour, Article 23", summary:"Bonded labour violates fundamental rights under Articles 21 and 23. State has affirmative duty to identify, release and rehabilitate bonded labourers.", legal_principles:JSON.stringify(["Bonded labour violates Articles 21 and 23","State must identify and rehabilitate bonded labourers","Third party can file PIL for bonded labour victims"]), precedent_value:89 },
  { id:"19", case_title:"Lily Thomas v. Union of India", case_number:"(2013) 7 SCC 653", court_type:"Supreme Court of India", year_decided:2013, issue_categories:"Disqualification of MPs MLAs, Conviction, Section 8 RPA, Criminal Record", summary:"Members of Parliament and state legislature convicted and sentenced to 2+ years are immediately disqualified on conviction. Section 8(4) RPA struck down as unconstitutional.", legal_principles:JSON.stringify(["Convicted legislators are disqualified immediately upon conviction","Section 8(4) RPA was unconstitutional","No stay of disqualification on appeal for convicted legislators"]), precedent_value:90 },
  { id:"20", case_title:"National Insurance Co. v. Pranay Sethi", case_number:"(2017) 16 SCC 680", court_type:"Supreme Court of India", year_decided:2017, issue_categories:"Motor Accident, MACT Tribunal, Compensation, Future Prospects, Section 166 MV Act", summary:"Settled method of calculating compensation in motor accident claims. Future prospects: 40% for salaried below 40 years, 25% for 40-50 years, 10% above 50. Funeral expenses standardised.", legal_principles:JSON.stringify(["Future prospects must be added to compensation","Consortium of spouse is a separate head of compensation","Non-pecuniary damages include loss of love, affection, care and guidance"]), precedent_value:92 },
  { id:"21", case_title:"Bachan Singh v. State of Punjab", case_number:"AIR 1980 SC 898", court_type:"Supreme Court of India", year_decided:1980, issue_categories:"Death Penalty, Section 302 IPC, Rarest of Rare, Capital Punishment, Murder", summary:"Death penalty is constitutional but only in the rarest of rare cases. Balancing test between aggravating and mitigating circumstances is mandatory.", legal_principles:JSON.stringify(["Death penalty only for rarest of rare cases","Aggravating and mitigating circumstances must be balanced","Life imprisonment is the rule, death penalty the exception"]), precedent_value:98 },
  { id:"22", case_title:"State of Punjab v. Gurmit Singh", case_number:"AIR 1996 SC 1393", court_type:"Supreme Court of India", year_decided:1996, issue_categories:"Rape, POCSO, Sexual Assault, Victim Testimony, Section 376 IPC, In-Camera Trial", summary:"Victim testimony in sexual assault sufficient for conviction without mandatory corroboration. Questions about past sexual history prohibited. In-camera trial mandatory in rape cases.", legal_principles:JSON.stringify(["Victim testimony in sexual assault cases is sufficient for conviction","Corroboration is not an invariable rule in rape cases","Past sexual history of victim is irrelevant and inadmissible"]), precedent_value:91 },
  { id:"23", case_title:"Consumer Education and Research Centre v. Union of India", case_number:"AIR 1995 SC 922", court_type:"Supreme Court of India", year_decided:1995, issue_categories:"Workers Rights, Right to Health, Article 21, Asbestosis, Labour, Occupational Health", summary:"Right to health and medical care is a fundamental right under Article 21. Employer is duty-bound to ensure safe working conditions. Workers exposed to hazardous materials must receive adequate protection.", legal_principles:JSON.stringify(["Right to health is part of Article 21","Employer must ensure safe working conditions","Workers in hazardous industries entitled to medical care and compensation"]), precedent_value:86 },
  { id:"24", case_title:"Sarla Mudgal v. Union of India", case_number:"AIR 1995 SC 1531", court_type:"Supreme Court of India", year_decided:1995, issue_categories:"Bigamy, Conversion to Islam, Hindu Marriage, Section 494 IPC, Divorce", summary:"Hindu husband converting to Islam solely to contract a second marriage without dissolving first marriage is guilty of bigamy under Section 494 IPC. Conversion does not dissolve existing Hindu marriage.", legal_principles:JSON.stringify(["Hindu marriage only dissolved by divorce or death","Conversion to Islam does not dissolve first marriage","Second marriage after conversion without divorce is bigamy"]), precedent_value:87 },
  { id:"25", case_title:"Supreme Court Advocates-on-Record v. Union of India (NJAC Case)", case_number:"(2016) 5 SCC 1", court_type:"Supreme Court of India", year_decided:2015, issue_categories:"Judicial Appointments, NJAC, Collegium, Basic Structure, Independence of Judiciary", summary:"Struck down the National Judicial Appointments Commission (NJAC) as unconstitutional. The collegium system for appointment of judges to Higher Courts was restored as the collegium upholds basic structure doctrine.", legal_principles:JSON.stringify(["Independence of judiciary is a basic structure feature","Executive cannot have veto or primary role in judicial appointments","Collegium system upholds separation of powers"]), precedent_value:95 },
];

// ── Scoring: keyword match across title, categories, summary ─────────────────
function scoreRelevance(query: string, c: typeof FALLBACK_CASES[0]): number {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);
  let score = 0;
  for (const word of words) {
    if (c.case_title.toLowerCase().includes(word)) score += 5;
    if (c.issue_categories.toLowerCase().includes(word)) score += 3;
    if (c.summary.toLowerCase().includes(word)) score += 1;
    try {
      if (JSON.parse(c.legal_principles).some((p: string) => p.toLowerCase().includes(word))) score += 2;
    } catch {}
  }
  return score;
}

// ── IndianKanoon API call ────────────────────────────────────────────────────
async function searchIndianKanoon(query: string, apiKey: string, limit: number) {
  const url = `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(query)}&pagenum=0`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 3600 }, // Cache 1 hour
  });

  if (!res.ok) throw new Error(`IndianKanoon API error: ${res.status}`);
  const data = await res.json();

  // Map IK response format → our standard format
  const docs = (data.docs || []).slice(0, limit);
  return docs.map((doc: Record<string, unknown>, i: number) => {
    const tid = doc.tid as string | number | undefined;
    const title = (doc.title as string) || "Untitled";
    const citation = (doc.citation as string) || "";
    const docsource = (doc.docsource as string) || "Indian Court";
    const publishdate = doc.publishdate as string | undefined;
    const headline = (doc.headline as string) || "";
    const fragment = (doc.fragment as string) || "";
    return {
      id: tid?.toString() || `ik-${i}`,
      case_title: title,
      case_number: citation || docsource,
      court_type: docsource,
      year_decided: publishdate ? parseInt(publishdate.split("-")[0]) : 0,
      issue_categories: headline.replace(/<[^>]*>/g, ""),
      summary: (headline || fragment).replace(/<[^>]*>/g, "").substring(0, 400),
      legal_principles: JSON.stringify([]),
      precedent_value: 80,
      source: "indiankanoon",
      ik_link: `https://indiankanoon.org/doc/${tid}/`,
    };
  });
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 25);

  if (!query.trim()) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const ikApiKey = process.env.INDIANKANOON_API_KEY;

  // ── Try IndianKanoon API first ───────────────────────────────────────────
  if (ikApiKey) {
    try {
      const results = await searchIndianKanoon(query, ikApiKey, limit);
      return NextResponse.json({
        results,
        total: results.length,
        query,
        source: "indiankanoon_api",
        _note: "Live results from IndianKanoon API (30M+ documents)",
      });
    } catch (err: unknown) {
      console.error("[IndianKanoon API Error]", err instanceof Error ? err.message : err);
      // Fall through to mock dataset
    }
  }

  // ── Fallback: curated 25-case dataset ────────────────────────────────────
  const scored = FALLBACK_CASES
    .map(c => ({ ...c, score: scoreRelevance(query, c) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score || b.precedent_value - a.precedent_value)
    .slice(0, limit);

  const results = scored.length > 0
    ? scored
    : FALLBACK_CASES.slice(0, 5).sort((a, b) => b.precedent_value - a.precedent_value);

  return NextResponse.json({
    results,
    total: results.length,
    query,
    source: ikApiKey ? "fallback_after_ik_error" : "curated_dataset_v2",
    _note: ikApiKey
      ? "IndianKanoon API unavailable — showing curated dataset"
      : "Set INDIANKANOON_API_KEY in .env.local for 30M+ live case search. Register free at api.indiankanoon.org",
  });
}
