import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { cnr: string } }) {
  const cnr = params.cnr.trim().toUpperCase();
  if (!cnr || cnr.length < 10) {
    return NextResponse.json({ error: "Invalid CNR number" }, { status: 400 });
  }

  const eciapiToken = process.env.ECIAPI_TOKEN;
  if (eciapiToken) {
    try {
      const response = await fetch(`https://eciapi.akshit.me/cnr/${encodeURIComponent(cnr)}`, {
        headers: { Authorization: `Bearer ${eciapiToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ data, source: "eciapi" });
      }
    } catch (err: unknown) {
      console.error("[eCourts API Error]", err instanceof Error ? err.message : err);
    }
  }

  // Mock data fallback matching legacy Vite behavior
  const mockData: Record<string, unknown> = {
    MHAU010002132023: {
      cnr_number: "MHAU010002132023",
      case_title: "State of Maharashtra vs Suresh Jadhav",
      court_name: "District and Sessions Court, Aurangabad",
      filing_date: "2023-01-15",
      status: "Pending",
      next_hearing_date: "2026-04-12",
      judge: "Hon. Shri. P. V. Kadam",
      case_type: "Sessions Trial",
      petitioner: "State of Maharashtra",
      respondent: "Suresh Jadhav",
      history: [
        { date: "2023-01-15", stage: "Case Filed", remarks: "FIR 112/2023 Registered and chargesheet filed." },
        { date: "2023-02-10", stage: "First Hearing", remarks: "Accused produced in court. Remanded to Judicial Custody (JC)." },
        { date: "2023-06-22", stage: "Bail Hearing", remarks: "Bail application rejected by Sessions Court." },
        { date: "2024-11-05", stage: "Framing of Charges", remarks: "Charges framed under Sec 302, 34 IPC." },
        { date: "2025-08-19", stage: "Evidence", remarks: "Prosecution Witness 1 (PW1) examined." },
        { date: "2026-02-14", stage: "Evidence", remarks: "Prosecution Witness 2 (PW2) cross-examined by defense counsel." },
      ],
    },
    DLHC0200342024: {
      cnr_number: "DLHC0200342024",
      case_title: "Priya Kapoor vs Rajesh Kapoor",
      court_name: "High Court of Delhi",
      filing_date: "2024-03-01",
      status: "Disposed",
      next_hearing_date: "",
      judge: "Hon. Justice S. K. Mishra",
      case_type: "Civil Writ Petition",
      petitioner: "Priya Kapoor",
      respondent: "Rajesh Kapoor",
      history: [
        { date: "2024-03-01", stage: "Filed", remarks: "Writ petition filed." },
        { date: "2024-04-15", stage: "Admission", remarks: "Petition admitted. Notice issued to respondent." },
        { date: "2024-09-20", stage: "Arguments", remarks: "Arguments heard from both sides." },
        { date: "2024-11-10", stage: "Judgment", remarks: "Petition disposed with directions. Order uploaded." },
      ],
    },
  };

  const data = mockData[cnr] || {
    cnr_number: cnr,
    case_title: "Case Not Found",
    court_name: "N/A",
    filing_date: new Date().toISOString().split("T")[0],
    status: "Not Found",
    next_hearing_date: "",
    judge: "N/A",
    case_type: "Unknown",
    petitioner: "N/A",
    respondent: "N/A",
    history: [],
  };

  return NextResponse.json({ data, source: "mock" });
}
