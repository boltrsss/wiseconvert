import { NextRequest } from "next/server";

export const runtime = "edge";

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://37.27.181.162:8000";

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.text();

  const resp = await fetch(`${BACKEND_ORIGIN}/api/get-upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await resp.text();

  return new Response(text, {
    status: resp.status,
    headers: {
      "Content-Type":
        resp.headers.get("content-type") ?? "application/json",
    },
  });
}
