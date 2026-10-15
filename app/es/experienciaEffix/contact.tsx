import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Check, LoaderCircle, MessageCircle } from "lucide-react";
import { campaign, countries, jointExperience, type Booking, type CampaignSettings, type SavedLead } from "../feriaEffix2026/_lib/config";
import s from "./experience.module.css";

async function api(path: string, body: unknown) {
  const response = await fetch(`/es/feriaEffix2026/api/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok || data.ok !== true) throw new Error(data.message || "No pudimos completar la solicitud. Intenta de nuevo.");
  return data;
}
export function Contact({ business, settings, reportGate=false, onComplete, initialLead }: { business: string; settings: CampaignSettings; reportGate?:boolean; onComplete?:(lead?:SavedLead)=>void; initialLead?:SavedLead }) {
  const [fields,setFields] = useState({name:'',business,phone:'',country:'CO',consent:false,marketing:false,websiteTrap:''});
  const [saved,setSaved] = useState<SavedLead|undefined>(initialLead);
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [booking,setBooking] = useState<Booking>(), [coordinated,setCoordinated] = useState(false);
  const [calendar,setCalendar] = useState(false), [slots,setSlots] = useState<string[]>([]), [selected,setSelected] = useState('');
  const [zone,setZone] = useState(campaign.timezone as string), [week,setWeek] = useState(0), [email,setEmail] = useState('');
  const operation = useRef('');
  const update = (key: string, value: string | boolean) => setFields(previous=>({...previous,[key]:value}));
  async function run(action:()=>Promise<void>) { setBusy(true); setError(''); try { await action(); } catch(error) { setError(error instanceof Error ? error.message : 'No hay conexión. Conservamos tus datos; puedes reintentar.'); } finally { setBusy(false); } }
  function submit(event: FormEvent) { event.preventDefault(); void run(async()=>{
    if (!settings.live && reportGate) { onComplete?.(); return; }
    if (!settings.live) throw new Error('Demostración: el guardado en el CRM todavía no está habilitado en este entorno. Puedes conversar con el asesor.');
    operation.current ||= crypto.randomUUID();
    const search = new URLSearchParams(window.location.search);
    const tracking = Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content','tag_id'].flatMap(key=>{const value=search.get(key)||'';return /^[a-zA-Z0-9_-]{1,80}$/.test(value)?[[key,value]]:[];}));
    const data = await api('lead',{...fields,business:fields.business.trim(),origin:jointExperience.origin,operationId:operation.current,tracking});
    if (!data.lead?.receipt) throw new Error('No pudimos confirmar el guardado. Intenta de nuevo.');
    setSaved(data.lead);onComplete?.(data.lead);
  }); }
  function loadSlots(nextWeek=week,nextZone=zone) { if (!saved) return; setCalendar(true);setWeek(nextWeek);setZone(nextZone);setSelected('');setSlots([]);void run(async()=>{const data=await api('slots',{receipt:saved.receipt,timezone:nextZone,start:Date.now()+nextWeek*7*86400000});setSlots(data.slots);}); }
  function reserve(event: FormEvent) { event.preventDefault();if (!saved || !selected)return;void run(async()=>{const data=await api('booking',{receipt:saved.receipt,startTime:selected,timezone:zone,email});if(!data.booking?.id)throw new Error('La reserva no fue confirmada.');setBooking(data.booking);}); }
  function coordinate() { if(!saved)return;void run(async()=>{const data=await api('coordination',{receipt:saved.receipt});if(!data.taskId)throw new Error('No se pudo registrar la coordinación.');setCoordinated(true);setCalendar(false);}); }
  const date=(value:string)=>new Intl.DateTimeFormat('es',{timeZone:zone,weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
  return <section className={s.contact} aria-label="Hablemos de tu negocio">
    {!saved ? <><span className={s.eyebrow}>EL SIGUIENTE PASO ES CONTIGO</span><h1>{reportGate?<>Tu reporte para <span>{business}</span></>:<>¿Quieres esto para <span>{business}</span>?</>}</h1><p>{reportGate?"El reporte se abrirá aquí. Si el registro está habilitado, podremos contactarte sobre tu diagnóstico.":"Hablemos de cómo unir branding, estrategia digital, contenido y atención con IA en tu negocio."}</p>
      {!settings.live && <div className={s.notice}>Modo local · El CRM no está habilitado. Tus datos permanecen en esta sesión; no enviaremos el reporte por WhatsApp.</div>}
      {reportGate&&<div className={s.auditOffer}><span>BENEFICIO EXCLUSIVO · FERIA EFFIX</span><strong>50% OFF</strong><p>Por estar en Feria Effix, accedes a un <b>50% de descuento en la contratación de todos nuestros servicios.</b></p><small>Groovy + BotPager</small></div>}
      <form onSubmit={submit} className={s.form}>
        <label>Tu nombre<input required minLength={2} maxLength={100} autoComplete="name" value={fields.name} onChange={event=>update('name',event.target.value)} placeholder="¿Cómo te llamas?"/></label>
        <label>WhatsApp<div className={s.phone}><select aria-label="País y código de WhatsApp" value={fields.country} onChange={event=>update('country',event.target.value)}>{countries.map(country=><option key={country.id} value={country.id}>{country.dial} · {country.label}</option>)}</select><input aria-label="Número de WhatsApp" required type="tel" autoComplete="tel-national" maxLength={40} value={fields.phone} onChange={event=>update('phone',event.target.value)} placeholder="Tu número"/></div></label>
        <label>Tu negocio<input required minLength={1} maxLength={50} readOnly={reportGate} autoComplete="organization" value={fields.business} onChange={event=>update('business',event.target.value)}/></label>
        <div className={s.trap} aria-hidden="true"><label>Deja este campo vacío<input tabIndex={-1} autoComplete="off" value={fields.websiteTrap} onChange={event=>update('websiteTrap',event.target.value)}/></label></div>
        <label className={s.check}><input required type="checkbox" checked={fields.consent} onChange={event=>update('consent',event.target.checked)}/><span>{jointExperience.contactConsent}. <a href="/es/feriaEffix2026/privacidad" target="_blank" rel="noreferrer">Tratamiento de datos ↗</a></span></label>
        <label className={s.check}><input type="checkbox" checked={fields.marketing} onChange={event=>update('marketing',event.target.checked)}/><span>{campaign.marketingConsent} <small>(opcional)</small>.</span></label>
        <small className={s.privacy}>BotPager atiende tu solicitud. No compartimos tus datos con Groovy ni autorizamos marketing de Groovy mediante este formulario.</small>
        <button className={s.primary} disabled={busy}>{busy ? <LoaderCircle className={s.spinner}/> : null}{busy?'Enviando…':reportGate?'Abrir mi reporte y propuesta':'Hablemos de mi negocio'}<ArrowRight size={18}/></button>
      </form></> : <><span className={s.successIcon}><Check/></span><h1>¡Listo{fields.name.trim()?`, ${fields.name.trim().split(' ')[0]}`:''}!</h1><p>Ya recibimos tu solicitud para <strong>{saved.business}</strong>. Podemos conversar ahora o puedes elegir un horario.</p>
      {booking ? <div className={s.notice}><b>Tu cita está confirmada</b><p>{date(booking.startTime)} · {booking.timezone}</p>{booking.meetingUrl&&<a href={booking.meetingUrl} target="_blank" rel="noreferrer">Abrir reunión ↗</a>}{booking.rescheduleUrl&&<a href={booking.rescheduleUrl} target="_blank" rel="noreferrer"> Cambiar horario ↗</a>}</div> : coordinated ? <div className={s.notice}>✓ Registramos tu solicitud de coordinación por WhatsApp. El equipo retomará el contacto.</div> : <div className={s.successActions}>
        {settings.bookingEnabled ? <button className={s.primary} disabled={busy} onClick={()=>loadSlots(0)}><CalendarDays size={18}/>Elegir un horario</button> : <p>La agenda no está disponible. Podemos coordinar contigo por WhatsApp.</p>}
        <button className={s.secondary} disabled={busy} onClick={coordinate}><MessageCircle size={18}/>Prefiero coordinar por WhatsApp</button>
      </div>}
      {calendar&&!booking&&!coordinated&&<form className={s.form} onSubmit={reserve}><label>Zona horaria<select value={zone} disabled={busy} onChange={event=>loadSlots(week,event.target.value)}>{['America/Bogota','America/Caracas','America/Mexico_City','America/New_York','America/Lima','Europe/Madrid'].map(value=><option key={value}>{value}</option>)}</select></label><div className={s.week}><button type="button" disabled={busy||week===0} onClick={()=>loadSlots(week-1)}>← Anterior</button><span>Semana {week+1}</span><button type="button" disabled={busy||week>=11} onClick={()=>loadSlots(week+1)}>Siguiente →</button></div>{busy?<p role="status">Consultando agenda…</p>:slots.length?<label>Horario disponible<select required value={selected} onChange={event=>setSelected(event.target.value)}><option value="">Elige una hora</option>{slots.map(slot=><option key={slot} value={slot}>{date(slot)}</option>)}</select></label>:<p>No hay horarios disponibles en esta semana. Prueba otra semana o coordina por WhatsApp.</p>}{settings.requiresEmail&&<label>Correo para la invitación<input required type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)}/></label>}<button className={s.primary} disabled={busy||!selected}>Confirmar horario</button></form>}
    </>}
    {error&&<p className={s.error} role="alert">{error}</p>}
  </section>;
}
