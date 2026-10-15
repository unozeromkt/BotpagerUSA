import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { highLevelRequest } from "@/lib/integrations/highlevel";
import { effixCrm, firstEffixStage, getEffixConfig } from "./crm";
import { campaign, campaignOpen, jointExperience, goals, sectors, type Booking, type CampaignSettings, type LeadInput, type SavedLead } from "./config";
import { CampaignError } from "./http";
import { clean, parseEmail, safeUrl, validTimezone } from "./validation";

type Receipt = { contactId: string; opportunityId: string; business: string; operationId: string; benefit: boolean; expires: number };
type Opportunity = { id: string; name: string; pipelineId: string; contactId: string; pipelineStageId?: string; status?: string };
type Appointment = { id: string; contactId?: string; calendarId: string; startTime: string; endTime: string; appointmentStatus: string; title?: string; notes?: string; description?: string; address?: string; rescheduleUrl?: string };
const pending = new Map<string, Promise<unknown>>();

// Serializes retries within one server instance. Durable CRM lookups recover after restarts.
export async function serial<T>(key: string, action: () => Promise<T>): Promise<T> {
  const prior = pending.get(key) ?? Promise.resolve();
  const next = prior.catch(() => undefined).then(action);
  pending.set(key, next);
  try { return await next; } finally { if (pending.get(key) === next) pending.delete(key); }
}

export function settings(): CampaignSettings {
  return {
    live: Boolean(process.env.EFFIX_ENABLED === "true" && process.env.EFFIX_PRIVACY_APPROVED === "true" && getEffixConfig() && (process.env.EFFIX_RECEIPT_SECRET?.length ?? 0) >= 32 && process.env.GHL_USER_ID),
    bookingEnabled: Boolean(process.env.GHL_EFFIX_CALENDAR_ID && process.env.GHL_EFFIX_STAGE_BOOKED_ID),
    requiresEmail: process.env.EFFIX_CALENDAR_REQUIRES_EMAIL === "true",
    startsAt: campaign.startsAt, endsAt: campaign.endsAt,
  };
}

export function experienceSettings(): CampaignSettings {
  return settings();
}

function config() {
  const value = getEffixConfig();
  if (!experienceSettings().live || !value) throw new CampaignError("El registro todavía no está disponible. Puedes probar el recorrido y conversar con el asesor.", 503);
  return value;
}

