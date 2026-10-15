"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import type { CampaignSettings } from "../feriaEffix2026/_lib/config";
import { BrandInput, BrandMark, useBrandAssets } from "./brand-assets";
import { Mockups } from "./mockups";
import { AudioSetup, AudioToggle, useAudioTrack } from "./audio-track";
import { Contact } from "./contact";
import { Scene } from "./scenes";
import { phaseAt, scenes, totalDuration } from "./timeline";
import s from "./experience.module.css";

function elasticScrollTo(element:HTMLElement|null,reduced:boolean) {
  if(!element)return () => {};
  const target=Math.max(0,Math.min(document.documentElement.scrollHeight-window.innerHeight,window.scrollY+element.getBoundingClientRect().top-20));
  if(reduced){window.scrollTo(0,target);return () => {};}
  const start=window.scrollY,distance=target-start,origin=performance.now(),duration=1250;
  let frame=0;
  const step=(now:number)=>{
    const progress=Math.min(1,(now-origin)/duration);
    const remaining=progress-1;
    const eased=1+2.25*remaining*remaining*remaining+1.25*remaining*remaining;
    window.scrollTo(0,start+distance*eased);
    if(progress<1)frame=requestAnimationFrame(step);
    else window.scrollTo(0,target);
  };
  frame=requestAnimationFrame(step);
  return ()=>cancelAnimationFrame(frame);
}

