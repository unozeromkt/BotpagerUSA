import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";
import { countries, goals, sectors, type LeadInput } from "./config";

export function clean(value: unknown, max = 120) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().replace(/\s+/g, " ").slice(0, max) : "";
}

export function parseLead(input: unknown): LeadInput {
  if (!input || typeof input !== "object") throw new Error("Revisa los datos enviados.");
  const data = input as Record<string, unknown>;
  const joint = data.origin === "groovy-botpager";
  const name = clean(data.name, 100), business = clean(data.business, 120);
  if (joint && (business.length < 1 || business.length > 50)) throw new Error("El negocio debe tener entre 1 y 50 caracteres.");
  if (name.length < 2 || business.length < (joint ? 1 : 2)) throw new Error("Completa tu nombre y el nombre de tu negocio.");
  const sector = joint ? undefined : sectors.find(item => item.id === data.sector)?.id;
  const goal = joint ? undefined : goals.find(item => item.id === data.goal)?.id;
  if (!joint && (!sector || !goal)) throw new Error("Selecciona un sector y un objetivo válidos.");
  const country = countries.find(item => item.id === data.country)?.id;
  if (!country) throw new Error("Selecciona el país de tu WhatsApp.");
  const rawPhone = clean(data.phone, 40);
  const phone = parsePhoneNumberFromString(rawPhone, country === "OTHER" ? undefined : country as CountryCode);
  if (!phone?.isValid() || (country === "OTHER" && !rawPhone.startsWith("+")) || (country !== "OTHER" && phone.country !== country)) {
    throw new Error("Ingresa un WhatsApp válido para el país seleccionado, con su código internacional.");
  }
  if (data.consent !== true) throw new Error("Autoriza el contacto sobre tu solicitud para continuar.");
  const operationId = clean(data.operationId, 40);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(operationId)) throw new Error("Actualiza la página e intenta de nuevo.");
  const rawTracking = data.tracking && typeof data.tracking === "object" ? data.tracking as Record<string, unknown> : {};
  // Attribution values never receive free text or personal information.
  const tracking = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "tag_id"].flatMap(key => {
    const value = clean(rawTracking[key], 80);
    return /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? [[key, value]] : [];
  }));
  return { ...(joint ? { origin: "groovy-botpager" as const } : {}), name, business, phone: phone.number, country: phone.country ?? country, sector, goal, consent: true, marketing: data.marketing === true, operationId, websiteTrap: clean(data.websiteTrap), tracking };
}

export function validTimezone(value: unknown) {
  const timezone = clean(value, 80) || "America/Bogota";
  try { new Intl.DateTimeFormat("es-CO", { timeZone: timezone }).format(); } catch { throw new Error("Selecciona una zona horaria válida."); }
  return timezone;
}

export function safeUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.toString() : undefined; } catch { return undefined; }
}
