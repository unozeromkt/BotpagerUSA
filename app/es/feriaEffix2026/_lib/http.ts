import "server-only";

export class CampaignError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const requests = new Map<string, { count: number; reset: number }>();

export async function readRequest(request: Request) {
  const origin = request.headers.get("origin");
  // Next can normalize request.url to localhost behind a proxy; Host is the browser-facing authority.
  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (origin) {
    let allowed = false;
    try { const url = new URL(origin); allowed = ["https:", "http:"].includes(url.protocol) && url.host === host; } catch { /* Invalid origin stays rejected. */ }
    if (!allowed) throw new CampaignError("Abre el formulario desde la página de la campaña.", 403);
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new CampaignError("Solicitud no autorizada.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new CampaignError("Solicitud inválida.", 415);
  // A per-instance guard; deployment-level rate limiting is documented separately.
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  for (const [ip, item] of requests) if (item.reset < now) requests.delete(ip);
  const item = requests.get(key) ?? { count: 0, reset: now + 60_000 };
  item.count++; requests.set(key, item);
  if (item.count > 20) throw new CampaignError("Espera un minuto antes de intentar de nuevo.", 429);
  if (Number(request.headers.get("content-length")) > 12_000) throw new CampaignError("La solicitud es demasiado grande.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CampaignError("Solicitud inválida.");
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > 12_000) { await reader.cancel(); throw new CampaignError("La solicitud es demasiado grande.", 413); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>; } catch { throw new CampaignError("Revisa los datos enviados."); }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function failure(error: unknown) {
  if (error instanceof CampaignError) return json({ ok: false, message: error.message }, error.status);
  // Do not log upstream bodies, contacts, phone numbers or receipt tokens.
  console.error("[Feria Effix] La operación no pudo completarse.");
  return json({ ok: false, message: "No pudimos completar la solicitud. Conservamos tus datos en esta pantalla; intenta de nuevo." }, 502);
}
