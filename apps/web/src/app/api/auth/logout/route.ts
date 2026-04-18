import { NextRequest, NextResponse } from "next/server";

const IDENTITY_SVC_URL = process.env.IDENTITY_SVC_URL || "http://localhost:4001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    await fetch(`${IDENTITY_SVC_URL}/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // Always succeed on logout
  }
}
