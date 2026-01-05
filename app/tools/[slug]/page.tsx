// app/tools/[slug]/page.tsx
export const runtime = "edge";

export default function Page({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>tools route OK</h1>
      <p>slug: {params.slug}</p>
    </div>
  );
}
