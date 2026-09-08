import { isHighLevelConfigured, saveVisibilityAuditLead } from "@/lib/integrations/highlevel";
import { getVisibilityValidationMessage, parseVisibilityLead, parseVisibilityReport } from "@/lib/visibility-audit/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32_000) return Response.json({ ok: false, message: "The report request is too large." }, { status: 413 });
  let lead;
  let report;
  try {
    const payload = await request.json() as { lead?: unknown; report?: unknown };
    lead = parseVisibilityLead(payload.lead);
    report = parseVisibilityReport(payload.report);
  } catch (reason) {
    return Response.json({ ok: false, message: getVisibilityValidationMessage(reason) }, { status: 400 });
  }

  if (lead.websiteTrap) return Response.json({ ok: true, delivery: "preview", message: "Your report is ready." });
  try {
    const contact = await saveVisibilityAuditLead(lead, report);
    return Response.json({
      ok: true,
      delivery: contact ? "crm_saved" : "preview",
      message: contact ? "Your full report is ready." : "Preview mode is active until GoHighLevel is connected.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (reason) {
    console.error("[BotPager Visibility Audit] Lead delivery failed.", reason);
    return Response.json({
      ok: true,
      delivery: isHighLevelConfigured() ? "failed" : "preview",
      message: "Your report is ready. Contact delivery is temporarily pending.",
    }, { headers: { "Cache-Control": "no-store" } });
  }
}
