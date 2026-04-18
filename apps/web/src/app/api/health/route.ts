import { NextResponse } from "next/server";

const IDENTITY_SVC_URL = process.env.IDENTITY_SVC_URL || "http://localhost:4001";
const WORKSPACE_SVC_URL = process.env.WORKSPACE_SVC_URL || "http://localhost:4002";
const DOCGEN_SVC_URL = process.env.DOCGEN_SVC_URL || "http://localhost:4003";

async function pingService(url: string, name: string) {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json().catch(() => ({}));
    return { name, status: res.ok ? "ok" : "degraded", ...data };
  } catch {
    return { name, status: "offline" };
  }
}

export async function GET() {
  const [identity, workspace, docgen] = await Promise.all([
    pingService(IDENTITY_SVC_URL, "identity-svc"),
    pingService(WORKSPACE_SVC_URL, "workspace-svc"),
    pingService(DOCGEN_SVC_URL, "docgen-svc"),
  ]);

  const allOk = [identity, workspace, docgen].every(s => s.status === "ok");

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services: { identity, workspace, docgen },
    environment: process.env.NODE_ENV ?? "development",
  }, { status: allOk ? 200 : 207 });
}
