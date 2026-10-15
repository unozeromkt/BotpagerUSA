import { useEffect, useState } from "react";
import { Film, Grid3X3, ShoppingBag, Heart, MessageCircle, Send, Play, ArrowUpRight, Bot, LayoutDashboard, CheckCircle2, UserRound, Sparkles, Globe } from "lucide-react";
import { BrandMark, brandStyle, type BrandAssets } from "./brand-assets";
import s from "./experience.module.css";

export function WebMockup({business,assets,spotlight=false}:{business:string;assets:BrandAssets;spotlight?:boolean}) {
  return <article className={s.websiteMock} data-spotlight={spotlight} style={brandStyle(assets)} aria-label={`Propuesta web de ${business}`}>
    <div className={s.mockupLabel}><Globe size={14}/><b>PROPUESTA WEB</b><span>BOTPAGER · HERO</span></div>
    <div className={s.websiteWindow}>
      <div className={s.websiteBrowser} aria-hidden="true"><i/><i/><i/><span>Tu espacio digital</span></div>
      <div className={s.websiteNav}><div><BrandMark assets={assets} business={business}/><b>{business}</b></div><span>Inicio &nbsp;·&nbsp; Nosotros &nbsp;·&nbsp; Contacto</span></div>
      <div className={s.websiteHero}><div className={s.websiteCopy}><span>BIENVENIDO A {business}</span><h2>Una marca.<br/><strong>Todo por descubrir.</strong></h2><p>Conoce nuestra propuesta y encuentra lo que necesitas. Estamos aquí para ayudarte.</p><span className={s.websiteCta}>Conoce más <ArrowUpRight size={15}/></span></div><div className={s.websiteArt}><CampaignArt assets={assets} panel={1}/><div className={s.websiteBrandCard}><BrandMark assets={assets} business={business}/><b>{business}</b></div></div></div>
      <div className={s.websiteAssistant}><Bot size={20}/><div><b>Hola, soy el asistente de {business}</b><span>¿En qué podemos ayudarte hoy?</span></div><MessageCircle size={19}/></div>
    </div>
    <p className={s.websiteCaption}>Tu identidad en una web que presenta tu negocio y conecta cada visita con una conversación.</p>
  </article>;
}