export function Experience({ settings, generationEnabled, audioSource }: { settings: CampaignSettings; generationEnabled: boolean; audioSource: string | null }) {
  const brand = useBrandAssets();
  const audio = useAudioTrack(audioSource);
  const [mode,setMode]=useState<'entry'|'film'|'contact'>('entry');
  const [draft,setDraft]=useState(''),[business,setBusiness]=useState('');
  const [description,setDescription]=useState(''),[resultReady,setResultReady]=useState(false);
  const [time,setTime]=useState(0),[paused,setPaused]=useState(false),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(false);
  const [error,setError]=useState('');
  const [manual,setManual]=useState(false);
  const stepByStep=reduced||manual;
  const focus=useRef<HTMLDivElement>(null),formAnchor=useRef<HTMLDivElement>(null),cancelScroll=useRef<()=>void>(()=>{}),scrollTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const phase=phaseAt(time), scene=scenes[phase];
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');const preference=()=>setReduced(media.matches);preference();media.addEventListener('change',preference);
    const visibility=()=>setHidden(document.hidden);visibility();document.addEventListener('visibilitychange',visibility);
    const previous=document.documentElement.lang;document.documentElement.lang='es';
    return()=>{media.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);document.documentElement.lang=previous;};
  },[]);
  useEffect(()=>{
    if(mode!=='film'||paused||hidden||stepByStep)return;
    let id:number;let last=performance.now();
    const tick=(now:number)=>{const delta=Math.min((now-last)/1000,.1);last=now;setTime(value=>Math.min(totalDuration,audio.ready&&audio.element.current&&!audio.element.current.paused ? audio.readTime() : value+delta));id=requestAnimationFrame(tick);};
    id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);
  },[mode,paused,hidden,stepByStep,audio.ready,audio.duration,audio.element,audio.source]);
  useEffect(()=>{
    const player=audio.element.current;
    if(!player||!audio.ready)return;
    if(mode!=='film'||paused||hidden||stepByStep){player.pause();return;}
    audio.seek(time);audio.play();
    return()=>player.pause();
    // A clock change alone must not restart the audio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[mode,paused,hidden,stepByStep,audio.ready,audio.source]);
  useEffect(()=>{
    if(time<totalDuration||mode!=='film')return;
    const frame=requestAnimationFrame(()=>finish());
    return()=>cancelAnimationFrame(frame);
    // finish uses the current accessibility preference and updates only this view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[time,mode,stepByStep]);
  useEffect(()=>{focus.current?.focus({preventScroll:true});focus.current?.scrollIntoView({block:'start',behavior:'instant'});},[mode]);
  useEffect(()=>{if(mode==='film'&&stepByStep){focus.current?.focus({preventScroll:true});focus.current?.scrollIntoView({block:'start',behavior:'instant'});}},[phase,mode,stepByStep]);
  useEffect(()=>{
    if(mode!=='contact'||brand.generating||(brand.assets.generated&&!resultReady))return;
    const stop=()=>{if(scrollTimer.current)clearTimeout(scrollTimer.current);scrollTimer.current=null;cancelScroll.current();};
    scrollTimer.current=setTimeout(()=>{scrollTimer.current=null;cancelScroll.current=elasticScrollTo(formAnchor.current,reduced);},5000);
    window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});
    return()=>{stop();window.removeEventListener('wheel',stop);window.removeEventListener('touchstart',stop);};
  },[mode,reduced,brand.generating,brand.assets.generated,resultReady]);
  function scrollNow(){if(scrollTimer.current)clearTimeout(scrollTimer.current);scrollTimer.current=null;cancelScroll.current();cancelScroll.current=elasticScrollTo(formAnchor.current,reduced);}
  function start(event?:FormEvent){event?.preventDefault();const name=draft.trim();if(!name||name.length>50){setError('Escribe un nombre de 1 a 50 caracteres.');return;}setError('');audio.stopPreview();setResultReady(false);brand.startGeneration(name,description,generationEnabled);setBusiness(name);setTime(0);audio.seek(0);setPaused(false);setMode('film');if(!stepByStep)audio.play();}
  function finish(){
    if(!stepByStep && typeof document.startViewTransition==='function') {
      document.startViewTransition(()=>flushSync(()=>setMode('contact')));
    } else setMode('contact');
  }
  function jump(index:number){const target=scenes[index].start;setTime(target);audio.seek(target);focus.current?.focus({preventScroll:true});focus.current?.scrollIntoView({block:'start',behavior:'instant'});}
  function next(){if(phase===scenes.length-1){setTime(totalDuration);setMode('contact');}else jump(phase+1);}
  // Reduced motion shows every scene's complete content and advances only on request.
  const displayTime=stepByStep?scene.end-.1:time;
  return <div className={s.page} lang="es" data-paused={paused||hidden||stepByStep}>
    <audio ref={audio.element} src={audio.source||undefined} preload="metadata" muted={audio.muted} onLoadedMetadata={audio.loaded} onEnded={()=>{if(mode==='film'&&!stepByStep)setTime(totalDuration);}} onError={()=>audio.setError('No se pudo abrir la pista. El recorrido continúa sin audio.')}/>
    <a href="#experience" className={s.skip}>Ir a la experiencia</a>
    <header className={s.header}><a href="/es/experienciaEffix" className={s.partners} aria-label="Groovy y BotPager"><img src="/es/experienciaEffix/groovy-logo-transparent.png" alt="Groovy" width="100" height="40"/><span className={s.plus}>+</span><span className={s.botLogo}><img src="/images/botpager-isotype.png" alt="" width="28" height="28"/>BotPager<span>®</span></span></a><div className={s.fair}><i/>EFFIX <b>2026</b><span>UNA EXPERIENCIA CONJUNTA</span></div></header>
    <main id="experience" ref={focus} tabIndex={-1} className={s.main}>
      {mode==='entry'&&<div className={s.entry}>
        <div className={s.entryCopy}><span className={s.eyebrow}><span/> GROOVY + BOTPAGER · EFFIX 2026</span><h1>Mira tu negocio<br/><em>en acción.</em><span className={s.headStar}>✳</span></h1><p className={s.intro}>De una idea a una marca con identidad, estrategia digital y un sistema que atiende y da seguimiento. Descubre el recorrido con tu negocio.</p><form onSubmit={start} className={s.startForm}><label htmlFor="business">¿Cómo se llama tu negocio?</label><input id="business" placeholder="Escribe el nombre de tu negocio" autoComplete="organization" required maxLength={50} value={draft} onChange={event=>{setDraft(event.target.value);brand.invalidate();}}/><div className={s.businessDescription}><label htmlFor="business-description">¿Qué hace tu negocio? <span>Opcional</span></label><textarea id="business-description" rows={3} maxLength={400} value={description} onChange={event=>{setDescription(event.target.value);brand.invalidate();}} placeholder="Ej.: Cafetería de especialidad para jóvenes profesionales. Café artesanal, repostería y un estilo cálido y natural." aria-describedby="description-hint"/><small id="description-hint">Cuéntanos qué vendes, a quién y qué estilo te representa. La IA usará este contexto para crear tu propuesta.</small></div><BrandInput controller={brand} available={generationEnabled}/>{audio.source&&<div className={s.soundRow}><label className={s.soundChoice}><input type="checkbox" checked={!audio.muted&&!stepByStep} disabled={!audio.ready||stepByStep} onChange={event=>audio.setMuted(!event.target.checked)}/><span>{stepByStep?"El modo paso a paso no reproduce audio":"Reproducir con música y locución"}</span></label>{audio.ready&&<button className={s.soundTest} type="button" onClick={audio.preview}>{audio.previewing?'Detener prueba':'Probar sonido 5 s'}</button>}</div>}<button className={s.primary}>Ver mi negocio en acción <ArrowRight size={20}/></button>{error&&<p role="alert" className={s.error}>{error}</p>}</form><div className={s.duration}><span>↳</span>Una experiencia de aproximadamente {audio.ready?Math.round(audio.duration):totalDuration} segundos<br/><small>Tu marca como protagonista. Audio opcional.</small></div><label className={s.manual}><input type="checkbox" checked={stepByStep} disabled={reduced} onChange={event=>setManual(event.target.checked)}/> Prefiero verlo paso a paso</label><AudioSetup track={audio}/></div>
        <div className={s.entryVisual}><div className={s.studioLabel}><span>DE LA IDEA A LA OPORTUNIDAD</span><ArrowUpRight size={19}/></div><Scene business={draft.trim()||'Tu negocio'} phase={0} time={0} intro assets={brand.assets}/><div className={s.visualFoot}><span>CREATIVIDAD HUMANA.<br/><b>POSIBILIDADES INTELIGENTES.</b></span><span className={s.roundArrow}>↗</span></div></div>
      </div>}
      {mode==='film'&&<div className={s.filmView} data-web={scene.label==='Web + IA'}>
        <div className={s.businessSpotlight} data-long={business.length > 24}><span>EL PROTAGONISTA ES TU NEGOCIO</span><div className={s.spotlightIdentity}><BrandMark assets={brand.assets} business={business}/><strong>{business}</strong></div></div>
        <div className={s.sceneCopy} key={`copy-${phase}`} aria-live="polite" aria-atomic="true"><div className={s.sceneMeta}><span>{String(phase+1).padStart(2,"0")} / {String(scenes.length).padStart(2,"0")}</span><span>{scene.owner}</span></div><h1>{scene.title}<span>.</span></h1><p>{scene.text}</p></div>
        <div className={s.ownership} aria-label="Responsables del recorrido"><div data-active={scene.team==='groovy'||scene.team==='joint'}><b>Groovy</b><span>Marca · estrategia · contenido</span></div><ArrowRight size={17} aria-hidden="true"/><div data-active={scene.team==='botpager'||scene.team==='joint'}><b>BotPager</b><span>Web + IA · atención · CRM</span></div></div>
        <div className={s.sceneTransition} key={phase}><Scene business={business} phase={phase} time={displayTime} assets={{...brand.assets,generated:null}} onExplore={()=>setPaused(true)}/></div>
        {audio.error&&<p className={s.sceneNote} role="status">{audio.error}</p>}
        <div className={s.playback}><div className={s.progress} role="progressbar" aria-label="Progreso del recorrido" aria-valuemin={0} aria-valuemax={totalDuration} aria-valuenow={Math.floor(time)}><i style={{transform:`scaleX(${time/totalDuration})`}}/></div><div className={s.phases}>{scenes.map((item,index)=><button type="button" key={item.label} aria-current={index===phase?'step':undefined} onClick={()=>jump(index)} data-active={index===phase} data-done={index<phase}>{index<phase?'✓':`0${index+1}`}<b>{item.label}</b></button>)}</div><div className={s.controls}><button onClick={()=>jump(Math.max(0,phase-1))} disabled={phase===0}><ArrowLeft size={16}/>Anterior</button>{stepByStep?<button onClick={next}>Continuar <ArrowRight size={16}/></button>:<button onClick={()=>setPaused(value=>!value)}>{paused?<Play size={16}/>:<Pause size={16}/>} {paused?'Continuar':'Pausar'}</button>}<AudioToggle track={audio} manual={stepByStep}/><small>Así podría funcionar para tu negocio · ejemplo ilustrativo</small><button onClick={finish}>Ir a hablemos <ArrowUpRight size={16}/></button></div></div>
      </div>}
      {mode==='contact'&&<><Mockups business={business} assets={brand.assets} compact onReady={setResultReady}/><section className={s.fairOffer} aria-labelledby="fair-offer"><div><span>EXCLUSIVO EFFIX 2026</span><h2 id="fair-offer">Solo por feria</h2><p>En la contratación de <strong>todos los servicios.</strong></p><small>GROOVY + BOTPAGER</small></div><strong className={s.offerNumber}>50%<span>OFF</span></strong></section>{brand.generating&&<p className={s.liveGeneration} role="status">La IA está terminando tus mockups. Aparecerán aquí al estar listos. Aparecerán al terminar la generación.</p>}{brand.assetError&&<p className={s.sceneNote} role="status">{brand.assetError}</p>}<div className={s.resultNext}><span>{brand.generating?'Estamos terminando tu propuesta visual.':'Explora el resultado durante 5 segundos. Después te llevamos al formulario.'}</span><button type="button" onClick={scrollNow}>Ir al formulario ahora <ArrowRight size={15}/></button></div><div className={s.conversion}><div className={s.endStory}><span className={s.eyebrow}>DE UNA IDEA A UNA MARCA CON FUTURO</span><div className={s.endBrand}><BrandMark assets={brand.assets} business={business}/><b>{business}</b></div><h2>Groovy construye tu marca y su estrategia. <br/>BotPager atiende y da seguimiento. <br/><em>Tu equipo avanza hacia la venta.</em></h2><p>Un recorrido posible. Una oportunidad para hacerlo tuyo.</p><div className={s.replay}><button onClick={()=>start()}><RotateCcw size={15}/>Volver a ver</button><button onClick={()=>{setMode('entry');setTime(0);}}>Cambiar negocio ↗</button></div></div><div ref={formAnchor} className={s.formAnchor}><Contact business={business} settings={settings}/></div></div></>}
    </main>
    <footer className={s.footer}><span>De una buena idea a una nueva oportunidad.</span><span>GROOVY + BOTPAGER <b> / </b> EFFIX 2026</span></footer>
  </div>;
}
