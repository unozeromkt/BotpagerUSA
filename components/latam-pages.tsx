"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Globe2,
  LayoutDashboard,
  Mail,
  Menu,
  MessageCircleMore,
  Phone,
  Search,
  Sparkles,
  Target,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import type { LatamService, LatamServiceSlug } from "@/lib/latam/services";
import { latamServices } from "@/lib/latam/services";
import { GrowthSystemVisual, ServiceVisual } from "./latam-product-visuals";
import styles from "./latam-pages.module.css";

const iconBySlug = {
  "smart-website": Globe2,
  "agente-ia": MessageCircleMore,
  "seo-geo": Search,
  "crm-automatizacion": LayoutDashboard,
} satisfies Record<LatamServiceSlug, typeof Globe2>;

const journey = [
  { label: "Te encuentran", detail: "Tu empresa gana visibilidad", icon: Search },
  { label: "Te contactan", detail: "El interés se vuelve oportunidad", icon: MessageCircleMore },
  { label: "Atiendes con IA", detail: "Respondes al instante, 24/7", icon: Bot },
  { label: "Conviertes", detail: "El seguimiento acerca la venta", icon: UsersRound },
];

const evolution = [
  { icon: Globe2, before: "Sitio web estático", after: "Smart Website con agente IA", result: "De visitas a oportunidades" },
  { icon: MessageCircleMore, before: "Respuestas tardías", after: "Respuesta inmediata, 24/7", result: "Atención mientras el interés está vivo" },
  { icon: UsersRound, before: "Leads dispersos", after: "CRM centralizado", result: "Todo tu equipo con el mismo contexto" },
  { icon: Zap, before: "Seguimiento manual", after: "Automatización y seguimiento", result: "Cada oportunidad con un próximo paso" },
];

const solutionCopy: Record<LatamServiceSlug, { from: string; name: string; text: string; benefit: string }> = {
  "smart-website": { from: "Website", name: "Smart Website + IA", text: "Tu página web deja de ser informativa y empieza a generar oportunidades.", benefit: "De visitante a prospecto" },
  "agente-ia": { from: "Chat", name: "Agente IA Omnicanal", text: "Atiende al instante por WhatsApp, web y redes. Incluso cuando tu equipo no está disponible.", benefit: "Una conversación que continúa" },
  "seo-geo": { from: "SEO", name: "SEO + GEO", text: "Haz que te encuentren en Google y en la nueva generación de buscadores con IA.", benefit: "Visibilidad donde empieza la decisión" },
  "crm-automatizacion": { from: "CRM", name: "CRM + Automatización", text: "Centraliza tus leads y activa el seguimiento para que cada oportunidad avance.", benefit: "Del primer contacto a la venta" },
};

const countries = [
  ["", "Selecciona tu país"], ["AR", "Argentina"], ["BO", "Bolivia"], ["BR", "Brasil"],
  ["CL", "Chile"], ["CO", "Colombia"], ["CR", "Costa Rica"], ["DO", "República Dominicana"],
  ["EC", "Ecuador"], ["SV", "El Salvador"], ["GT", "Guatemala"], ["HN", "Honduras"],
  ["MX", "México"], ["NI", "Nicaragua"], ["PA", "Panamá"], ["PY", "Paraguay"],
  ["PE", "Perú"], ["PR", "Puerto Rico"], ["UY", "Uruguay"], ["VE", "Venezuela"],
  ["US", "Estados Unidos"], ["OTHER", "Otro país"],
];

function LatamLogo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`${styles.logo} ${light ? styles.logoLight : ""}`} href="/es/" aria-label="BotPager LATAM — Inicio">
      <Image src="/images/botpager-isotype.png" width={604} height={603} alt="" aria-hidden="true" priority />
      <span>Bot<span>Pager</span></span>
    </Link>
  );
}

function LatamHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Inicio", "/es/"], ["Soluciones", "/es/#soluciones"], ["Smart Website", "/es/smart-website/"],
    ["Agente IA", "/es/agente-ia/"], ["SEO + GEO", "/es/seo-geo/"],
    ["CRM + Automatización", "/es/crm-automatizacion/"], ["Contacto", "#diagnostico"],
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <LatamLogo />
        <nav className={styles.desktopNav} aria-label="Navegación principal LATAM">
          {links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
        <div className={styles.language} aria-label="Selector de idioma">
          <Link href="/" hrefLang="en-US">EN</Link><span aria-hidden="true">/</span><Link className={styles.activeLanguage} href="/es/" hrefLang="es">ES</Link>
        </div>
        <button className={styles.menuButton} onClick={() => setOpen((value) => !value)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className={styles.mobileNav} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} aria-label="Navegación móvil LATAM">
            {links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
            <div><Link href="/" hrefLang="en-US">EN</Link><span> / </span><Link href="/es/" hrefLang="es">ES</Link></div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: .55, delay }}>
      {children}
    </motion.div>
  );
}

function PrimaryLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <Link className={`${styles.button} ${styles.primaryButton} ${light ? styles.lightButton : ""}`} href={href}>{children}<ArrowRight /></Link>;
}

function SectionHeading({ eyebrow, title, text, light = false, id }: { eyebrow: string; title: React.ReactNode; text?: string; light?: boolean; id?: string }) {
  return <div className={`${styles.sectionHeading} ${light ? styles.headingLight : ""}`}><p>{eyebrow}</p><h2 id={id}>{title}</h2>{text && <span>{text}</span>}</div>;
}

function ProductVisual() {
  return (
    <motion.div className={styles.productVisual} initial={{ opacity: 0, scale: .96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .75, delay: .12 }}>
      <GrowthSystemVisual />
    </motion.div>
  );
}

function LatamFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div><LatamLogo light /><p>La evolución de tu web, atención y proceso comercial. Con IA y automatización, todo conectado.</p><small>BotPager es operado por Uno Zero Marketing LLC.</small></div>
        <div><h3>Soluciones</h3>{latamServices.map((service) => <Link key={service.slug} href={`/es/${service.slug}/`}>{service.name}</Link>)}</div>
        <div><h3>Empresa</h3><Link href="/es/">Inicio LATAM</Link><Link href="/es/#como-funciona">Cómo funciona</Link><Link href="#diagnostico">Contacto</Link><Link href="/">Versión USA</Link></div>
        <div><h3>Contacto</h3><a href="https://botpager.com"><Globe2 /> botpager.com</a><a href="tel:+12392510184"><Phone /> +1 239-251-0184</a><a href="mailto:info@botpager.com"><Mail /> info@botpager.com</a></div>
      </div>
      <div className={`container ${styles.footerBottom}`}><span>© 2026 BotPager. Todos los derechos reservados.</span><span><Link href="/privacy">Privacidad</Link><Link href="/terms">Términos</Link></span></div>
    </footer>
  );
}

type Tracking = Record<string, string>;

function getTracking(): Tracking {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  const params = new URLSearchParams(window.location.search);
  let saved: Tracking = {};
  try { saved = JSON.parse(sessionStorage.getItem("botpager_latam_attribution") ?? "{}"); } catch { saved = {}; }
  const current = Object.fromEntries(keys.map((key) => [key, params.get(key) ?? ""]).filter(([, value]) => value));
  const tracking = {
    ...saved,
    ...current,
    referrer: saved.referrer || document.referrer || "directo",
    landingPage: saved.landingPage || `${window.location.pathname}${window.location.search}`,
    submissionPage: window.location.pathname,
  };
  sessionStorage.setItem("botpager_latam_attribution", JSON.stringify(tracking));
  return tracking;
}

