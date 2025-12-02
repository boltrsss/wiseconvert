export async function onRequestGet(context: any): Promise<Response> {
  const { env, params } = context;

  const backend = env.BACKEND_ORIGIN || "http://37.27.181.162:8000";

  const jobId = params.jobId;

  const resp = await fetch(`${backend}/api/status/${jobId}`, {
    method: "GET",
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: {
      "Content-Type":
        resp.headers.get("content-type") || "application/json",
    },
  });
}