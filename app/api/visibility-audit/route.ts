import { crawlWebsite } from "@/lib/visibility-audit/crawler";
import { scoreVisibilityAudit } from "@/lib/visibility-audit/scoring";
import { getVisibilityValidationMessage, parseVisibilityAuditInput } from "@/lib/visibility-audit/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requests = new Map<string, { count: number; expires: number }>();

function isRateLimited(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.expires < now) {
    requests.set(key, { count: 1, expires: now + 10 * 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 6;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return Response.json({ ok: false, message: "Too many audits were requested. Please try again in a few minutes." }, { status: 429 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_000) return Response.json({ ok: false, message: "The audit request is too large." }, { status: 413 });

  let input;
  try { input = parseVisibilityAuditInput(await request.json()); }
  catch (reason) { return Response.json({ ok: false, message: getVisibilityValidationMessage(reason) }, { status: 400 }); }

  try {
    const snapshot = await crawlWebsite(input);
    const report = scoreVisibilityAudit(input, snapshot);
    return Response.json({ ok: true, report }, { headers: { "Cache-Control": "no-store" } });
  } catch (reason) {
    console.error("[BotPager Visibility Audit] Scan failed.", reason);
    const message = reason instanceof Error && /public|website|homepage|redirect|resolve|open/i.test(reason.message)
      ? reason.message
      : "We could not complete the website scan. Check the URL and try again.";
    return Response.json({ ok: false, message }, { status: 422 });
  }
}
