import { NextResponse } from "next/server";

const DOC_BODY_PROMPTS: Record<string, (fields: Record<string, string>) => string> = {
  rti: (f) => `You are an expert in Indian RTI law.
Write ONLY the "Information Sought" body paragraphs for an RTI application under Section 6(1) of the RTI Act, 2005.
Number each query as 1), 2), 3) etc. Use formal legal language. Do NOT include address blocks, date, fee, signature or any boilerplate — ONLY the numbered queries.
Information requested: ${f.information_needed || f.subject || "As described"}
Authority: ${f.authority || "Public Information Officer"}`,

  legal_notice: (f) => `You are a senior Indian advocate drafting a Legal Notice.
Write ONLY the "Facts & Grounds" body — detailed facts, events, legal provisions breached, and the dispute narrative.
Cite relevant Acts and sections. Number paragraphs. Be specific and legally actionable.
Do NOT write the To/From header, demand clause, prayer or signature — ONLY the facts narrative.
Claim details: ${f.claim_details || ""}
Demand: ${f.demand || ""}`,

  bail_petition: (f) => `You are an Indian criminal law expert.
Write ONLY the "Grounds for Release on Bail" — numbered sub-paragraphs (a), (b), (c) explaining why bail should be granted.
Reference Section 437/439 CrPC or 480/483 BNSS as appropriate.
Do NOT write court heading, cause title, prayer or signature — ONLY the bail grounds.
Charges: ${f.charges || ""}
Grounds: ${f.grounds_for_bail || ""}`,

  consumer_complaint: (f) => `You are an Indian consumer law expert.
Write ONLY the "Facts of Complaint" body — numbered paragraphs detailing the defect, deficiency in service, unfair trade practice, and sequence of events.
Cite Consumer Protection Act 2019. Do NOT write forum heading, cause title, relief or prayer — ONLY the facts.
Complaint details: ${f.complaint_details || ""}
Opposite party: ${f.opposite_party || ""}`,

  affidavit: (f) => `You are an Indian legal drafter.
Write ONLY the "Statement of Facts" — formal numbered THAT paragraphs (e.g. "THAT I am the Deponent...").
Begin each paragraph with "THAT ". Do NOT write personal particulars, verification or notary section — ONLY the THAT paragraphs.
Facts: ${f.statement_of_facts || ""}
Deponent: ${f.deponent_name || ""}`,

  founder_agreement: (f) => `You are a startup legal expert in Indian company law.
Write ONLY the "Roles, Responsibilities & Time Commitment" clause body — covering what each founder will do, time commitment, decision rights, outside activity restrictions. Cite Companies Act 2013 where relevant.
Do NOT write agreement header, equity table, vesting, IP clause or signatures — ONLY the roles clause.
Founders: ${f.founder1_name || "Founder 1"} and ${f.founder2_name || "Founder 2"}`,

  esop_policy: (f) => `You are a corporate legal expert in Indian company law.
Write ONLY the "Change of Control / Exit Event" clause — what happens to vested and unvested options on acquisition, merger, IPO, and winding up.
Reference SEBI (SBEB) Regulations 2021 and Companies Act 2013.
Do NOT write definitions, pool size, vesting, good/bad leaver or board resolution — ONLY the Exit Event clause.
Company: ${f.startup_name || ""}`,
};

export async function POST(req: Request) {
  try {
    const { type, fields, language } = await req.json();

    if (!type || !DOC_BODY_PROMPTS[type]) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI body generation unavailable. SARVAM_API_KEY not configured.", fallback: true },
        { status: 503 }
      );
    }

    const promptFn = DOC_BODY_PROMPTS[type];
    const langNote = language === "hi"
      ? "\n\nIMPORTANT: Write in formal Hindi (Devanagari script)."
      : language === "mr"
      ? "\n\nIMPORTANT: Write in formal Marathi (Devanagari script)."
      : "";

    const response = await fetch("https://api.sarvam.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Subscription-Key": apiKey,
      },
      body: JSON.stringify({
        model: "sarvam-30b",
        temperature: 0.15,
        max_tokens: 800,
        messages: [{ role: "user", content: promptFn(fields || {}) + langNote }],
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Sarvam AI Error]", errorText);
      return NextResponse.json({ error: "AI generation failed from upstream.", details: errorText }, { status: 500 });
    }

    const data = await response.json();
    const aiBody = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ success: true, aiBody, ai_generated: true });
  } catch (err: any) {
    console.error("[AI Doc Body Error]", err.message);
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: "Document generation timed out. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ error: "AI generation failed. Please try again.", details: err.message }, { status: 500 });
  }
}
