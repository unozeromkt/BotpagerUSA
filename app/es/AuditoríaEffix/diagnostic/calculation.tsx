'use client';
import {useEffect,useState} from 'react';
import {Check,Sparkles} from 'lucide-react';
import {categoryInfo} from './types';
import {ServiceIcon} from './icons';
import d from './diagnostic.module.css';
export function Calculation({scanning,onReady,onPartial}:{scanning:boolean;onReady:()=>void;onPartial:()=>void}){
 const [step,setStep]=useState(0);
 useEffect(()=>{const interval=setInterval(()=>setStep(n=>Math.min(n+1,3)),850);return()=>clearInterval(interval);},[]);
 useEffect(()=>{if(step===3&&!scanning){const timer=setTimeout(onReady,450);return()=>clearTimeout(timer);}},[step,scanning,onReady]);
 const labels=['Organizando las señales de tu negocio','Calculando tus siete áreas de oportunidad','Priorizando soluciones para tu objetivo','Preparando tu resumen personalizado'];
 return <section className={d.calculation} aria-label="Preparando tu diagnóstico"><span className={d.kicker}>TU NEGOCIO · TUS OPORTUNIDADES</span><div className={d.calculationOrb}><Sparkles size={38}/><i/><i/></div><h1>Conectando los puntos<br/>de <em>tu negocio.</em></h1><p role="status" aria-live="polite">{labels[step]}</p><div className={d.calculationServices}>{categoryInfo.map((service,i)=><span key={service.id} data-ready={i<=(step+1)*2}><ServiceIcon category={service.id}/><small>{service.label}</small>{i<=(step+1)*2&&<Check size={12}/>}</span>)}</div><div className={d.calculationTrack}><i style={{width:`${Math.min(96,25+step*24)}%`}}/></div><small>Organizamos tus respuestas y las evidencias disponibles. Las consultas pendientes no restan puntos.</small>{scanning&&step===3&&<><p>La consulta externa sigue en curso…</p><button type="button" className={d.outline} onClick={onPartial}>Continuar con los datos disponibles</button></>}</section>;
}
