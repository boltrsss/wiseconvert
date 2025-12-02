import { NextRequest } from "next/server";

export const runtime = "edge";

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://37.27.181.162:8000";

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.text();

  // 把原本的 headers 拿來用（但 host 要給後端自己的）
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers[key] = value;
    }
  });
  // 確保 content-type 是 json
  headers["content-type"] = "application/json";

  const backendResp = await fetch(`${BACKEND_ORIGIN}/api/get-upload-url`, {
    method: "POST",
    headers,
    body,
  });

  const text = await backendResp.text();

  return new Response(text, {
    status: backendResp.status,
    headers: {
      "content-type":
        backendResp.headers.get("content-type") ?? "application/json",
    },
  });
}
