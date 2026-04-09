import { NextRequest, NextResponse } from "next/server";

const DOCGEN_SVC_URL = process.env.DOCGEN_SVC_URL || "http://localhost:4003";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${DOCGEN_SVC_URL}/v1/docgen/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // PDF gen can take up to 30s
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "PDF service error" }));
      return NextResponse.json(err, { status: response.status });
    }

    // Stream the PDF binary back to the browser
    const pdfBuffer = await response.arrayBuffer();
    const filename = body.filename || "nyaymitra_document";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    });
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      return NextResponse.json({ error: "PDF generation timed out (>30s)" }, { status: 504 });
    }
    // docgen-svc not running — tell the frontend to fall back to HTML download
    return NextResponse.json(
      { error: "PDF service unavailable", fallback: true, _dev: true },
      { status: 503 }
    );
  }
}
