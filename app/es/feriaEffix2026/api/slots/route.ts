import { CampaignError, failure, json, readRequest } from "../../_lib/http";
import { receipt, slots } from "../../_lib/server";
import { validTimezone } from "../../_lib/validation";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = await readRequest(request); receipt(input.receipt);
    let timezone;
    try { timezone = validTimezone(input.timezone); } catch { throw new CampaignError("Selecciona una zona horaria válida."); }
    const start = typeof input.start === "number" ? input.start : Date.now();
    if (!Number.isFinite(start) || start < Date.now() - 60_000 || start > Date.now() + 90 * 86400_000) throw new CampaignError("Selecciona una fecha dentro de los próximos 90 días.");
    return json({ ok: true, slots: await slots(timezone, start), timezone });
  } catch (error) { return failure(error); }
}
