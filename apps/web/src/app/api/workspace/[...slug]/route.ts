import { NextRequest, NextResponse } from "next/server";

const WORKSPACE_SVC_URL = process.env.WORKSPACE_SVC_URL || "http://localhost:4002";

async function proxyRequest(request: NextRequest, params: { slug: string[] }) {
  const slug = params.slug.join("/");
  const targetUrl = `${WORKSPACE_SVC_URL}/v1/workspace/${slug}`;
  
  const url = new URL(request.url);
  const queryString = url.search;
  const fullTarget = queryString ? `${targetUrl}${queryString}` : targetUrl;

  const authHeader = request.headers.get("Authorization");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authHeader) headers["Authorization"] = authHeader;

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const response = await fetch(fullTarget, {
      method: request.method,
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json().catch(() => ({ error: "Invalid response from workspace service" }));

    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      return NextResponse.json({ error: "Workspace service timeout" }, { status: 504 });
    }
    // workspace-svc not running — return mock data for development
    return NextResponse.json(
      { error: "Workspace service unavailable. Ensure workspace-svc is running on port 4002.", _dev: true },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params);
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params);
}
