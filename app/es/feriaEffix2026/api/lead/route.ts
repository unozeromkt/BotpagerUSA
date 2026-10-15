import { failure, json, readRequest, CampaignError } from "../../_lib/http";
import { saveLead } from "../../_lib/server";
import { parseLead } from "../../_lib/validation";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = await readRequest(request);
    let lead;
    try { lead = parseLead(input); } catch (error) { throw new CampaignError(error instanceof Error ? error.message : "Revisa tus datos."); }
    return json({ ok: true, lead: await saveLead(lead) });
  } catch (error) { return failure(error); }
}
