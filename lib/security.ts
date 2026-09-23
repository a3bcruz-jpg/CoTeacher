export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const expected = configured || new URL(request.url).origin;
  return origin === expected;
}

export function originError() {
  return new Response(JSON.stringify({ error: "Invalid request origin." }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
