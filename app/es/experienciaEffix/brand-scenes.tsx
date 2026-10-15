import { ArrowRight, Check, Target, Users, Megaphone, BarChart3 } from "lucide-react";
import { BrandMark, type BrandAssets } from "./brand-assets";
import { clamp } from "./timeline";
import s from "./experience.module.css";

// Hypothetical inputs, not customer results or a forecast. Outputs are calculated.
const baseline = { visits: 1000, inquiryRate: .02, closeRate: .2 };
const scenario = { visits: 1500, inquiryRate: .03, closeRate: .2 };
function funnel(input: typeof baseline) {
  const inquiries = Math.round(input.visits * input.inquiryRate);
  return { visits: input.visits, inquiries, sales: Math.round(inquiries * input.closeRate) };
}
const before = funnel(baseline), after = funnel(scenario);
const format = (value: number) => value.toLocaleString("es-ES");

export function BrandScene({ business, kind, local, assets }: { business: string; kind: "branding" | "strategy" | "growth"; local: number; assets: BrandAssets }) {
  const reveal = (at: number) => ({ opacity: .3 + .7 * clamp((local-at)/.7), transform: `translateY(${(1-clamp((local-at)/.7))*12}px)` });
  return <section className={s.brandStage} data-kind={kind} aria-label={kind === "branding" ? "Construcción de la identidad" : kind === "strategy" ? "Plan de estrategia digital" : "Transformación de marca y simulación de crecimiento"}>
    {kind === "branding" && <>
      <div className={s.identityJourney}>
        <div className={s.brandBefore}><span className={s.cardEyebrow}>EL PUNTO DE PARTIDA</span><b>{business}</b><div className={s.sketchMark}>{assets.logo?<BrandMark assets={assets} business={business}/>:"?"}</div><p>{assets.logo?"Tu logo original.":"Una idea con potencial."}<br/>Nuevas posibilidades por explorar.</p></div>
        <ArrowRight className={s.journeyArrow} aria-hidden="true"/>
        <div className={s.brandAfter} style={reveal(.3)}><span className={s.cardEyebrow}>TU IDENTIDAD TOMA FORMA</span><div className={s.newWordmark}><BrandMark assets={assets} business={business}/><b>{business}</b></div><p>Una nueva perspectiva.</p><div className={s.brandPalette}><i/><i/><i/><i/></div><div className={s.brandType}><strong>Aa</strong><span>Clara. Cercana.<br/>Con personalidad.</span></div></div>
      </div>
      <div className={s.brandDeliverables}>{["Identidad visual", "Paleta + tipografía", "Voz de marca"].map((item,index)=><span key={item} style={reveal(1+index*.8)}><Check size={14}/>{item}</span>)}</div>
      <p className={s.sceneNote}>Groovy construye un sistema de marca coherente para todos tus puntos de contacto. Identidad de ejemplo.</p>
    </>}
    {kind === "strategy" && <>
      <div className={s.strategyNorth}><Target size={25}/><div><span>EL OBJETIVO DE EJEMPLO</span><b>Convertir el interés en consultas</b></div></div>
      <div className={s.strategyGrid}>{[
        { icon: Users, title: "A quién", text: "Personas que necesitan lo que tu negocio ofrece", detail: "Audiencia + necesidades" },
        { icon: Megaphone, title: "Qué y dónde", text: "Un mensaje consistente en contenido y campañas", detail: "Canales + calendario" },
        { icon: BarChart3, title: "Cómo medimos", text: "Visitas, consultas y oportunidades para aprender", detail: "Indicadores + ajustes" },
      ].map((item,index)=><div key={item.title} style={reveal(index*.9)}><item.icon size={23}/><b>{item.title}</b><p>{item.text}</p><span>{item.detail}</span></div>)}</div>
      <div className={s.strategyLoop}><span>Planificar</span><ArrowRight size={14}/><span>Publicar</span><ArrowRight size={14}/><span>Medir</span><ArrowRight size={14}/><b>Ajustar ↺</b></div>
      <p className={s.sceneNote}>Groovy dirige la estrategia. Los datos de atención y CRM de BotPager ayudan a entender qué ocurre después del clic.</p>
    </>}
    {kind === "growth" && <>
      <div className={s.transformation}><div><span>ASÍ EMPIEZA</span><b>{business}</b><small>Una idea · presencia por definir</small></div><ArrowRight size={24} aria-hidden="true"/><div><span>ASÍ SE CONECTA TODO</span><b className={s.transformedBrand}><BrandMark assets={assets} business={business}/>{business}</b><small>Marca + estrategia + contenido + web + CRM</small></div></div>
      <div className={s.metricsHeader}><b>¿Cómo se vería el crecimiento?</b><span>SIMULACIÓN · BASE → ESCENARIO</span></div>
      <div className={s.growthMetrics}>{[
        {label:"Visitas a la web",start:before.visits,end:after.visits,owner:"Groovy · atracción"},
        {label:"Consultas recibidas",start:before.inquiries,end:after.inquiries,owner:"BotPager · captura y atención"},
        {label:"Ventas en el ejemplo",start:before.sales,end:after.sales,owner:"Tu equipo · cierre"},
      ].map((metric,index)=><div key={metric.label}><span>{metric.label}</span><div className={s.metricValues}><small>{format(metric.start)}</small><ArrowRight size={16}/><strong>{format(Math.round(metric.start+(metric.end-metric.start)*clamp((local-index*.7)/2)))}</strong></div><div className={s.metricBar}><i style={{width:`${metric.start/metric.end*100}%`}}/><b style={{transform:`scaleX(${clamp((local-index*.7)/2)})`}}/></div><em>+{Math.round((metric.end/metric.start-1)*100)}% en este escenario</em><small>{metric.owner}</small></div>)}</div>
      <p className={s.assumptions}><strong>Supuestos del ejemplo, para un mismo período:</strong> visitas de 1.000 a 1.500; tasa de consulta del 2% al 3%; cierre del 20% en ambos casos. 1.500 × 3% = 45 consultas; 45 × 20% = 9 ventas. <b>Son cifras ilustrativas, no resultados reales ni una promesa de crecimiento.</b></p>
      <p className={s.sceneNote}>Groovy atrae y ajusta la estrategia. BotPager atiende y organiza. Tu equipo convierte las oportunidades en relaciones comerciales.</p>
    </>}
  </section>;
}
