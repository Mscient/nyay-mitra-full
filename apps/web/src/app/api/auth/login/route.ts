import { NextResponse } from "next/server";

const IDENTITY_SVC_URL = process.env.IDENTITY_SVC_URL || "http://localhost:4001";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${IDENTITY_SVC_URL}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
