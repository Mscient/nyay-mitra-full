import { NextRequest, NextResponse } from "next/server";

const IDENTITY_SVC_URL = process.env.IDENTITY_SVC_URL || "http://localhost:4001";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${IDENTITY_SVC_URL}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json().catch(() => ({ error: "Service error" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Identity service unavailable" }, { status: 503 });
  }
}
