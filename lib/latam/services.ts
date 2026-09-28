export type LatamServiceSlug =
  | "smart-website"
  | "agente-ia"
  | "seo-geo"
  | "crm-automatizacion";

export type LatamService = {
  slug: LatamServiceSlug;
  number: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  cardTitle: string;
  cardText: string;
  cardCta: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  problemTitle: string;
  problemText: string;
  solutionTitle: string;
  solutionText: string;
  features: { title: string; text: string }[];
  benefits: string[];
  integrationText: string;
  related: LatamServiceSlug[];
};

export const latamServices: LatamService[] = [
  {
    slug: "smart-website",
    number: "01",
    name: "Smart Website",
    eyebrow: "Páginas web inteligentes para empresas",
    title: "Tu página web debería ayudarte a generar clientes, no simplemente existir.",
    description:
      "Creamos páginas web inteligentes que convierten visitas en oportunidades, inician conversaciones y conectan cada contacto con tu proceso comercial.",
    cardTitle: "Una página web diseñada para generar oportunidades",
    cardText:
      "Convierte tu sitio web en una herramienta comercial capaz de captar prospectos, iniciar conversaciones y dirigirlos hacia la acción.",
    cardCta: "Conocer Smart Website",
    seoTitle: "Páginas Web Inteligentes para Empresas en Latinoamérica",
    seoDescription:
      "Páginas web inteligentes para empresas que buscan captar prospectos, generar oportunidades y conectar cada contacto con atención y seguimiento comercial.",
    keywords: ["páginas web inteligentes", "páginas web para empresas", "sitios web que generan leads"],
    problemTitle: "Una web informativa no siempre impulsa el siguiente paso",
    problemText:
      "Muchos sitios presentan servicios, pero dejan al visitante sin una ruta clara para preguntar, cotizar o agendar. Cuando los formularios y conversaciones están desconectados, las oportunidades se enfrían.",
    solutionTitle: "Una experiencia creada alrededor de la conversión",
    solutionText:
      "BotPager organiza el contenido, las llamadas a la acción y la captura de datos para que cada visita tenga un siguiente paso. Los contactos pueden llegar al CRM, activar una respuesta y continuar con seguimiento.",
    features: [
      { title: "Estructura comercial clara", text: "Servicios, beneficios y próximos pasos fáciles de entender desde cualquier dispositivo." },
      { title: "Captación conectada", text: "Formularios, WhatsApp y acciones clave vinculados con atención y seguimiento." },
      { title: "Medición de oportunidades", text: "Eventos y fuentes organizados para saber qué canales generan conversaciones." },
      { title: "Base preparada para crecer", text: "Arquitectura lista para integrar contenidos, campañas, IA y automatizaciones." },
    ],
    benefits: ["Más conversaciones calificadas", "Menos fricción para contactar", "Mejor visibilidad del recorrido comercial"],
    integrationText:
      "La Smart Website recibe la demanda creada por SEO y GEO, inicia la conversación con el Agente IA y envía cada oportunidad al CRM para su seguimiento.",
    related: ["agente-ia", "seo-geo", "crm-automatizacion"],
  },
  {
    slug: "agente-ia",
    number: "02",
    name: "Agente IA",
    eyebrow: "Agente de inteligencia artificial para empresas",
    title: "Atiende más prospectos sin depender de que alguien esté disponible todo el tiempo.",
    description:
      "Un agente IA omnicanal responde consultas, captura información y ayuda a orientar oportunidades 24/7, con especial énfasis en WhatsApp para Latinoamérica.",
    cardTitle: "Atiende tus oportunidades 24/7",
    cardText:
      "Responde consultas, captura información y atiende prospectos automáticamente desde canales como web, WhatsApp, email y otros puntos de contacto.",
    cardCta: "Conocer Agente IA",
    seoTitle: "Agente IA para Empresas y Atención por WhatsApp",
    seoDescription:
      "Agente de inteligencia artificial para empresas: automatiza la atención por WhatsApp, web y otros canales, captura datos y responde prospectos 24/7.",
    keywords: ["agente IA para empresas", "automatización de atención", "agente IA WhatsApp"],
    problemTitle: "Las oportunidades no siempre llegan en horario de oficina",
    problemText:
      "Un prospecto que espera demasiado suele buscar otra opción. El volumen de preguntas repetitivas también consume tiempo y dificulta priorizar las conversaciones con mayor potencial.",
    solutionTitle: "Respuesta inmediata con reglas claras para escalar",
    solutionText:
      "Configuramos un agente con información aprobada de tu empresa para responder, recopilar datos y orientar el siguiente paso. Cuando una conversación requiere criterio humano, la transfiere con contexto.",
    features: [
      { title: "WhatsApp y web", text: "Atención consistente en los canales que tus prospectos ya utilizan." },
      { title: "Respuesta 24/7", text: "Primera atención inmediata, incluso fuera del horario de tu equipo." },
      { title: "Captura y calificación", text: "Recopila datos, necesidad, urgencia y otra información relevante." },
      { title: "Transferencia humana", text: "Escala conversaciones según reglas, intención y nivel de complejidad." },
    ],
    benefits: ["Menor tiempo de respuesta", "Más oportunidades atendidas", "Equipo enfocado en conversaciones de valor"],
    integrationText:
      "El Agente IA recibe conversaciones desde la Smart Website y otros canales, registra la información en el CRM y activa seguimientos automáticos cuando corresponde.",
    related: ["smart-website", "crm-automatizacion", "seo-geo"],
  },
  {
    slug: "seo-geo",
    number: "03",
    name: "SEO + GEO",
    eyebrow: "Posicionamiento en Google e inteligencia artificial",
    title: "Haz que tu empresa sea encontrada tanto en Google como en la nueva generación de buscadores con IA.",
    description:
      "Fortalecemos tu posicionamiento SEO y organizamos la información de tu empresa para mejorar su presencia en buscadores tradicionales y experiencias impulsadas por inteligencia artificial.",
    cardTitle: "Haz que tu empresa aparezca donde tus clientes buscan",
    cardText:
      "Mejoramos la visibilidad de tu empresa en Google y optimizamos su presencia para los nuevos entornos de búsqueda impulsados por inteligencia artificial.",
    cardCta: "Conocer SEO + GEO",
    seoTitle: "Posicionamiento SEO y GEO para Empresas en Latinoamérica",
    seoDescription:
      "Servicios de posicionamiento SEO, Google y GEO para que empresas de Latinoamérica mejoren su visibilidad en buscadores y respuestas generadas por IA.",
    keywords: ["posicionamiento SEO", "posicionamiento en Google", "GEO", "posicionamiento en inteligencia artificial"],
    problemTitle: "Si tu empresa no aparece, la oportunidad comienza con otro proveedor",
    problemText:
      "Una arquitectura confusa, contenido genérico o información comercial inconsistente dificultan que Google y los nuevos sistemas de búsqueda comprendan qué ofreces y para quién es relevante.",
    solutionTitle: "Una base de visibilidad pensada para personas y buscadores",
    solutionText:
      "Alineamos estructura técnica, intención de búsqueda, contenido útil y señales claras de entidad. GEO complementa el SEO para que la información también sea fácil de interpretar en entornos de IA.",
    features: [
      { title: "Arquitectura SEO", text: "Páginas e internal linking organizados alrededor de servicios e intención real." },
      { title: "Contenido útil", text: "Respuestas claras a las preguntas que influyen en una decisión comercial." },
      { title: "SEO técnico", text: "Indexación, metadata, rendimiento y datos estructurados revisados." },
      { title: "Preparación GEO", text: "Información consistente y comprensible para experiencias de búsqueda con IA." },
    ],
    benefits: ["Mayor visibilidad relevante", "Mejor comprensión de tu oferta", "Una presencia preparada para nuevas búsquedas"],
    integrationText:
      "SEO y GEO atraen demanda hacia la Smart Website; el Agente IA convierte la visita en conversación y el CRM mantiene viva cada oportunidad.",
    related: ["smart-website", "agente-ia", "crm-automatizacion"],
  },
  {
    slug: "crm-automatizacion",
    number: "04",
    name: "CRM + Automatización",
    eyebrow: "CRM para empresas y automatización de ventas",
    title: "Organiza cada oportunidad y automatiza el seguimiento para que ningún lead quede olvidado.",
    description:
      "Centraliza leads, conversaciones y próximos pasos en un CRM para empresas, con automatizaciones que apoyan a tu equipo durante todo el proceso comercial.",
    cardTitle: "Que ninguna oportunidad se pierda por falta de seguimiento",
    cardText:
      "Centraliza tus leads, organiza el proceso comercial y automatiza seguimientos, recordatorios y comunicaciones para convertir más oportunidades.",
    cardCta: "Conocer CRM + Automatización",
    seoTitle: "CRM para Empresas y Automatización de Ventas",
    seoDescription:
      "CRM para empresas con automatización de ventas y seguimiento de leads. Organiza oportunidades, conversaciones, recordatorios y próximos pasos comerciales.",
    keywords: ["CRM para empresas", "automatización de ventas", "seguimiento de leads"],
    problemTitle: "Una buena oportunidad puede perderse después del primer contacto",
    problemText:
      "Cuando los datos viven en teléfonos, hojas de cálculo e inboxes distintos, el equipo pierde contexto. El seguimiento depende de la memoria y los leads quedan sin responsable o próximo paso.",
    solutionTitle: "Un proceso comercial visible y apoyado por automatización",
    solutionText:
      "BotPager reúne contactos, conversaciones y etapas en un solo lugar. Automatiza confirmaciones, recordatorios y seguimientos, manteniendo el control humano donde se necesita criterio.",
    features: [
      { title: "Pipeline comercial", text: "Visualiza cada oportunidad, etapa, responsable y próximo paso." },
      { title: "Conversaciones centralizadas", text: "Mantén el contexto disponible para ventas y atención." },
      { title: "Seguimientos automáticos", text: "Activa mensajes y recordatorios según eventos y etapas." },
      { title: "Medición del proceso", text: "Identifica cuellos de botella desde el lead hasta el cliente." },
    ],
    benefits: ["Menos leads olvidados", "Seguimiento más consistente", "Mayor claridad para el equipo comercial"],
    integrationText:
      "El CRM recibe los leads de la Smart Website y el Agente IA, conserva su fuente de SEO o GEO y coordina el seguimiento hasta la conversión.",
    related: ["smart-website", "agente-ia", "seo-geo"],
  },
];

export function getLatamService(slug: string) {
  return latamServices.find((service) => service.slug === slug);
}

export const englishEquivalentByLatamSlug: Record<LatamServiceSlug, string> = {
  "smart-website": "/services/smart-websites",
  "agente-ia": "/services/ai-agent",
  "seo-geo": "/local-seo-ai-search-optimization",
  "crm-automatizacion": "/services/crm-automations",
};
