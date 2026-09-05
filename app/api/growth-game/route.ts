import { getGrowthValidationMessage, parseGrowthSubmission } from "@/lib/growth-game/validation";
import { isHighLevelConfigured, saveGrowthGameLead } from "@/lib/integrations/highlevel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24_000) {
    return Response.json({ ok: false, message: "The growth game request is too large." }, { status: 413 });
  }

  let parsed;
  try {
    parsed = parseGrowthSubmission(await request.json());
  } catch (reason) {
    return Response.json({ ok: false, message: getGrowthValidationMessage(reason) }, { status: 400 });
  }

  const { submission, result } = parsed;
  if (submission.contact.websiteTrap) {
    return Response.json({ ok: true, result, delivery: "preview", message: "Your growth plan is ready." });
  }

  try {
    const contact = await saveGrowthGameLead(submission, result);
    const delivery = contact ? "crm_saved" : "preview";
    return Response.json(
      {
        ok: true,
        result,
        delivery,
        message: contact
          ? `Your plan has been saved for ${submission.contact.businessName}.`
          : "Your growth plan is ready.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[BotPager Growth Game] Lead delivery failed.", error);
    return Response.json(
      {
        ok: true,
        result,
        delivery: isHighLevelConfigured() ? "failed" : "preview",
        message: "Your plan is ready. We had trouble saving your contact details, so please keep this page open.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
