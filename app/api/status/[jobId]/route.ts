import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BACKEND_BASE_URL = "http://37.27.181.162:8000"; // FastAPI backend

type Params = {
  params: {
    jobId: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { jobId } = params;

  if (!jobId) {
    return NextResponse.json({ detail: "jobId is required" }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_BASE_URL}/api/status/${jobId}`, {
      method: "GET",
    });

    const text = await backendRes.text();

    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[status] proxy error", err);
    return NextResponse.json(
      { detail: "Proxy error in /api/status/[jobId]" },
      { status: 500 },
    );
  }
}
