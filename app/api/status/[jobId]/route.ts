const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://37.27.181.162:8000";

type Params = {
  params: { jobId: string };
};

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  const { jobId } = params;

  const resp = await fetch(`${BACKEND_ORIGIN}/api/status/${jobId}`, {
    method: "GET",
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