function sign(data: Receipt) {
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = createHmac("sha256", process.env.EFFIX_RECEIPT_SECRET!).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function receipt(value: unknown): Receipt {
  config();
  if (typeof value !== "string" || value.length > 2000) throw new CampaignError("Primero registra tus datos.", 401);
  const [encoded, supplied, extra] = value.split(".");
  if (!encoded || !supplied || extra) throw new CampaignError("Primero registra tus datos.", 401);
  const expected = createHmac("sha256", process.env.EFFIX_RECEIPT_SECRET!).update(encoded).digest();
  const actual = Buffer.from(supplied, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new CampaignError("Primero registra tus datos.", 401);
  let data: Receipt;
  try { data = JSON.parse(Buffer.from(encoded, "base64url").toString()); } catch { throw new CampaignError("Primero registra tus datos.", 401); }
  if (!data.contactId || !data.opportunityId || !data.operationId || !Number.isFinite(data.expires) || data.expires < Date.now()) throw new CampaignError("Tu sesión venció. Registra tus datos nuevamente; tu contacto se conserva en el CRM.", 401);
  return data;
}

async function verifyOpportunity(data: Receipt) {
  const response = await highLevelRequest<{ opportunity: Opportunity }>(config(), `/opportunities/${encodeURIComponent(data.opportunityId)}`, { method: "GET" });
  if (response.opportunity?.contactId !== data.contactId || response.opportunity?.pipelineId !== effixCrm.pipelineId) throw new CampaignError("No pudimos verificar tu registro.", 403);
  return response.opportunity;
}

async function findOpportunity(contactId: string, name: string) {
  let page = 1;
  while (page <= 100) {
    const query = new URLSearchParams({ locationId: config().locationId, pipelineId: effixCrm.pipelineId, contactId, limit: "100", page: String(page) });
    const response = await highLevelRequest<{ opportunities: Opportunity[] }>(config(), `/opportunities/search?${query}`, { method: "GET" });
    if (!Array.isArray(response.opportunities)) throw new Error("Respuesta de oportunidades inválida.");
    const businessKey = name.split(" · ").at(-1);
    const match = response.opportunities.find(item => item.name.startsWith("EFFIX 2026 · ") && item.name.split(" · ").at(-1) === businessKey);
    if (match) return match;
    if (response.opportunities.length < 100) return undefined;
    page++;
  }
  throw new Error("No se pudo completar la búsqueda de oportunidades.");
}

async function saveNote(contactId: string, marker: string, body: string) {
  const response = await highLevelRequest<{ notes: { id: string; body: string }[] }>(config(), `/contacts/${encodeURIComponent(contactId)}/notes`, { method: "GET" });
  if (!Array.isArray(response.notes)) throw new Error("Respuesta de notas inválida.");
  if (response.notes.some(note => note.body?.includes(marker))) return;
  const note = await highLevelRequest<{ note: { id: string } }>(config(), `/contacts/${encodeURIComponent(contactId)}/notes`, {
    method: "POST", body: JSON.stringify({ userId: config().userId, body: `${marker}\n${body}` }),
  });
  if (!note.note?.id) throw new Error("No se guardó la nota de autorización.");
}

async function requestCouponEmail(contactId: string, email: string): Promise<NonNullable<SavedLead["confirmationEmail"]>> {
  const workflowId = process.env.GHL_EFFIX_COUPON_WORKFLOW_ID?.trim();
  if (!workflowId) return "pending";
  const marker = `EFFIX_CUPON_EMAIL:${campaign.id}:${createHash("sha256").update(email).digest("hex").slice(0, 16)}`;
  try {
    const response = await highLevelRequest<{ notes: { body: string }[] }>(config(), `/contacts/${encodeURIComponent(contactId)}/notes`, { method: "GET" });
    if (!Array.isArray(response.notes)) throw new Error("Respuesta de notas inválida.");
    if (response.notes.some(note => note.body?.includes(marker))) return "requested";
    const result = await highLevelRequest<{ succeeded?: boolean; succeded?: boolean }>(config(), `/contacts/${encodeURIComponent(contactId)}/workflow/${encodeURIComponent(workflowId)}`, {
      method: "POST", body: JSON.stringify({ eventStartTime: new Date(Date.now()).toISOString() }),
    });
    if (result.succeeded !== true && result.succeded !== true) throw new Error("Inscripción no confirmada.");
    // The workflow disables re-entry to prevent duplicate messages after an uncertain response.
    await saveNote(contactId, marker, `Confirmación del cupón ${campaign.code} solicitada al workflow ${workflowId}. Vigencia: ${campaign.endsAt} (límite exclusivo). No acredita entrega del correo.`);
    return "requested";
  } catch {
    console.error("[Feria Effix] Registro guardado; confirmación por correo pendiente.");
    return "pending";
  }
}

export async function saveLead(lead: LeadInput) {
  config();
  const joint = lead.origin === jointExperience.origin;
  const benefit = campaignOpen();
  if (!joint && !settings().live) throw new CampaignError("El registro de la campaña no está disponible.", 503);
  if (!joint && !campaignOpen()) throw new CampaignError("El beneficio se activa del 14 al 30 de octubre de 2026, hora de Colombia.", 409);
  if (lead.websiteTrap) throw new CampaignError("No pudimos registrar tus datos. Intenta de nuevo.");
  return serial(createHash("sha256").update(lead.phone).digest("hex"), async () => {
    const c = config();
    const firstStageId = await firstEffixStage(c);
    const contact = await highLevelRequest<{ contact: { id: string } }>(c, "/contacts/upsert", { method: "POST", body: JSON.stringify({
      locationId: c.locationId, firstName: lead.name.split(" ")[0], lastName: lead.name.split(" ").slice(1).join(" ") || undefined,
      email: lead.email, phone: lead.phone, country: lead.country, source: "Feria Effix 2026", createNewIfDuplicateAllowed: false,
    }) });
    if (!contact.contact?.id) throw new Error("No se guardó el contacto.");
    // Each business has its own opportunity, even when it shares the same phone/contact.
    const businessKey = createHash("sha256").update(lead.business.normalize("NFKC").toLocaleLowerCase("es")).digest("hex").slice(0, 16);
    const name = `EFFIX 2026 · ${lead.business.slice(0, 80)} · ${businessKey}`;
    let opportunity = await findOpportunity(contact.contact.id, name);
    if (!opportunity) {
      const response = await highLevelRequest<{ opportunity: Opportunity }>(c, "/opportunities/", { method: "POST", body: JSON.stringify({
        locationId: c.locationId, pipelineId: effixCrm.pipelineId, pipelineStageId: firstStageId,
        name, contactId: contact.contact.id, status: "open", assignedTo: c.userId,
      }) });
      opportunity = response.opportunity;
    }
    if (!opportunity?.id) throw new Error("No se guardó la oportunidad.");
    let sellers: Record<string, string> = {};
    try { sellers = JSON.parse(process.env.EFFIX_SELLERS_JSON || "{}"); } catch { throw new Error("Configuración de vendedores inválida."); }
    const seller = typeof sellers[lead.tracking.tag_id] === "string" ? sellers[lead.tracking.tag_id] : "Sin atribuir";
    const tracking: Record<string, string> = { ...lead.tracking, vendedor: seller };
    const snapshotKey = createHash("sha256").update(JSON.stringify(lead)).digest("hex").slice(0, 16);
    const marker = `EFFIX_REGISTRO:${lead.operationId}:${snapshotKey}`;
    await saveNote(contact.contact.id, marker, JSON.stringify({
      campaign: campaign.id, business: lead.business, opportunityId: opportunity.id, sector: lead.sector, objective: lead.goal, tracking,
      email: lead.email, origin: lead.origin, interest: joint ? jointExperience.interest : undefined,
      contactConsent: { granted: true, text: joint ? jointExperience.contactConsent : campaign.contactConsent }, marketingConsent: { granted: lead.marketing, text: campaign.marketingConsent },
      policyVersion: campaign.policyVersion, capturedAt: new Date().toISOString(), benefit: benefit ? { code: campaign.code, discount: campaign.discount, endsAt: campaign.endsAt } : undefined,
    }, null, 2));
    const values: Record<string, string> = {
      business: lead.business,
      ...(!joint ? { sector: sectors.find(item => item.id === lead.sector)!.label, objective: goals.find(item => item.id === lead.goal)!.label } : {}), origin: tracking.utm_medium || "enlace", seller,
      contact_consent: "Sí", marketing_consent: lead.marketing ? "Sí" : "No", consent_at: new Date().toISOString(),
      ...(benefit ? { benefit_code: campaign.code, benefit_expires_at: campaign.endsAt } : {}), policy_version: campaign.policyVersion, operation_id: lead.operationId,
    };
    let fieldIds: Record<string, string> = {};
    try { fieldIds = JSON.parse(process.env.GHL_EFFIX_FIELDS_JSON || "{}"); } catch { throw new Error("Configuración de campos inválida."); }
    const customFields = Object.entries(values).flatMap(([key, value]) => typeof fieldIds[key] === "string" && fieldIds[key] ? [{ id: fieldIds[key], fieldValue: value }] : []);
    if (customFields.length) await highLevelRequest(c, `/opportunities/${encodeURIComponent(opportunity.id)}`, { method: "PUT", body: JSON.stringify({ customFields }) });
    // Trigger only after the opportunity and consent record are durable.
    if (!joint) await highLevelRequest(c, `/contacts/${encodeURIComponent(contact.contact.id)}/tags`, { method: "POST", body: JSON.stringify({ tags: [campaign.id, `sector_${lead.sector}`, `objetivo_${lead.goal}`, `origen_${["nfc", "qr"].includes(lead.tracking.utm_medium) ? lead.tracking.utm_medium : "enlace"}`, "effix_beneficio_activo"] }) });
    const data: Receipt = { contactId: contact.contact.id, opportunityId: opportunity.id, business: lead.business, operationId: lead.operationId, benefit, expires: Date.now() + 24 * 60 * 60_000 };
    const confirmationEmail = benefit ? await requestCouponEmail(contact.contact.id, lead.email) : "not_applicable";
    return { receipt: sign(data), benefit, expiresAt: benefit ? campaign.endsAt : new Date(data.expires).toISOString(), business: lead.business, email: lead.email, confirmationEmail };
  });
}

export async function slots(timezone: string, start = Date.now()) {
  const c = config();
  if (!settings().bookingEnabled) throw new CampaignError("Puedes pedir que coordinemos tu demo por WhatsApp.", 503);
  const query = new URLSearchParams({ startDate: String(start), endDate: String(start + 7 * 86400_000), timezone: validTimezone(timezone), duration: "15" });
  const data = await highLevelRequest<Record<string, { slots?: string[] }>>(c, `/calendars/${encodeURIComponent(process.env.GHL_EFFIX_CALENDAR_ID!)}/free-slots?${query}`, { method: "GET" });
  return [...new Set(Object.values(data).flatMap(item => Array.isArray(item?.slots) ? item.slots : []))].filter(item => Number.isFinite(Date.parse(item)) && Date.parse(item) > Date.now()).sort((a,b) => Date.parse(a)-Date.parse(b));
}

function bookingResult(event: Appointment, timezone: string): Booking {
  if (!event.id || !["confirmed", "active"].includes(event.appointmentStatus) || !Number.isFinite(Date.parse(event.startTime)) || !Number.isFinite(Date.parse(event.endTime))) throw new Error("La cita aún no está confirmada.");
  return { id: event.id, startTime: event.startTime, endTime: event.endTime, timezone, meetingUrl: safeUrl(event.address), rescheduleUrl: safeUrl(event.rescheduleUrl) };
}

async function advance(data: Receipt, stageId: string | undefined) {
  if (!stageId) throw new Error("Etapa pendiente de configuración.");
  const current = await verifyOpportunity(data);
  // Repeated registrations and requests do not reopen won/lost opportunities.
  if (current.status !== "open") return;
  await highLevelRequest(config(), `/opportunities/${encodeURIComponent(data.opportunityId)}`, { method: "PUT", body: JSON.stringify({ pipelineStageId: stageId }) });
}

export async function book(data: Receipt, input: Record<string, unknown>) {
  if (!settings().bookingEnabled) throw new CampaignError("La agenda no está disponible. Podemos coordinar por WhatsApp.", 503);
  const timezone = validTimezone(input.timezone);
  const startTime = clean(input.startTime, 80);
  if (!Number.isFinite(Date.parse(startTime))) throw new CampaignError("Selecciona un horario disponible.");
  let email = "";
  if (settings().requiresEmail || input.email) {
    try { email = parseEmail(input.email); } catch { throw new CampaignError("Ingresa un correo válido para recibir la invitación."); }
  }
  const website = clean(input.website, 240);
  if (website && !safeUrl(website)) throw new CampaignError("Ingresa el enlace completo de tu web o Instagram, empezando por https://.");
  return serial(data.opportunityId, async () => {
    await verifyOpportunity(data);
    const marker = `EFFIX_DEMO:${data.opportunityId}`;
    const existing = await highLevelRequest<{ events: Appointment[] }>(config(), `/contacts/${encodeURIComponent(data.contactId)}/appointments`, { method: "GET" });
    if (!Array.isArray(existing.events)) throw new Error("No se pudo verificar las reservas previas.");
    let event: Appointment | undefined;
    for (const item of existing.events.filter(item => item.calendarId === process.env.GHL_EFFIX_CALENDAR_ID && (item.title?.endsWith(` · ${data.opportunityId}`) || item.description?.includes(marker) || item.notes?.includes(marker)))) {
      const full = (await highLevelRequest<{ event: Appointment }>(config(), `/calendars/events/appointments/${encodeURIComponent(item.id)}`, { method: "GET" })).event;
      if (full && ["confirmed", "active"].includes(full.appointmentStatus) && Date.parse(full.startTime) > Date.now()) { event = full; break; }
    }
    if (!event) {
      const available = await slots(timezone, Date.parse(startTime) - 1000);
      if (!available.some(item => Date.parse(item) === Date.parse(startTime))) throw new CampaignError("Ese horario ya no está disponible. Actualiza los horarios y elige otro.", 409);
      if (email) await highLevelRequest(config(), `/contacts/${encodeURIComponent(data.contactId)}`, { method: "PUT", body: JSON.stringify({ email }) });
      if (website) await saveNote(data.contactId, `EFFIX_PREPARACION:${data.operationId}`, `Negocio: ${data.business}\nWeb o Instagram: ${website}`);
      event = await highLevelRequest<Appointment>(config(), "/calendars/events/appointments", { method: "POST", body: JSON.stringify({
        calendarId: process.env.GHL_EFFIX_CALENDAR_ID, locationId: config().locationId, contactId: data.contactId,
        title: `Demo BotPager · ${data.business} · ${data.opportunityId}`, description: `${marker}\nDemo de 15 minutos · Feria Effix 2026`,
        startTime, endTime: new Date(Date.parse(startTime) + 15 * 60_000).toISOString(), appointmentStatus: "confirmed",
        ignoreDateRange: false, ignoreFreeSlotValidation: false, toNotify: true,
      }) });
    }
    const result = bookingResult(event, timezone);
    if (event.calendarId !== process.env.GHL_EFFIX_CALENDAR_ID || (event.contactId && event.contactId !== data.contactId)) throw new Error("La reserva no corresponde al registro.");
    let stageSynced = true;
    try { await advance(data, process.env.GHL_EFFIX_STAGE_BOOKED_ID); } catch { stageSynced = false; console.error("[Feria Effix] Cita guardada; pendiente sincronizar etapa."); }
    return { booking: result, stageSynced };
  });
}

export async function coordinate(data: Receipt) {
  if (!process.env.GHL_EFFIX_STAGE_COORDINATION_ID) throw new CampaignError("No pudimos registrar la coordinación. Intenta de nuevo más tarde.", 503);
  return serial(data.opportunityId, async () => {
    const opportunity = await verifyOpportunity(data);
    if (opportunity.pipelineStageId === process.env.GHL_EFFIX_STAGE_BOOKED_ID) throw new CampaignError("Tu demo ya está agendada. Usa las opciones de tu confirmación para cambiarla.", 409);
    const marker = `EFFIX_COORDINAR:${data.opportunityId}`;
    const existing = await highLevelRequest<{ tasks: { id: string; body?: string }[] }>(config(), `/contacts/${encodeURIComponent(data.contactId)}/tasks`, { method: "GET" });
    if (!Array.isArray(existing.tasks)) throw new Error("No pudimos verificar las tareas.");
    let task = existing.tasks.find(item => item.body?.includes(marker));
    if (!task) {
      const response = await highLevelRequest<{ task: { id: string } }>(config(), `/contacts/${encodeURIComponent(data.contactId)}/tasks`, { method: "POST", body: JSON.stringify({
        title: `Coordinar demo por WhatsApp · ${data.business}`, body: `${marker}\nContacto autorizado para esta solicitud. Consultar la nota EFFIX del negocio antes de contactar.`,
        completed: false, dueDate: new Date(Date.now() + 24 * 60 * 60_000).toISOString(), assignedTo: config().userId,
      }) });
      task = response.task;
    }
    if (!task?.id) throw new Error("No se creó la tarea.");
    let stageSynced = true;
    try { await advance(data, process.env.GHL_EFFIX_STAGE_COORDINATION_ID); } catch { stageSynced = false; console.error("[Feria Effix] Tarea guardada; pendiente sincronizar etapa."); }
    return { taskId: task.id, stageSynced };
  });
}
