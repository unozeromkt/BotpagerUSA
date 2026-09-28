import Image from "next/image";
import { ArrowRight, Check, CheckCheck, Globe2, Mail, MessageCircle, Search, Sparkles, Star, Zap } from "lucide-react";
import type { LatamServiceSlug } from "@/lib/latam/services";
import styles from "./latam-product-visuals.module.css";

function BrandMark() {
  return <Image src="/images/botpager-isotype.png" alt="" width={48} height={48} />;
}

function WhatsAppMark() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20.6 11.6a8.5 8.5 0 0 1-12.4 7.5L3 20.5l1.4-5.1A8.5 8.5 0 1 1 20.6 11.6Z" /><path d="M8.3 7.2c-.8.6-.9 1.4-.5 2.5 1 2.8 3.3 5 6 5.8 1.1.3 1.9-.1 2.3-.9l.3-.9-2.6-1.3-.8 1c-1.4-.6-2.6-1.8-3.2-3.2l.9-.8-1.2-2.5Z" /></svg>;
}

function InstagramMark() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function BrowserBar({ domain = "tuempresa.com" }: { domain?: string }) {
  return <div className={styles.browserBar}><span aria-hidden="true"><i /><i /><i /></span><small><Globe2 />{domain}</small><span /></div>;
}

function Pipeline({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className={styles.pipeline}>
      {[{ title: "Lead", name: "Nueva consulta", source: "WhatsApp", icon: MessageCircle }, { title: "Seguimiento", name: "Propuesta enviada", source: "Recordatorio activo", icon: Zap }, { title: "Cliente", name: "Venta confirmada", source: "Objetivo cumplido", icon: Check }].map(({ title, name, source, icon: Icon }, index) => (
        <div className={styles.pipelineColumn} key={title}>
          <div className={styles.columnTitle}><i />{title}{index < 2 && <ArrowRight />}</div>
          <div className={styles.leadCard}><Icon /><b>{name}</b><small>{source}</small>{detailed && <span className={styles.cardLines} aria-hidden="true"><i /><i /></span>}</div>
          {detailed && <div className={styles.emptySlot} aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

export function GrowthSystemVisual() {
  return (
    <figure className={styles.growthScene} aria-label="Ejemplo del sistema BotPager: una búsqueda genera una conversación, el agente IA responde y el CRM organiza la oportunidad.">
      <div className={styles.sceneOrbit} aria-hidden="true" />
      <div className={styles.discovery}><Search /><span><small>Todo empieza con una búsqueda</small><b>Encuentra tu empresa en Google</b></span><ArrowRight /></div>
      <div className={styles.dashboard}>
        <div className={styles.dashboardTop}><BrandMark /><b>BotPager</b><span><i />Tu sistema conectado</span></div>
        <div className={styles.dashboardBody}>
          <div className={styles.dashboardHeading}><div><small>DE LA CONVERSACIÓN AL CLIENTE</small><b>Más oportunidades.<br />Todo en un mismo lugar.</b></div><span><Sparkles />Con IA</span></div>
          <Pipeline />
          <div className={styles.automation}><Zap /><span>Seguimiento automático</span><Check /><small>Activo</small></div>
        </div>
      </div>
      <div className={styles.heroConversation}>
        <div className={styles.chatHead}><span><WhatsAppMark /></span><div><b>Nuevo lead por WhatsApp</b><small>Agente IA 24/7 · En línea</small></div></div>
        <div className={styles.messages}><p>Hola, quisiera conocer sus servicios.</p><p>¡Hola! Claro, cuéntame qué necesita tu empresa y te ayudo.<CheckCheck /></p></div>
        <div className={styles.savedLead}><Check />Oportunidad guardada en el CRM</div>
      </div>
      <div className={styles.trustSignal}><span><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></span><b>Una mejor atención<br />construye confianza</b></div>
      <figcaption>Así se conecta una oportunidad · Ejemplo ilustrativo</figcaption>
    </figure>
  );
}

export function ServiceVisual({ slug }: { slug: LatamServiceSlug }) {
  if (slug === "smart-website") return (
    <div className={`${styles.serviceVisual} ${styles.websiteVisual}`} role="img" aria-label="Smart Website con información de la empresa, llamada a la acción y un agente IA que atiende al visitante.">
      <div className={styles.websiteWindow}><BrowserBar /><div className={styles.websiteContent}><div className={styles.mockBrand}><span />TU EMPRESA</div><strong>Tu próxima solución<br />empieza aquí.</strong><span className={styles.mockLine} /><span className={styles.mockCta}>Conversemos<ArrowRight /></span><div className={styles.websiteTiles}><span /><span /><span /></div></div></div>
      <div className={styles.websiteChat}><div><BrandMark /><b>Tu agente IA<small>Disponible 24/7</small></b><i /></div><p>¡Hola! ¿Cómo puedo ayudarte?</p><span>Quiero más información<ArrowRight /></span></div>
      <div className={styles.visualBadge}><Check />Visita → conversación</div>
    </div>
  );

  if (slug === "agente-ia") return (
    <div className={`${styles.serviceVisual} ${styles.channelsVisual}`} role="img" aria-label="BotPager conecta WhatsApp, Instagram, Messenger, web y email con un agente IA central disponible 24/7.">
      <svg className={styles.channelConnections} viewBox="0 0 500 280" preserveAspectRatio="none" aria-hidden="true"><path d="M110 70 250 140 390 70 M80 160 250 140 420 160 M250 140V240" /></svg>
      <div className={styles.channelCore}><BrandMark /><b>Agente IA</b><small><i />24/7</small></div>
      <span className={`${styles.channel} ${styles.whatsapp}`}><WhatsAppMark /><b>WhatsApp</b></span>
      <span className={`${styles.channel} ${styles.instagram}`}><InstagramMark /><b>Instagram</b></span>
      <span className={`${styles.channel} ${styles.messenger}`}><MessageCircle /><b>Messenger</b></span>
      <span className={`${styles.channel} ${styles.web}`}><Globe2 /><b>Web</b></span>
      <span className={`${styles.channel} ${styles.email}`}><Mail /><b>Email</b></span>
    </div>
  );

  if (slug === "seo-geo") return (
    <div className={`${styles.serviceVisual} ${styles.searchVisual}`} role="img" aria-label="Ejemplo ilustrativo de visibilidad de tu empresa en Google y en respuestas de buscadores con inteligencia artificial.">
      <div className={styles.searchWindow}><div className={styles.searchEngine}><Search /><b>Google</b><small>Búsqueda</small></div><div className={styles.searchQuery}>La solución que tu cliente necesita<Search /></div><div className={styles.searchResult}><span><Globe2 />tuempresa.com</span><b>Tu empresa. La respuesta que buscan.</b><i /><i /></div></div>
      <div className={styles.aiAnswer}><span><Sparkles />Búsqueda con IA</span><b>Información clara.<br />Respuestas relevantes.</b><small><Globe2 />Tu empresa como fuente de información</small></div>
    </div>
  );

  return (
    <div className={`${styles.serviceVisual} ${styles.crmVisual}`} role="img" aria-label="Pipeline comercial con tres etapas: lead, seguimiento automático y cliente.">
      <div className={styles.crmWindow}><div className={styles.crmTop}><span><BrandMark />Tu proceso comercial</span><small><i />Conectado</small></div><Pipeline detailed /><div className={styles.automation}><Zap /><span>Cada oportunidad tiene un próximo paso</span></div></div>
    </div>
  );
}
