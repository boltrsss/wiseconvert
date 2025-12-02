import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BACKEND_BASE_URL = "http://37.27.181.162:8000"; // FastAPI backend

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_BASE_URL}/api/start-conversion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await backendRes.text();

    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[start-conversion] proxy error", err);
    return NextResponse.json(
      { detail: "Proxy error in /api/start-conversion" },
      { status: 500 },
    );
  }
}
