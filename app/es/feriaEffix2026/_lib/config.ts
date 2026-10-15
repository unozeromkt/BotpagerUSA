export const campaign = {
  id: "effix_2026",
  code: "EFFIX50",
  discount: 50,
  startsAt: "2026-10-14T00:00:00-05:00",
  endsAt: "2026-10-21T00:00:00-05:00",
  timezone: "America/Bogota",
  policyVersion: "effix-2026-v1",
  contactConsent: "Autorizo a BotPager a contactarme por WhatsApp sobre esta solicitud, el beneficio EFFIX y mi demo",
  marketingConsent: "También quiero recibir novedades y ofertas de BotPager",
} as const;

export const jointExperience = {
  origin: "groovy-botpager",
  interest: "Groovy + BotPager: recorrido completo",
  contactConsent: "Autorizo a BotPager (Uno Zero Marketing LLC) a contactarme por WhatsApp sobre mi solicitud de Groovy + BotPager",
} as const;

export const sectors = [
  { id: "servicios", label: "Servicios profesionales", example: "un servicio para mi empresa", detail: "el tipo de servicio" },
  { id: "comercio", label: "Comercio y productos", example: "un producto de su catálogo", detail: "el producto y la cantidad" },
  { id: "salud", label: "Salud y bienestar", example: "sus servicios de bienestar", detail: "el servicio que te interesa, sin datos clínicos" },
  { id: "inmobiliaria", label: "Inmobiliaria", example: "una propiedad", detail: "la zona y el tipo de propiedad" },
  { id: "turismo", label: "Turismo y hoteles", example: "una experiencia de viaje", detail: "el destino y las fechas" },
  { id: "otro", label: "Otro negocio", example: "lo que ofrecen", detail: "lo que estás buscando" },
] as const;

export const goals = [
  { id: "cotizar", label: "Captar solicitudes de cotización", short: "Cotizaciones", question: "Quisiera una cotización", prompt: "¿Qué necesitas y para cuándo?", options: ["Lo necesito este mes", "Estoy comparando opciones"], response: "Perfecto. Tu necesidad y tu plazo quedarían organizados para que el equipo prepare una cotización.", result: "Una solicitud con contexto", detail: "Necesidad y plazo listos para tu equipo. Los precios los confirma tu negocio." },
  { id: "agendar", label: "Agendar más citas", short: "Citas", question: "Quiero conocer sus servicios", prompt: "¿Prefieres una cita o más información primero?", options: ["Quiero una cita", "Primero, más información"], response: "Claro. Según tu elección, el siguiente paso sería consultar el calendario conectado o compartir información aprobada.", result: "Un siguiente paso claro", detail: "Una cita se confirma únicamente cuando el calendario conectado devuelve una reserva real." },
  { id: "calificar", label: "Identificar clientes interesados", short: "Clientes interesados", question: "Me interesa su servicio", prompt: "¿Ya tienes un proyecto definido o estás explorando opciones?", options: ["Tengo un proyecto definido", "Estoy explorando opciones"], response: "Gracias. Tu equipo recibiría el interés y la etapa de esta consulta para continuar la conversación con contexto.", result: "El interés mejor organizado", detail: "Proyecto definido o exploración: contexto útil para priorizar la conversación humana." },
  { id: "seguimiento", label: "Dar seguimiento a consultas", short: "Seguimiento", question: "¿Me pueden ampliar la información?", prompt: "¿Quieres revisar tu caso ahora o que te contactemos después?", options: ["Revisemos mi caso", "Prefiero que me contacten"], response: "Entendido. El siguiente paso quedaría acordado y el contacto se solicitaría con tu autorización.", result: "Una conversación que continúa", detail: "Tu equipo sabe cuándo y cómo retomar una consulta autorizada." },
] as const;

export const countries = [
  { id: "CO", label: "Colombia", dial: "+57" },
  { id: "VE", label: "Venezuela", dial: "+58" },
  { id: "MX", label: "México", dial: "+52" },
  { id: "US", label: "Estados Unidos", dial: "+1" },
  { id: "EC", label: "Ecuador", dial: "+593" },
  { id: "PE", label: "Perú", dial: "+51" },
  { id: "PA", label: "Panamá", dial: "+507" },
  { id: "AR", label: "Argentina", dial: "+54" },
  { id: "CL", label: "Chile", dial: "+56" },
  { id: "ES", label: "España", dial: "+34" },
  { id: "OTHER", label: "Otro país (número con +)", dial: "" },
] as const;

export type SectorId = typeof sectors[number]["id"];
export type GoalId = typeof goals[number]["id"];
export type CampaignSettings = { live: boolean; bookingEnabled: boolean; requiresEmail: boolean; startsAt: string; endsAt: string };
export type LeadInput = {
  name: string; business: string; phone: string; country: string;
  origin?: "groovy-botpager"; sector?: SectorId; goal?: GoalId; consent: true; marketing: boolean;
  operationId: string; websiteTrap: string; tracking: Record<string, string>;
};
export type SavedLead = { receipt: string; benefit: boolean; expiresAt: string; business: string };
export type Booking = { id: string; startTime: string; endTime: string; timezone: string; meetingUrl?: string; rescheduleUrl?: string };

export function campaignOpen(now = Date.now()) {
  return now >= Date.parse(campaign.startsAt) && now < Date.parse(campaign.endsAt);
}