function LatamLeadForm({ defaultInterest = "" }: { defaultInterest?: LatamServiceSlug | "" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [tracking, setTracking] = useState<Tracking>({});

  useEffect(() => { setTracking(getTracking()); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const response = await fetch("/api/latam-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, consent: data.get("consent") === "on", tracking }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "No pudimos enviar tus datos.");
      setStatus("success");
      setMessage(result.message || "Recibimos tu solicitud. Te contactaremos pronto.");
      form.reset();
      const analyticsWindow = window as typeof window & { dataLayer?: Record<string, unknown>[] };
      analyticsWindow.dataLayer?.push({ event: "latam_diagnostic_submitted", service: payload.interest });
      window.dispatchEvent(new CustomEvent("botpager:latam-lead", { detail: { service: payload.interest } }));
    } catch (reason) {
      setStatus("error");
      setMessage(reason instanceof Error ? reason.message : "No pudimos enviar tus datos. Intenta nuevamente.");
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formHeading}><span><Target /></span><div><h3>Solicita tu diagnóstico gratuito</h3><p>Cuéntanos sobre tu empresa y revisaremos dónde se están perdiendo oportunidades.</p></div></div>
      <div className={styles.formGrid}>
        <label suppressHydrationWarning><span>Nombre</span><input name="name" autoComplete="name" data-lpignore="true" required maxLength={100} placeholder="Tu nombre" /></label>
        <label suppressHydrationWarning><span>Empresa</span><input name="company" autoComplete="organization" data-lpignore="true" required maxLength={120} placeholder="Nombre de la empresa" /></label>
        <label suppressHydrationWarning><span>Email corporativo</span><input name="email" type="email" autoComplete="email" data-lpignore="true" required maxLength={160} placeholder="nombre@empresa.com" /></label>
        <label suppressHydrationWarning><span>WhatsApp / teléfono <small>Opcional</small></span><input name="phone" type="tel" autoComplete="tel" data-lpignore="true" maxLength={40} placeholder="+58 412 000 0000" /></label>
        <label><span>País</span><select name="country" required defaultValue="">{countries.map(([value, label]) => <option key={value || "empty"} value={value}>{label}</option>)}</select></label>
        <label><span>Solución de interés</span><select name="interest" required defaultValue={defaultInterest}>{!defaultInterest && <option value="">Selecciona una solución</option>}{latamServices.map((service) => <option key={service.slug} value={service.slug}>{service.name}</option>)}</select></label>
        <label className={styles.fullField} suppressHydrationWarning><span>Sitio web <small>Opcional</small></span><input name="website" inputMode="url" data-lpignore="true" maxLength={240} placeholder="https://tuempresa.com" /></label>
        <label className={`${styles.fullField} ${styles.honeypot}`} aria-hidden="true"><span>Segundo apellido</span><input name="lastName2" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className={styles.consent}><input name="consent" type="checkbox" required /><span>Acepto que BotPager use estos datos para preparar el diagnóstico y contactarme sobre esta solicitud.</span></label>
      <button className={`${styles.button} ${styles.primaryButton} ${styles.submitButton}`} type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando…" : "Solicitar diagnóstico gratuito"}<ArrowRight /></button>
      {message && <p className={`${styles.formMessage} ${status === "success" ? styles.successMessage : styles.errorMessage}`} role="status">{status === "success" && <CheckCircle2 />}{message}</p>}
    </form>
  );
}

function DiagnosticSection({ defaultInterest = "" }: { defaultInterest?: LatamServiceSlug | "" }) {
  return (
    <section className={styles.diagnostic} id="diagnostico" aria-labelledby="diagnostico-title">
      <div className={`container ${styles.diagnosticGrid}`}>
        <Reveal className={styles.diagnosticCopy}>
          <p className={styles.kicker}><Sparkles /> El siguiente paso es para tu empresa</p>
          <h2 id="diagnostico-title">Descubre dónde estás perdiendo oportunidades</h2>
          <p>Descubre qué puede mejorar cuando tu web, atención y seguimiento trabajan juntos con IA.</p>
          <ul className={styles.diagnosticAreas}>
            <li><Search /><span><b>Presencia y visibilidad digital</b><small>¿Tus prospectos te encuentran y entienden lo que ofreces?</small></span></li>
            <li><Bot /><span><b>Captación y velocidad de respuesta</b><small>¿Qué pasa cuando alguien quiere hablar con tu empresa?</small></span></li>
            <li><Zap /><span><b>Seguimiento y proceso comercial</b><small>¿Cada oportunidad tiene un próximo paso?</small></span></li>
          </ul>
        </Reveal>
        <Reveal delay={.08}><LatamLeadForm defaultInterest={defaultInterest} /></Reveal>
      </div>
    </section>
  );
}

export function LatamHomePage() {
  return (
    <div lang="es-419" className={styles.page}>
      <a className="skipLink" href="#contenido-principal">Ir al contenido principal</a>
      <LatamHeader />
      <main id="contenido-principal">
        <section className={`${styles.hero} ${styles.homeHero}`} id="inicio" aria-labelledby="latam-hero-title">
          <div className={styles.heroDots} aria-hidden="true" />
          <div className={`container ${styles.heroGrid}`}>
            <motion.div className={styles.heroCopy} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .68 }}>
              <p className={styles.kicker}><Sparkles /> Tu empresa, evolucionada con IA</p>
              <h1 id="latam-hero-title">Más oportunidades. <span>Mejor atención.</span> Más ventas.</h1>
              <p>BotPager conecta Smart Websites, inteligencia artificial y automatización para ayudarte a atraer prospectos, responder al instante y convertir más oportunidades en clientes.</p>
              <ul className={styles.microBenefits}><li><Bot />IA 24/7</li><li><UsersRound />Leads centralizados</li><li><Zap />Seguimiento automático</li></ul>
              <div className={styles.heroActions}><PrimaryLink href="#diagnostico">Solicita un diagnóstico gratuito</PrimaryLink><Link className={`${styles.button} ${styles.secondaryButton}`} href="#como-funciona">Conoce cómo funciona<ArrowDown /></Link></div>
            </motion.div>
            <ProductVisual />
          </div>
        </section>

        <section className={`container ${styles.journeyRail}`} aria-label="Cuatro pasos para hacer crecer tu empresa">
          {journey.map(({ label, detail, icon: Icon }, index) => <div key={label}><span>{String(index + 1).padStart(2, "0")}</span><Icon /><b>{label}</b><small>{detail}</small>{index < journey.length - 1 && <ArrowRight className={styles.journeyArrow} aria-hidden="true" />}</div>)}
        </section>

        <section className={`${styles.section} ${styles.valueSection}`} id="evolucion" aria-labelledby="value-title">
          <div className="container">
            <Reveal><SectionHeading id="value-title" eyebrow="La evolución de lo tradicional" title={<>De un sitio web estático a un <span>sistema de crecimiento con IA</span></>} text="Lo que tu empresa ya conoce, conectado y potenciado para captar mejor, atender más rápido y dar seguimiento." /></Reveal>
            <Reveal className={styles.comparison}>
              <div className={styles.comparisonHeader}><span>La forma tradicional</span><span><Sparkles />BotPager + IA</span></div>
              {evolution.map(({ icon: Icon, before, after, result }) => <div className={styles.comparisonRow} key={before}><div><Icon /><span>{before}</span></div><ArrowRight className={styles.evolutionArrow} aria-hidden="true" /><div><span className={styles.comparisonCheck}><Check /></span><span><b>{after}</b><small>{result}</small></span></div></div>)}
              <div className={styles.comparisonOutcome}><Bot /><p>La IA se ocupa de la primera respuesta y las tareas repetitivas.<br /><strong>Tu equipo se enfoca en las conversaciones que hacen crecer la empresa.</strong></p></div>
            </Reveal>
          </div>
        </section>

        <section className={`${styles.section} ${styles.solutions}`} id="soluciones" aria-labelledby="solutions-title">
          <div className="container">
            <Reveal><SectionHeading id="solutions-title" eyebrow="Herramientas conocidas. Nuevas posibilidades." title={<>Tu operación digital, <span>un paso adelante.</span></>} text="Cuatro soluciones que transforman cómo te encuentran, cómo atiendes y cómo conviertes." /></Reveal>
            <div className={styles.solutionGrid}>
              {latamServices.map((service, index) => {
                const copy = solutionCopy[service.slug];
                return <Reveal className={styles.solutionCard} delay={index * .05} key={service.slug}><article>
                  <div className={styles.solutionIdentity}><span>{copy.from}<ArrowRight /><b>{copy.name}</b></span><small>{service.number}</small></div>
                  <ServiceVisual slug={service.slug} />
                  <div className={styles.solutionCopy}><span>{copy.benefit}</span><h3>{copy.name}</h3><p>{copy.text}</p><Link href={`/es/${service.slug}/`}>{service.cardCta}<ArrowRight /></Link></div>
                </article></Reveal>;
              })}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.integration}`} id="como-funciona" aria-labelledby="integration-title">
          <div className="container">
            <Reveal><SectionHeading id="integration-title" light eyebrow="Así trabaja el sistema" title={<>Una oportunidad. <span>Todo conectado para hacerla avanzar.</span></>} text="Cada solución entrega la oportunidad a la siguiente. Sin perder la conversación, los datos ni el próximo paso." /></Reveal>
            <Reveal delay={.08}><ol className={styles.integrationFlow}>{[
              { label: "SEO + GEO", icon: Search, detail: "Te descubren" }, { label: "Smart Website", icon: Globe2, detail: "Se interesan" }, { label: "Agente IA", icon: Bot, detail: "Reciben atención" }, { label: "Lead", icon: Target, detail: "Dejan sus datos" }, { label: "CRM", icon: LayoutDashboard, detail: "Todo se organiza" }, { label: "Seguimiento", icon: Zap, detail: "Avanzan automáticamente" }, { label: "Cliente", icon: CheckCircle2, detail: "La oportunidad se convierte" },
            ].map(({ label, icon: Icon, detail }, index, all) => <li key={label}><span><Icon /></span><b>{label}</b><small>{detail}</small>{index < all.length - 1 && <ArrowRight aria-hidden="true" />}</li>)}</ol></Reveal>
            <div className={styles.integrationCta}><PrimaryLink href="#diagnostico" light>Descubre cómo aplicarlo a tu empresa</PrimaryLink></div>
          </div>
        </section>

        <DiagnosticSection />
      </main>
      <LatamFooter />
    </div>
  );
}

function RelatedServices({ service }: { service: LatamService }) {
  const relatedServices = useMemo(() => service.related.map((slug) => latamServices.find((item) => item.slug === slug)).filter(Boolean) as LatamService[], [service]);
  return <nav className={styles.related} aria-label="Soluciones relacionadas">{relatedServices.map((item) => <Link key={item.slug} href={`/es/${item.slug}/`}>{item.name}<ArrowRight /></Link>)}</nav>;
}

export function LatamServicePage({ service }: { service: LatamService }) {
  const Icon = iconBySlug[service.slug];
  return (
    <div lang="es-419" className={styles.page}>
      <a className="skipLink" href="#contenido-principal">Ir al contenido principal</a>
      <LatamHeader />
      <main id="contenido-principal">
        <section className={`${styles.hero} ${styles.serviceHero}`} aria-labelledby="service-hero-title">
          <div className={styles.heroDots} aria-hidden="true" />
          <div className={`container ${styles.serviceHeroGrid}`}>
            <motion.div className={styles.heroCopy} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .68 }}>
              <nav className={styles.breadcrumbs} aria-label="Migas de pan"><Link href="/es/">Inicio</Link><span>/</span><Link href="/es/#soluciones">Soluciones</Link><span>/</span><span>{service.name}</span></nav>
              <p className={styles.kicker}><Icon /> {service.eyebrow}</p>
              <h1 id="service-hero-title">{service.title}</h1>
              <p>{service.description}</p>
              <div className={styles.heroActions}><PrimaryLink href="#diagnostico">Solicita un diagnóstico gratuito</PrimaryLink><Link className={`${styles.button} ${styles.secondaryButton}`} href="#solucion">Conoce la solución<ArrowDown /></Link></div>
            </motion.div>
            <motion.div className={styles.serviceIllustration} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65, delay: .1 }}><ServiceVisual slug={service.slug} /><p><Sparkles />{solutionCopy[service.slug].benefit}</p></motion.div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.problemSolution}`} id="solucion" aria-label={`Problema y solución de ${service.name}`}>
          <div className={`container ${styles.twoColumns}`}>
            <Reveal className={styles.problemCard}><p className={styles.kicker}>El problema</p><h2>{service.problemTitle}</h2><p>{service.problemText}</p></Reveal>
            <Reveal className={styles.solutionPanel} delay={.08}><p className={styles.kicker}>La solución BotPager</p><h2>{service.solutionTitle}</h2><p>{service.solutionText}</p></Reveal>
          </div>
        </section>

        <section className={`${styles.section} ${styles.features}`} aria-labelledby="features-title">
          <div className="container">
            <Reveal><SectionHeading id="features-title" eyebrow="Funcionalidades principales" title={<>Una solución diseñada para <span>generar resultados comerciales</span></>} /></Reveal>
            <div className={styles.featureGrid}>{service.features.map((feature, index) => <Reveal className={styles.featureCard} delay={index * .05} key={feature.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature.title}</h3><p>{feature.text}</p></Reveal>)}</div>
          </div>
        </section>

        <section className={styles.benefitBand} aria-labelledby="benefits-title"><div className={`container ${styles.benefitGrid}`}><div><p className={styles.kicker}>Beneficios</p><h2 id="benefits-title">Lo que esta solución ayuda a mejorar</h2></div>{service.benefits.map((benefit) => <div key={benefit}><CheckCircle2 /><b>{benefit}</b></div>)}</div></section>

        <section className={`${styles.section} ${styles.serviceIntegration}`} aria-labelledby="service-integration-title"><div className={`container ${styles.serviceIntegrationGrid}`}><Reveal><p className={styles.kicker}>Cómo se integra con BotPager</p><h2 id="service-integration-title">Una pieza conectada con todo el recorrido</h2><p>{service.integrationText}</p><RelatedServices service={service} /></Reveal><Reveal className={styles.miniFlow} delay={.08}>{["VISIBILIDAD", "OPORTUNIDAD", "CONVERSACIÓN", "SEGUIMIENTO", "VENTA"].map((label, index) => <div key={label}><span>{String(index + 1).padStart(2, "0")}</span><b>{label}</b>{index < 4 && <ArrowRight />}</div>)}</Reveal></div></section>

        <DiagnosticSection defaultInterest={service.slug} />
      </main>
      <LatamFooter />
    </div>
  );
}
