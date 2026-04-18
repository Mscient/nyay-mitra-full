import { NextRequest, NextResponse } from "next/server";

const IDENTITY_SVC_URL = process.env.IDENTITY_SVC_URL || "http://localhost:4001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${IDENTITY_SVC_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json().catch(() => ({ error: "Service error" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Identity service unavailable" }, { status: 503 });
  }
}
