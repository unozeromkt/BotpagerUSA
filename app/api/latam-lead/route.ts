import { isHighLevelConfigured, saveLatamLead } from "@/lib/integrations/highlevel";
import { getLatamService } from "@/lib/latam/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LatamLead = {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  interest: string;
  website: string;
  consent: boolean;
  lastName2: string;
  tracking: Record<string, string>;
};

function cleanString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseLead(value: unknown): LatamLead {
  if (!value || typeof value !== "object") throw new Error("Solicitud inválida.");
  const input = value as Record<string, unknown>;
  const rawTracking = input.tracking && typeof input.tracking === "object" ? input.tracking as Record<string, unknown> : {};
  const tracking = Object.fromEntries(
    Object.entries(rawTracking).slice(0, 12).map(([key, item]) => [cleanString(key, 40), cleanString(item, 500)]).filter(([key, item]) => key && item),
  );
  const lead: LatamLead = {
    name: cleanString(input.name, 100),
    company: cleanString(input.company, 120),
    email: cleanString(input.email, 160).toLowerCase(),
    phone: cleanString(input.phone, 40),
    country: cleanString(input.country, 10).toUpperCase(),
    interest: cleanString(input.interest, 60),
    website: cleanString(input.website, 240),
    consent: input.consent === true,
    lastName2: cleanString(input.lastName2, 100),
    tracking,
  };

  if (!lead.name || !lead.company || !lead.email || !lead.country || !lead.interest) throw new Error("Completa los campos obligatorios.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new Error("Ingresa un email válido.");
  if (!getLatamService(lead.interest)) throw new Error("Selecciona una solución válida.");
  if (!lead.consent) throw new Error("Debes aceptar el uso de tus datos para solicitar el diagnóstico.");
  return lead;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) return Response.json({ ok: false, message: "La solicitud es demasiado grande." }, { status: 413 });

  let lead: LatamLead;
  try {
    lead = parseLead(await request.json());
  } catch (reason) {
    return Response.json({ ok: false, message: reason instanceof Error ? reason.message : "Revisa los datos enviados." }, { status: 400 });
  }

  if (lead.lastName2) return Response.json({ ok: true, delivery: "filtered", message: "Recibimos tu solicitud." });

  try {
    const contact = await saveLatamLead(lead);
    return Response.json({
      ok: true,
      delivery: contact ? "crm_saved" : "preview",
      message: contact
        ? "Recibimos tu solicitud. Nuestro equipo revisará la información y te contactará pronto."
        : "Recibimos tu solicitud. La conexión con el CRM está en modo de vista previa.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (reason) {
    console.error("[BotPager LATAM] No se pudo guardar el contacto.", reason);
    return Response.json({
      ok: false,
      delivery: isHighLevelConfigured() ? "failed" : "preview",
      message: "No pudimos enviar tu solicitud en este momento. Intenta nuevamente o escríbenos a info@botpager.com.",
    }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
