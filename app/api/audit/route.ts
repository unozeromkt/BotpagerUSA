import { generateAuditReport } from "@/lib/ai/generate-audit";
import { getValidationMessage, parseAuditSubmission } from "@/lib/audit/validation";
import {
  completeAuditContact,
  isHighLevelConfigured,
  markAuditContactFailed,
  upsertAuditContact,
} from "@/lib/integrations/highlevel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24_000) {
    return Response.json({ ok: false, message: "The audit request is too large." }, { status: 413 });
  }

  let submission;
  try {
    submission = parseAuditSubmission(await request.json());
  } catch (reason) {
    return Response.json({ ok: false, message: getValidationMessage(reason) }, { status: 400 });
  }

  if (submission.contact.websiteTrap) {
    return Response.json({ ok: true, delivery: "preview", message: "Your audit is ready." });
  }

  let contact = null;
  try {
    contact = await upsertAuditContact(submission);
  } catch (error) {
    console.error("[BotPager Audit] Contact upsert failed.", error);
    contact = null;
  }

  try {
    const { report } = await generateAuditReport(submission.business, submission.answers);

    if (!contact) {
      return Response.json(
        {
          ok: true,
          report,
          delivery: isHighLevelConfigured() ? "failed" : "preview",
          message: isHighLevelConfigured()
            ? "Your report is ready, but email delivery is pending."
            : "Preview mode is active until GoHighLevel is connected.",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const completion = await completeAuditContact(contact, submission, report);
    if (completion.warnings.length) {
      console.warn("[BotPager Audit] CRM completion warnings.", completion.warnings);
    }
    const delivery = completion.emailQueued ? "queued" : "crm_saved";
    return Response.json(
      {
        ok: true,
        report,
        delivery,
        message: completion.emailQueued
          ? "A copy of your audit is on its way."
          : "Your audit was saved. Email delivery is still being configured.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[BotPager Audit] Report generation failed.", error);
    if (contact) await markAuditContactFailed(contact);
    return Response.json(
      { ok: false, delivery: "failed", message: "We could not finish the audit. Please try again." },
      { status: 502 },
    );
  }
}
