// app/api/start-conversion/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// 直接打你 FastAPI 的內網 / IP
const BACKEND_BASE_URL = "http://37.27.181.162:8000"; // FastAPI backend

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body 內預期有：s3_key, target_format, settings(可選，影片進階設定)

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
        "Content-Type":
          backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[start-conversion] proxy error", err);
    return NextResponse.json(
      { detail: "Proxy error in /api/start-conversion" },
      { status: 500 }
    );
  }
}
