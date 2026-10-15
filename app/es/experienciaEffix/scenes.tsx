import type { CSSProperties } from "react";
import { Film, ImageIcon, Heart, MessageCircle, Send, VolumeX } from "lucide-react";
import { BrandMark, emptyAssets, type BrandAssets } from "./brand-assets";
import { Mockups, WebMockup } from "./mockups";
import { BrandScene } from "./brand-scenes";
import { clamp, scenes } from "./timeline";
import s from "./experience.module.css";

function Artwork({ variant = 0, time }: { variant?: number; time: number }) {
  return <div className={`${s.artwork} ${s[`art${variant}`]}`} aria-hidden="true">
    <div className={s.orbit} style={{ transform: `rotate(${time * 7 + variant * 40}deg)` }} />
    <div className={s.sculpture} style={{ transform: `translateY(${Math.sin(time * .8 + variant) * 7}px) rotate(${variant * 15 - 12}deg)` }}><i /><i /><i /></div>
    <span className={s.artCaption}>{["Una nueva perspectiva.", "Hecho para conectar.", "Tu próxima historia."][variant]}</span>
  </div>;
}
function ReelOverlay({ time }: { time: number }) {
  return <div className={s.reelOverlay} aria-label="Reel de video vertical">
    <span className={s.reelBadge}><Film size={12}/> REEL</span>
    <div className={s.reelActions} aria-hidden="true"><Heart/><MessageCircle/><Send/></div>
    <div className={s.reelBottom}><span>▶ {`00:${String(Math.floor(time * 2)).padStart(2, "0")}`}</span><VolumeX size={11}/></div>
    <div className={s.reelProgress}><i style={{transform:`scaleX(${.12 + clamp(time/7)*.88})`}}/></div>
  </div>;
}
function Studio({ production, time, local }: { production: boolean; time: number; local: number }) {
  return <svg className={s.studio} viewBox="0 0 760 440" fill="none" aria-label={production ? "Set audiovisual con cámara, luces y edición" : "Mesa creativa con equipo, bocetos y guion"} role="img">
    <defs><linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ded7eb"/><stop offset="1" stopColor="#c1b5d8"/></linearGradient><linearGradient id="beam"><stop stopColor="#fff4c4" stopOpacity=".7"/><stop offset="1" stopColor="#fff4c4" stopOpacity="0"/></linearGradient></defs>
    <ellipse cx="380" cy="370" rx="292" ry="44" fill="#c9bfdc" opacity=".3"/>
    <path d="M130 260L477 210 644 303 292 365Z" fill="url(#desk)" stroke="#b0a3c7"/>
    <path d="M130 260V275L292 380 644 319V303L292 365Z" fill="#b4a6c9"/>
    <path d="M163 297V365M600 332V390M307 378V420" stroke="#887697" strokeWidth="13"/>
    <g opacity={production ? .18 : 1}>
      <path d="M164 263L234 247 298 281 225 299Z" fill="#fcfbf6"/>
      <path d="M184 264L239 285M197 260L252 281M210 258L263 277" stroke="#b6a5d7" strokeWidth="3"/>
      <path d="M492 280L545 270 589 294 536 305Z" fill="#fff4c4"/>
      <path d="M509 282L548 293M520 279L560 290" stroke="#b7a878" strokeWidth="3"/>
      <path d="M153 213C151 167 205 160 223 190L227 227" fill="#8266b0"/>
      <circle cx="186" cy="151" r="22" fill="#dab89e"/><path d="M164 147C158 113 210 119 209 151L195 133Z" fill="#393047"/>
      <path d="M187 201L228 231 276 222" stroke="#dab89e" strokeWidth="15" strokeLinecap="round" style={{ transformOrigin: "187px 201px", transform: `rotate(${Math.sin(time) * 5}deg)` }}/>
      <path d="M586 253C587 205 546 190 525 226L520 257" fill="#2f3e4a"/>
      <circle cx="555" cy="183" r="21" fill="#bb8469"/><path d="M534 180C521 151 576 149 577 183L553 167Z" fill="#27242b"/>
      <path d="M551 235L527 270 480 278" stroke="#bb8469" strokeWidth="14" strokeLinecap="round"/>
    </g>
    <g opacity={production ? 1 : .35}>
      <path d="M105 112V309M105 263L76 319M105 263L135 320" stroke="#514a62" strokeWidth="6"/>
      <path d="M75 82L123 70 153 127 106 145Z" fill="#383044"/><path d="M116 84L139 127 385 220 396 110Z" fill="url(#beam)"/>
      <path d="M628 226V344M628 279L596 350M628 279L660 350" stroke="#514a62" strokeWidth="6"/>
      <g style={{ transform: `translateX(${production ? Math.sin(time) * 5 : 0}px)` }}><rect x="598" y="174" width="60" height="48" rx="9" fill="#383044"/><path d="M596 184L572 176V220L596 211Z" fill="#514a62"/><circle cx="617" cy="164" r="18" fill="#655773"/><circle cx="650" cy="164" r="15" fill="#655773"/><circle cx="617" cy="164" r="8" fill="#342c40"/><circle cx="650" cy="164" r="6" fill="#342c40"/><rect x="628" y="191" width="15" height="5" rx="2" fill="#c6f292"/></g>
      <path d="M537 316L592 308 592 336 537 344Z" fill="#332c40"/><path d="M537 311L590 293" stroke="#332c40" strokeWidth="10" style={{ transformOrigin: "537px 311px", transform: `rotate(${production ? Math.max(0, 1 - local) * -30 : 0}deg)` }}/>
    </g>
  </svg>;
}
export function Scene({ business, phase: sceneIndex, time, intro = false, assets = emptyAssets, onExplore }: { business: string; phase: number; time: number; intro?: boolean; assets?: BrandAssets; onExplore?:()=>void }) {
  const scene = scenes[sceneIndex];
  const local = clamp((time - scene.start) / 3.2) * scene.motionDuration;
  if (typeof scene.visual === "string") return <BrandScene business={business} kind={scene.visual} local={local} assets={assets}/>;
  const phase = scene.visual;
  if (scene.label === "Producción") return <Mockups business={business} assets={assets} onExplore={onExplore}/>;
  if (scene.label === "Web + IA") return <WebMockup business={business} assets={assets} spotlight/>;
  const short = business.length > 25 ? `${business.slice(0, 23)}…` : business;
  const crmColumn = local < 1.7 ? 0 : local < 3.7 ? 1 : 2;
  return <div className={s.stage} data-phase={phase} data-intro={intro || undefined} aria-label={`Escenario personalizado para ${business}`}>
    <div className={s.stageHalo}/><div className={s.floor}/>
    {phase < 2 && <Studio production={phase === 1} time={time} local={local}/>}
    {phase === 0 && <div className={s.ideas}>
      <div className={s.note} style={{ transform: `translateY(${(1-clamp(time/.9))*-25}px) rotate(${-11-(1-clamp(time/.9))*15}deg)` }}><span>01 / ESTRATEGIA</span><b>Tu propuesta</b><div className={s.scribble}/></div>
      <div className={s.ideaSheet} style={{transform:`translateY(${(1-clamp((time-.4)/1.2))*-25}px) rotate(${12+(1-clamp((time-.4)/1.2))*15}deg)`}}><span>CONCEPTOS CREATIVOS</span><b>Una historia<br/>que conecta</b><p>Una idea para mostrar tu producto</p><div className={s.swatches}><i/><i/><i/></div></div>
      <div className={s.pencil}/>
    </div>}
    {phase === 1 && <div className={s.editing}><span>EDICIÓN / SECUENCIA 01</span><div><i/><i/><i/><i/></div><div className={s.playhead} style={{left:`${10+clamp(local/6)*80}%`}}/></div>}
    <div className={s.composition}>
      {phase < 4 && <>
        <div className={`${s.film} ${s.sideFilm} ${s.leftFilm}`} aria-hidden={phase !== 1 && phase !== 2}><b>{short}</b><div className={s.reelFrame}><Artwork variant={1} time={time}/><ReelOverlay time={local} /></div><span className={s.formatLabel}><Film size={12}/> REEL</span></div>
        <div className={`${s.film} ${s.sideFilm} ${s.rightFilm}`} aria-hidden={phase !== 1 && phase !== 2}><b>{short}</b><div className={s.imageFrame}><Artwork variant={2} time={0}/><span className={s.imageCount}>1 / 3</span></div><span className={s.formatLabel}><ImageIcon size={12}/> IMÁGENES</span></div>
      </>}
      <div className={s.mainObject}>
        <div className={s.browserBar}><i/><i/><i/><span>{phase === 5 ? 'ESPACIO COMERCIAL' : 'TU SITIO WEB'}</span></div>
        <div className={s.brandHeader}><span className={s.brandGlyph}><BrandMark assets={assets} business={business}/></span><b title={business}>{phase < 3 ? short : business}</b><span className={s.objectLabel}>{phase === 0 ? 'STORYBOARD / 01' : phase === 1 ? 'REEL / 01' : phase === 2 ? 'REEL' : phase === 5 ? 'CRM' : 'EN LÍNEA'}</span></div>
        {phase < 4 && <div className={s.heroArt}>{phase === 0 ? <div className={s.brandSeed}><span>EL PRIMER BOCETO</span><b>Tu idea,<br/>por descubrir.</b><i>✳</i></div> : <Artwork time={time}/>}{(phase === 1 || phase === 2) && <ReelOverlay time={local} />}{phase === 0 && <div className={s.storyboardLines}><i/><i/><i/></div>}{phase === 3 && <div className={s.webHeroCopy}><small>BIENVENIDO A</small><b>{short}</b><span>Conoce nuestra propuesta</span><em>Hablemos →</em></div>}</div>}
        {phase === 1 && <div className={s.mainFormat}><Film size={14}/><b>REEL</b><span>Video vertical · 9:16</span></div>}
        {phase === 2 && <div className={s.socialAction}><span>Una historia que conecta contigo.</span><b style={{background:local>3 ? '#562ff4' : undefined, color:local>3 ? 'white' : undefined}}>Conocer más ↗</b></div>}
        {phase === 3 && <><div className={s.services}><b>Nuestros servicios</b><div><span>Lo que hacemos</span><span>Cómo te ayudamos</span></div></div><div className={s.agentDock}><span>✳</span><div><b>Agente de {short}</b><small>Con la información de tu negocio</small></div><i/></div></>}
        {phase >= 4 && <div className={s.clientFlow}>
        {phase === 4 && <div className={s.chat}>
          <div className={s.chatHeading}>✳ <b>Agente de {short}</b><span>Ejemplo de conversación</span></div>
          {["Hola, quiero conocer sus servicios",`Bienvenido a ${business}. ¿Qué necesitas?`,"Quisiera una cotización","Cuéntame qué buscas y te ayudamos con el siguiente paso"].map((message,index)=><div key={index} className={index%2 ? s.agentBubble : s.visitorBubble} style={{opacity: local >= index*1.25 ? 1 : 0, transform:`translateY(${local >= index*1.25 ? 0 : 12}px)`}}>{message}</div>)}
          <div className={s.followup} style={{opacity:local>5 && local<=5.8 ? 1:0}}>✓ Solicitud recibida <span>→ Seguimiento acordado</span></div>
        </div>}
        {phase === 5 && <div className={s.crm}><div className={s.crmTitle}><b>Oportunidades</b><span>Tu equipo, al mando</span></div><div className={s.columns}>{['Nuevo contacto','En conversación','Compra confirmada'].map((title,index)=><div key={title} className={crmColumn===index ? s.activeColumn : ''}><span><i/>{title}</span></div>)}</div><div className={s.humanDecision}>{crmColumn===2 ? 'El cliente decide comprar. Tu equipo confirma.' : 'Tu equipo retoma la conversación con contexto.'}</div></div>}
        <div className={s.opportunity} style={{'--column':phase===5?crmColumn:0, opacity:phase===5||local>5.8?1:0} as CSSProperties}><span className={s.avatar}>C</span><b>Cliente de ejemplo</b><small>Interés: cotización</small><em>{phase===4 ? 'Solicitud recibida → Seguimiento acordado' : crmColumn===0 ? 'Solicitud recibida' : crmColumn===1 ? 'Seguimiento acordado' : '✓ Confirmado por tu equipo'}</em></div>
        </div>}
      </div>
    </div>
    {phase === 2 && <div className={s.audience}><span>Personas que descubren tu marca</span><div><i>A</i><i>M</i><i>C</i></div><b style={{opacity:local>2 ? 1:0}}>Alguien quiere saber más ↗</b></div>}
    {phase === 3 && <div className={s.documents}>{['Servicios','Preguntas frecuentes','Horarios','Políticas'].map((label,index)=><div key={label} style={{opacity:local>index*.9 ? 1:.25, transform:`translateY(${local>index*.9 ? 0:14}px)`}}><span>≡</span>{label}<i>{local>index*.9+1 ? '✓' : '+'}</i></div>)}<small>Información proporcionada por tu negocio</small></div>}
    {phase === 0 && <span className={s.stageCaption}>EL ESTUDIO / DONDE EMPIEZA TODO</span>}
  </div>;
}
