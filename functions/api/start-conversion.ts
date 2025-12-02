export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  const backend = env.BACKEND_ORIGIN || "http://37.27.181.162:8000";

  const body = await request.text();

  const resp = await fetch(`${backend}/api/start-conversion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: {
      "Content-Type":
        resp.headers.get("content-type") || "application/json",
    },
  });
}