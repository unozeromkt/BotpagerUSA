"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowLeft, Check, CheckCircle2, ChevronRight, Clock3, CalendarDays, MessageCircle, Sparkles, ShieldCheck, Globe2, BriefcaseBusiness, ShoppingBag, Heart, Building2, Palmtree, Shapes, LoaderCircle, Copy, ExternalLink, Radio } from "lucide-react";
import { campaign, campaignOpen, countries, goals, sectors, type Booking, type CampaignSettings, type GoalId, type SavedLead, type SectorId } from "./_lib/config";
import styles from "./experience.module.css";

const icons = [BriefcaseBusiness, ShoppingBag, Heart, Building2, Palmtree, Shapes];
type Step = "start" | "demo" | "lead" | "benefit" | "booking" | "confirmed" | "coordination";
const labels = ["Tu negocio", "Tu ejemplo", "Tu beneficio"];

async function api(path: string, body: unknown) {
  const response = await fetch(`/es/feriaEffix2026/api/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok || data.ok !== true) throw new Error(data.message || "No pudimos completar la solicitud. Intenta de nuevo.");
  return data;
}

export function EffixExperience({ settings }: { settings: CampaignSettings }) {
  const [step, setStep] = useState<Step>("start");
  const [sector, setSector] = useState<SectorId | "">("");
  const [goal, setGoal] = useState<GoalId | "">("");
  const [answer, setAnswer] = useState("");
  const [fields, setFields] = useState({ name: "", business: "", phone: "", country: "CO", consent: false, marketing: false, websiteTrap: "" });
  const [saved, setSaved] = useState<SavedLead>();
  const [booking, setBooking] = useState<Booking>();
  const [timezone, setTimezone] = useState<string>(campaign.timezone);
  const [available, setAvailable] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [week, setWeek] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const operation = useRef("");
  const tracking = useRef<Record<string, string>>({});
  const seen = useRef(new Set<string>());
  const panel = useRef<HTMLElement>(null);
  const previousStep = useRef<Step>("start");
  const currentSector = sectors.find(item => item.id === sector);
  const currentGoal = goals.find(item => item.id === goal);
  const activeIndex = step === "start" ? 0 : step === "demo" ? 1 : 2;

  function event(name: string, unique?: string) {
    const key = unique ? `${name}:${unique}` : "";
    if (key && seen.current.has(key)) return;
    if (key) seen.current.add(key);
    const medium = ["nfc", "qr"].includes(tracking.current.utm_medium) ? tracking.current.utm_medium : "enlace";
    const detail = { event: name, campaign: campaign.id, origin: medium, ...(sector ? { sector } : {}), ...(goal ? { objective: goal } : {}) };
    const target = window as Window & { dataLayer?: Record<string, unknown>[] };
    target.dataLayer = target.dataLayer ?? []; target.dataLayer.push(detail);
    window.dispatchEvent(new CustomEvent("botpager:effix", { detail }));
  }

  useEffect(() => {
    operation.current = crypto.randomUUID();
    const previousLang = document.documentElement.lang;
    document.documentElement.lang = "es";
    const search = new URLSearchParams(window.location.search);
    tracking.current = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "tag_id"].flatMap(key => {
      const value = search.get(key) ?? ""; return /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? [[key, value]] : [];
    }));
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || campaign.timezone);
    setOpen(campaignOpen());
    const timer = window.setInterval(() => setOpen(campaignOpen()), 60_000);
    event("landing_view", "session");
    return () => { document.documentElement.lang = previousLang; window.clearInterval(timer); };
    // Initial attribution and view are captured once; subsequent events use current selections.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousStep.current !== step) {
      setError("");
      panel.current?.focus({ preventScroll: true });
      if (window.innerWidth < 800) panel.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      previousStep.current = step;
    }
  }, [step]);

  async function submit(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault(); setBusy(true); setError("");
    try {
      const data = await api("lead", { ...fields, sector, goal, operationId: operation.current, tracking: tracking.current });
      if (!data.lead?.receipt || data.lead.benefit !== true) throw new Error("No pudimos confirmar la activación. Intenta de nuevo.");
      setSaved(data.lead); event("lead_submitted", operation.current); event("benefit_activated", operation.current); setStep("benefit");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos registrar tus datos. Intenta de nuevo."); }
    finally { setBusy(false); }
  }

  async function loadSlots(zone = timezone, offset = week) {
    if (!saved) return;
    setBusy(true); setError(""); setSelected(""); setAvailable([]);
    try { const data = await api("slots", { receipt: saved.receipt, timezone: zone, start: Date.now() + offset * 7 * 86400_000 }); setAvailable(data.slots); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos consultar la agenda."); }
    finally { setBusy(false); }
  }

  async function reserve(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault(); if (!saved || !selected) return;
    setBusy(true); setError("");
    try {
      const data = await api("booking", { receipt: saved.receipt, startTime: selected, timezone, email, website });
      if (!data.booking?.id) throw new Error("No pudimos confirmar la reserva. Intenta de nuevo.");
      setBooking(data.booking); event("booking_confirmed", data.booking.id); setStep("confirmed");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos reservar ese horario. Actualiza la agenda e intenta de nuevo."); }
    finally { setBusy(false); }
  }

  async function coordinate() {
    if (!saved) return; setBusy(true); setError("");
    try { const data = await api("coordination", { receipt: saved.receipt }); if (!data.taskId) throw new Error("No pudimos registrar la solicitud."); event("coordination_requested", data.taskId); setStep("coordination"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos registrar la coordinación."); }
    finally { setBusy(false); }
  }

  const dateText = (date: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CO", { timeZone: timezone, ...options }).format(new Date(date));
  const timezones = [...new Set([timezone, "America/Bogota", "America/Caracas", "America/Mexico_City", "America/New_York", "America/Lima", "America/Argentina/Buenos_Aires", "Europe/Madrid"])];

  return (
    <div className={styles.page} lang="es">
      <a className={styles.skip} href="#experiencia">Ir a mi ejemplo</a>
      <header className={styles.header}>
        <Link href="/es" className={styles.logo} aria-label="BotPager, inicio en español"><Image src="/images/botpager-isotype.png" width={38} height={38} alt="" priority /><span>BotPager<span className={styles.logoDot}>®</span></span></Link>
        <div className={styles.edition}><span className={styles.statusDot} /> EFFIX <span>2026</span></div>
      </header>

      <main className={styles.main}>
        <section className={styles.story} aria-labelledby="campaign-title">
          <div className={styles.eyebrow}><Radio size={15} aria-hidden="true" /> UN TOQUE. UNA NUEVA OPORTUNIDAD.</div>
          <p className={styles.kicker}>Tu próximo cliente ya está preguntando.</p>
          <h1 id="campaign-title">Convierte conversaciones en <span>oportunidades con IA<span className={styles.titleDot}>.</span></span></h1>
          <p className={styles.intro}>Prueba cómo BotPager puede responder, captar datos y guiar a tus clientes hacia el siguiente paso.</p>
          <div className={styles.productPill}><Globe2 size={16} aria-hidden="true" /><span>Smart Website</span><b>+</b><Sparkles size={15} aria-hidden="true" /><span>Agente IA</span></div>
          <div className={styles.journey} aria-label="De la consulta a la oportunidad">
            <div><span><MessageCircle size={20} /></span><b>Una consulta</b><small>El interés empieza aquí</small></div>
            <ChevronRight aria-hidden="true" />
            <div><span className={styles.journeyAI}><Image src="/images/botpager-isotype.png" width={32} height={32} alt="" /></span><b>Una respuesta</b><small>Con el contexto correcto</small></div>
            <ChevronRight aria-hidden="true" />
            <div><span className={styles.journeyResult}><Check size={22} /></span><b>Un próximo paso</b><small>Para tu equipo comercial</small></div>
          </div>
          <div className={styles.partner}><Image src="/es/feriaEffix2026/groovy-logo.png" width={124} height={33} alt="Groovy" /><div><b>Contenido que conecta.</b><span>Groovy, aliado de contenido.</span></div></div>
        </section>

        <section id="experiencia" ref={panel} tabIndex={-1} className={styles.panel} aria-label="Experiencia BotPager para tu negocio" aria-busy={busy}>
          <div className={styles.progress}><span>TU EXPERIENCIA</span><span>{activeIndex + 1} / 3</span></div>
          <ol className={styles.steps}>{labels.map((label, i) => <li key={label} className={i <= activeIndex ? styles.stepActive : ""} aria-current={i === activeIndex ? "step" : undefined}><span>{i < activeIndex ? <Check size={12} /> : `0${i + 1}`}</span>{label}</li>)}</ol>

          {step === "start" && <div className={styles.content}>
            <span className={styles.cardEyebrow}>HECHO PARA TU NEGOCIO</span>
            <h2>Descubre tu próximo paso.</h2>
            <p className={styles.cardIntro}>Dos respuestas. Un ejemplo para ti.</p>
            <fieldset className={styles.sectorField}><legend>¿Qué tipo de negocio tienes?</legend><div className={styles.sectors}>{sectors.map((item, i) => { const Icon = icons[i]; return <label key={item.id} className={`${styles.sector} ${sector === item.id ? styles.selectedSector : ""}`}><input type="radio" name="sector" value={item.id} checked={sector === item.id} onChange={() => setSector(item.id)} /><Icon size={19} aria-hidden="true" /><span>{item.label}</span>{sector === item.id && <Check size={13} className={styles.sectorCheck} />}</label>; })}</div></fieldset>
            <label className={styles.field}>¿Qué quieres lograr?<select value={goal} onChange={e => setGoal(e.target.value as GoalId)}><option value="">Selecciona tu objetivo</option>{goals.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <button type="button" className={styles.primary} disabled={!sector || !goal} onClick={() => { setAnswer(""); event("demo_start"); setStep("demo"); }}>Ver mi ejemplo <ArrowRight size={18} /></button>
            <div className={styles.cardFoot}><Clock3 size={13} /> Un recorrido breve. Sin crear una cuenta.</div>
            <a className={styles.benefitTeaser} href="#beneficio"><Sparkles size={14} /><span><b>Tu beneficio EFFIX: 50% OFF</b> en implementación inicial. <small>Contrata del 14 al 20 de octubre. Ver condiciones.</small></span></a>
          </div>}

          {step === "demo" && currentGoal && currentSector && <div className={styles.content}>
            <button className={styles.back} onClick={() => setStep("start")}><ArrowLeft size={14} /> Cambiar mis respuestas</button>
            <span className={styles.cardEyebrow}>{currentSector.label}</span><h2>Así empieza una oportunidad.</h2>
            <div className={styles.demoLabel}><span /> Ejemplo guiado <span className={styles.demoDisclaimer}>No es una conversación con IA real</span></div>
            <div className={styles.chat}>
              <div className={styles.chatHeader}><Image src="/images/botpager-isotype.png" width={30} height={30} alt="" /><div><b>Asistente BotPager</b><span>Ejemplo para {currentSector.label.toLowerCase()}</span></div></div>
              <div className={styles.chatBody}><p className={styles.visitor}>{currentGoal.question}. Me interesa {currentSector.example}.</p><p className={styles.assistant}>¡Hola! Podemos orientarte sobre {currentSector.detail}. {currentGoal.prompt}</p>{!answer ? <div className={styles.quickReplies}>{currentGoal.options.map(option => <button key={option} onClick={() => { setAnswer(option); event("demo_interaction"); }}>{option}<ArrowRight size={13} /></button>)}</div> : <><p className={styles.visitor}>{answer}</p><p className={styles.assistant}>{currentGoal.response}</p></>}</div>
            </div>
            {answer && <div className={styles.result} aria-live="polite"><CheckCircle2 size={20} /><div><b>{currentGoal.result}</b><p>{currentGoal.detail}</p></div></div>}
            <button className={styles.primary} disabled={!answer} onClick={() => setStep("lead")}>Quiero esto para mi negocio <ArrowRight size={18} /></button>
            <p className={styles.small}>Un ejemplo ilustrativo. Las capacidades finales dependen de las integraciones contratadas.</p>
          </div>}

          {step === "lead" && <div className={styles.content}>
            <button className={styles.back} onClick={() => setStep("demo")}><ArrowLeft size={14} /> Volver a mi ejemplo</button>
            <span className={styles.cardEyebrow}>QUE LA CONVERSACIÓN CONTINÚE</span><h2>Activa tu beneficio y tu demo.</h2><p className={styles.cardIntro}>Solo necesitamos tres datos para preparar una conversación sobre tu negocio.</p>
            <div className={styles.context}><span>{currentSector?.label}</span><span>{currentGoal?.short}</span></div>
            <form onSubmit={submit}>
              <label className={styles.field}>Tu nombre<input autoComplete="name" name="name" required minLength={2} maxLength={100} value={fields.name} onChange={e => setFields({ ...fields, name: e.target.value })} placeholder="¿Cómo te llamas?" /></label>
              <label className={styles.field}>Nombre de tu negocio<input autoComplete="organization" name="business" required minLength={2} maxLength={120} value={fields.business} onChange={e => setFields({ ...fields, business: e.target.value })} placeholder="Tu empresa o marca personal" /></label>
              <label className={styles.field} htmlFor="effix-phone">WhatsApp con código de país</label><div className={styles.phone}><select aria-label="País de tu WhatsApp" value={fields.country} onChange={e => setFields({ ...fields, country: e.target.value })}>{countries.map(item => <option value={item.id} key={item.id}>{item.dial} {item.label}</option>)}</select><input id="effix-phone" type="tel" inputMode="tel" autoComplete="tel-national" name="phone" required maxLength={40} placeholder={fields.country === "OTHER" ? "+ código y número" : "Tu número"} value={fields.phone} onChange={e => setFields({ ...fields, phone: e.target.value })} /></div>
              <div className={styles.trap} aria-hidden="true"><label>Deja este campo vacío<input name="websiteTrap" tabIndex={-1} autoComplete="off" value={fields.websiteTrap} onChange={e => setFields({ ...fields, websiteTrap: e.target.value })} /></label></div>
              <label className={styles.checkbox}><input type="checkbox" required checked={fields.consent} onChange={e => setFields({ ...fields, consent: e.target.checked })} /><span>{campaign.contactConsent}.</span></label>
              <label className={styles.checkbox}><input type="checkbox" checked={fields.marketing} onChange={e => setFields({ ...fields, marketing: e.target.checked })} /><span>{campaign.marketingConsent}. <small>Opcional.</small></span></label>
              <p className={styles.privacy}>BotPager, operado por Uno Zero Marketing LLC. <Link href="/es/feriaEffix2026/privacidad" target="_blank">Política de tratamiento de datos <ExternalLink size={10} /></Link></p>
              <button type="submit" className={styles.primary} disabled={busy}>{busy ? <><LoaderCircle className={styles.spin} size={18} /> Guardando tu registro…</> : <>Activar mi beneficio <ArrowRight size={18} /></>}</button>
            </form>
            {(!settings.live || !open) && <p className={styles.availability}>{!open ? "El registro del beneficio estará disponible del 14 al 20 de octubre, hora de Colombia." : "El registro estará disponible cuando el equipo habilite la campaña."} Puedes explorar el ejemplo mientras tanto.</p>}
          </div>}

          {step === "benefit" && saved && <div className={`${styles.content} ${styles.success}`}>
            <span className={styles.successIcon}><CheckCircle2 size={32} /></span><span className={styles.cardEyebrow}>REGISTRO CONFIRMADO</span><h2>Tu beneficio EFFIX está activo.</h2><p>Ahora veamos cómo funcionaría BotPager con <strong>{saved.business}</strong>.</p>
            <div className={styles.activatedCoupon}><span>IMPLEMENTACIÓN INICIAL</span><b>50<span>% OFF</span></b><button className={styles.copyCode} onClick={async () => { try { await navigator.clipboard.writeText(campaign.code); setCopied(true); } catch { setError(`Tu código es ${campaign.code}. Puedes copiarlo manualmente.`); } }}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Código copiado" : campaign.code}</button><small>Contratación del 14 al 20 de octubre de 2026.<br />Cierre: 23:59, hora de Colombia.</small></div>
            <button className={styles.primary} disabled={busy} onClick={() => { event("booking_opened"); setStep("booking"); if (settings.bookingEnabled) void loadSlots(); }}>Reservar mi demo de 15 minutos <ArrowRight size={18} /></button>
            <button className={styles.textButton} disabled={busy} onClick={coordinate}>{busy ? "Registrando solicitud…" : "Prefiero coordinar por WhatsApp"}<MessageCircle size={16} /></button>
            <p className={styles.small}>Tu beneficio permanece disponible aunque no reserves una demo.</p>
          </div>}

          {step === "booking" && saved && <div className={styles.content}>
            <button className={styles.back} disabled={busy} onClick={() => setStep("benefit")}><ArrowLeft size={14} /> Volver a mi beneficio</button><span className={styles.cardEyebrow}>UN CASO CONCRETO. UN PRÓXIMO PASO.</span><h2>15 minutos para tu negocio.</h2><p className={styles.cardIntro}>Revisaremos cómo {currentGoal?.label.toLowerCase()} en {saved.business}.</p>
            {settings.bookingEnabled ? <form onSubmit={reserve}>
              <label className={styles.field}>Tu zona horaria<select value={timezone} disabled={busy} onChange={e => { setTimezone(e.target.value); void loadSlots(e.target.value); }}>{timezones.map(zone => <option key={zone} value={zone}>{zone}</option>)}</select></label>
              <div className={styles.week}><button type="button" aria-label="Semana anterior" disabled={week === 0 || busy} onClick={() => { setWeek(week - 1); void loadSlots(timezone, week - 1); }}><ArrowLeft size={16} /></button><span>{week === 0 ? "Próximos 7 días" : `Semana ${week + 1}`}<small>Horarios del calendario de BotPager</small></span><button type="button" aria-label="Semana siguiente" disabled={week >= 11 || busy} onClick={() => { setWeek(week + 1); void loadSlots(timezone, week + 1); }}><ArrowRight size={16} /></button></div>
              <div className={styles.slots} aria-live="polite">{busy ? <p><LoaderCircle size={16} className={styles.spin} /> Consultando la agenda…</p> : available.length ? available.map(slot => <button key={slot} type="button" className={selected === slot ? styles.slotSelected : ""} aria-pressed={selected === slot} onClick={() => setSelected(slot)}><span>{dateText(slot, { weekday: "short", month: "short", day: "numeric" })}</span><b>{dateText(slot, { hour: "numeric", minute: "2-digit" })}</b></button>) : <p>No hay horarios disponibles en esta semana. Puedes revisar la siguiente o coordinar por WhatsApp.</p>}</div>
              <button className={styles.refresh} type="button" disabled={busy} onClick={() => void loadSlots()}>Actualizar horarios</button>
              <label className={styles.field}>Web o Instagram de tu negocio <small>Opcional</small><input type="url" maxLength={240} placeholder="https://…" value={website} onChange={e => setWebsite(e.target.value)} /></label>
              {settings.requiresEmail && <label className={styles.field}>Correo para tu invitación<input type="email" autoComplete="email" required value={email} maxLength={160} onChange={e => setEmail(e.target.value)} /><small>Solo para la invitación y comunicaciones sobre tu demo.</small></label>}
              {selected && <p className={styles.selectedTime}>Tu selección: {dateText(selected, { dateStyle: "medium", timeStyle: "short" })} · {timezone}</p>}
              <button type="submit" className={styles.primary} disabled={!selected || busy}>{busy ? "Consultando la agenda…" : "Confirmar mi demo"}<CalendarDays size={18} /></button>
            </form> : <div className={styles.noCalendar}><CalendarDays size={30} /><p>Podemos coordinar contigo el mejor horario por WhatsApp. Tu registro y tu beneficio ya están guardados.</p></div>}
            <button className={styles.textButton} disabled={busy} onClick={coordinate}>Prefiero coordinar por WhatsApp <MessageCircle size={16} /></button>
          </div>}

          {step === "confirmed" && booking && <div className={`${styles.content} ${styles.success}`}><span className={styles.successIcon}><CalendarDays size={30} /></span><span className={styles.cardEyebrow}>CITA CONFIRMADA</span><h2>Nos vemos en tu demo.</h2><p>Ya tenemos un espacio para hablar de {saved?.business}.</p><div className={styles.confirmation}><b>{dateText(booking.startTime, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</b><strong>{dateText(booking.startTime, { hour: "numeric", minute: "2-digit" })}</strong><span>{booking.timezone} · 15 minutos</span></div>{booking.meetingUrl ? <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" className={styles.primary}>Enlace de la reunión <ExternalLink size={16} /></a> : <p className={styles.small}>El equipo compartirá el enlace de reunión por el canal de confirmación configurado.</p>}{booking.rescheduleUrl ? <a href={booking.rescheduleUrl} target="_blank" rel="noopener noreferrer" className={styles.textButton}>Reprogramar mi demo</a> : <p className={styles.small}>Para cambiar tu cita, escribe a <a href="mailto:info@botpager.com">info@botpager.com</a> o responde al equipo cuando te contacte.</p>}<p className={styles.benefitReminder}>EFFIX50 · Tu beneficio sigue activo para contratar hasta el 20 de octubre, 23:59, hora de Colombia.</p></div>}

          {step === "coordination" && <div className={`${styles.content} ${styles.success}`}><span className={styles.successIcon}><MessageCircle size={30} /></span><span className={styles.cardEyebrow}>SOLICITUD REGISTRADA</span><h2>Continuemos por WhatsApp.</h2><p>El equipo tiene tu solicitud para coordinar una demo sobre {saved?.business}.</p><div className={styles.result}><ShieldCheck size={23} /><div><b>Tu contacto y tu beneficio están guardados.</b><p>Todavía no hay una cita reservada. Acordaremos el horario contigo.</p></div></div><p className={styles.benefitReminder}>EFFIX50 · 50% en la implementación inicial al contratar del 14 al 20 de octubre de 2026.</p><button className={styles.textButton} onClick={() => setStep("benefit")}>Ver mi beneficio <ArrowRight size={16} /></button></div>}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.panelSeal}><ShieldCheck size={14} /> Tus datos se registran solo cuando tú lo autorizas.</div>
        </section>
      </main>

      <aside id="beneficio" className={styles.benefitStrip} aria-label="Beneficio de la campaña">
        <div className={styles.discount}><span>BENEFICIO EFFIX</span><b>50<small>%</small><i>OFF</i></b></div>
        <div className={styles.benefitCopy}><h2>El primer paso tiene beneficio.</h2><p>50% de descuento en la implementación inicial de BotPager al contratar del <strong>14 al 20 de octubre de 2026</strong>. Más una demo de 15 minutos sin costo.</p><details><summary>Conoce las condiciones <ChevronRight size={13} /></summary><ul><li>Para negocios registrados en esta campaña del 14 al 20 de octubre de 2026, hora de Colombia.</li><li>Contratación del 14 de octubre a las 00:00 hasta el 20 de octubre a las 23:59:59 (America/Bogota).</li><li>Una aplicación por negocio sobre el precio aprobado de implementación inicial.</li><li>No aplica a mensualidades, consumo de canales, herramientas de terceros ni ampliaciones. No acumulable.</li><li>La propuesta comercial debe especificar el alcance y la aceptación de contratación; antes del pago se muestran precio regular, descuento y precio final.</li><li>El código EFFIX50 es de campaña. La elegibilidad se verifica con tu registro en el CRM. No necesitas reservar una cita para conservar el beneficio.</li></ul></details></div>
        <div className={styles.stripCode}><span>TU CÓDIGO DE CAMPAÑA</span><b>EFFIX50</b><span>Una aplicación por negocio.</span></div>
      </aside>
      <footer className={styles.footer}><span>© 2026 BotPager · Uno Zero Marketing LLC</span><div><Link href="/es/feriaEffix2026/privacidad">Tratamiento de datos</Link><a href="mailto:info@botpager.com">info@botpager.com</a></div><small>Experiencia de BotPager. No implica una alianza con el organizador de EFFIX.</small></footer>
    </div>
  );
}