function CampaignArt({ assets, panel=0 }: { assets: BrandAssets; panel?: number }) {
  return <div className={s.campaignArt} data-variant={panel} style={assets.generated ? {backgroundImage:`url(${assets.generated})`,backgroundSize:'300% auto',backgroundPosition:`${panel*50}% center`} : undefined}>
    {!assets.generated&&<div className={s.campaignSculpture} aria-hidden="true"><i/><i/><i/></div>}
  </div>;
}
export function Mockups({ business, assets, compact=false, onExplore, onReady }: { business:string; assets:BrandAssets; compact?:boolean; onExplore?:()=>void; onReady?:(ready:boolean)=>void }) {
  const [before,setBefore]=useState(false);
  useEffect(()=>{
    if(!onReady)return;
    let cancelled=false;
    onReady(false);
    if(!assets.generated){onReady(true);return;}
    const image=new Image();image.src=assets.generated;
    void image.decode().catch(()=>{}).then(()=>{if(!cancelled)onReady(true);});
    return()=>{cancelled=true;};
  },[assets.generated,onReady]);
  return <section className={s.mockupShowcase} style={brandStyle(assets)} data-before={before} data-compact={compact} aria-label="Mockups personalizados de tu marca">
    <div className={s.mockupToolbar}><div><span>UN LOGO. MUCHAS POSIBILIDADES.</span><b>{business}</b></div><div className={s.comparisonToggle} role="group" aria-label="Comparar antes y después"><button type="button" aria-pressed={before} onClick={()=>{setBefore(true);onExplore?.();}}>Antes</button><button type="button" aria-pressed={!before} onClick={()=>{setBefore(false);onExplore?.();}}>Después</button></div></div>
    {before ? <div className={s.originalBoard}><div><BrandMark assets={assets} business={business}/><b>{business}</b></div><p>{assets.logo?'Tu imagen original, antes de aplicarla a la campaña.':'El nombre de tu negocio, como punto de partida.'}</p><span>La propuesta conserva tu identidad y explora cómo llevarla a nuevos formatos.</span><div className={s.beforeTags}><span>Identidad inicial</span><span>Canales por diseñar</span><span>Atención por conectar</span></div></div> : <><div className={s.mockupGrid}>
      <article className={s.reelMock}><div className={s.mockupLabel}><Film size={14}/><b>REEL</b><span>9:16</span></div><div className={s.mockPhone}><div className={s.phoneNotch}/><CampaignArt assets={assets}/><div className={s.mockReelTop}><BrandMark assets={assets} business={business}/><b>{business}</b></div><div className={s.mockReelCopy}><span>UNA NUEVA PERSPECTIVA</span><strong>Tu marca.<br/>En movimiento.</strong><span>Descubre lo que viene <ArrowUpRight size={13}/></span></div><div className={s.mockReelActions}><Heart/><MessageCircle/><Send/></div><div className={s.mockReelPlay}><Play size={12} fill="currentColor"/><span>Concepto animado</span><i/></div></div><p>Portada + dirección visual</p></article>
      <article className={s.feedMock}><div className={s.mockupLabel}><Grid3X3 size={14}/><b>FEED SOCIAL</b><span>3 × 3</span></div><div className={s.mockFeed}><div className={s.feedProfile}><BrandMark assets={assets} business={business}/><div><b>{business}</b><span>Una identidad que conecta.</span></div></div><div className={s.feedTiles}>{Array.from({length:9},(_,i)=><div key={i} data-tile={i%3}>{i%3===0?<><BrandMark assets={assets} business={business}/><span>{['Conecta.','Inspira.','Crece.'][i/3]}</span></>:i%3===1?<CampaignArt assets={assets} panel={1}/>:<><strong>{i===2?'Hola.':i===5?'Somos.':'Vamos.'}</strong><span>{business}</span></>}</div>)}</div><div className={s.feedBottom}><Heart size={15}/><MessageCircle size={15}/><Send size={15}/><span>Así podría verse tu perfil</span></div></div><p>Una cuadrícula con identidad</p></article>
      <article className={s.merchMock}><div className={s.mockupLabel}><ShoppingBag size={14}/><b>MERCHANDISING</b><span>FÍSICO</span></div><div className={s.merchScene}>{assets.generated?<CampaignArt assets={assets} panel={2}/>:<><div className={s.tote}><div className={s.toteHandle}/><BrandMark assets={assets} business={business}/><b>{business}</b></div><div className={s.mug}><BrandMark assets={assets} business={business}/></div><div className={s.businessCards}><BrandMark assets={assets} business={business}/><b>{business}</b></div></>}</div><p>Bolsa, taza y tarjetas de marca</p></article>
    </div>{compact&&<WebMockup business={business} assets={assets}/>}<div className={s.systemGrid} aria-label="Atención y seguimiento de BotPager">
      <article className={s.chatMock}><div className={s.mockupLabel}><Bot size={14}/><b>CHATBOT CON IA</b><span>BOTPAGER</span></div><div className={s.chatWindow}><div className={s.chatHeader}><BrandMark assets={assets} business={business}/><div><b>{business}</b><span>Asistente disponible</span></div><i/></div><div className={s.chatMessages}><span className={s.chatVisitor}>Hola, ¿cómo puedo conocer sus servicios?</span><div className={s.chatAnswer}><Sparkles size={14}/><p>¡Hola! Te ayudo a encontrar la mejor opción para ti. ¿Qué necesitas hoy?</p></div><span className={s.chatVisitor}>Quiero hablar con el equipo.</span><div className={s.chatAnswer}><Sparkles size={14}/><p>Claro. Dejo tu consulta lista para que el equipo continúe con contexto.</p></div></div><div className={s.chatComposer}><span>Escribe tu mensaje…</span><Send size={15}/></div></div><p>Atención conectada con tu marca</p></article>
      <article className={s.crmMock}><div className={s.mockupLabel}><LayoutDashboard size={14}/><b>CRM DE OPORTUNIDADES</b><span>BOTPAGER</span></div><div className={s.crmWindow}><div className={s.crmHeader}><div><BrandMark assets={assets} business={business}/><div><b>{business}</b><span>Panel comercial · ejemplo</span></div></div><span>● En equipo</span></div><div className={s.crmSummary}><div><small>Conversaciones</small><strong>08</strong></div><div><small>Por contactar</small><strong>03</strong></div><div><small>Seguimiento</small><strong>05</strong></div></div><div className={s.crmLanes}><div><b>Nuevo interés</b><span><UserRound size={13}/> Consulta por servicios</span></div><div><b>En conversación</b><span><MessageCircle size={13}/> Respuesta enviada</span></div><div><b>Próximo paso</b><span><CheckCircle2 size={13}/> Llamada por coordinar</span></div></div><div className={s.crmFoot}>Cada contacto llega con contexto para tu equipo <ArrowUpRight size={13}/></div></div><p>Seguimiento humano con información organizada</p></article>
    </div></>}
    <p className={s.mockupDisclosure}>{assets.generated?'Concepto visual generado con IA · el logo original se conserva en las capas de la interfaz.':'Composiciones de ejemplo con tu nombre y logo · sin generación de IA.'} Los reels son mockups animados, no videos finales. El chat y el CRM muestran datos ficticios para ilustrar el recorrido.</p>
  </section>;
}
