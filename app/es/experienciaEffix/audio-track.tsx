"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Music2, Volume2, VolumeX, X } from "lucide-react";
import { audioToTimeline, timelineToAudio } from "./timeline";
import s from "./experience.module.css";

export function useAudioTrack(defaultSource: string | null) {
  const element=useRef<HTMLAudioElement>(null),objectUrl=useRef<string|null>(null);
  const previewTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [source,setSource]=useState<string|null>(defaultSource),[duration,setDuration]=useState(0),[muted,setMuted]=useState(!defaultSource),[error,setError]=useState(''),[previewing,setPreviewing]=useState(false);
  useEffect(()=>()=>{if(previewTimer.current)clearTimeout(previewTimer.current);if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);},[]);
  const ready=Boolean(source&&duration>0);
  function stopPreview(){if(previewTimer.current)clearTimeout(previewTimer.current);previewTimer.current=null;if(previewing)element.current?.pause();setPreviewing(false);}
  function upload(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>30_000_000||!(/\.(mp3|m4a|wav|ogg)$/i.test(file.name))){setError('Usa un MP3, M4A, WAV u OGG de hasta 30 MB.');return;}stopPreview();element.current?.pause();if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);objectUrl.current=URL.createObjectURL(file);setSource(objectUrl.current);setDuration(0);setError('');}
  function remove(){stopPreview();element.current?.pause();setSource(null);setDuration(0);setError('');if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);objectUrl.current=null;}
  function seek(time:number){if(element.current&&ready)element.current.currentTime=Math.min(duration,timelineToAudio(time,duration,source===defaultSource));}
  function play(){if(!element.current||!source)return;element.current.volume=1;element.current.muted=muted;void element.current.play().then(()=>setError('')).catch(()=>setError('El navegador bloqueó el sonido. El recorrido continúa; pulsa «Activar audio» para intentarlo de nuevo.'));}
  function preview(){const player=element.current;if(!player||!ready)return;if(previewing){stopPreview();return;}stopPreview();player.pause();player.currentTime=0;player.volume=1;player.muted=false;setMuted(false);void player.play().then(()=>{setError('');setPreviewing(true);previewTimer.current=setTimeout(()=>{player.pause();player.currentTime=0;setPreviewing(false);previewTimer.current=null;},5000);}).catch(()=>setError('No se pudo iniciar la prueba. Comprueba el volumen o vuelve a pulsar «Probar sonido».'));}
  function loaded(){const value=element.current?.duration||0;if(!Number.isFinite(value)||value<10||value>600){setDuration(0);setError('La pista debe durar entre 10 segundos y 10 minutos.');}else{setDuration(value);setError('');}}
  return {readTime:()=>audioToTimeline(element.current?.currentTime||0,duration,source===defaultSource),element,source,duration,muted,setMuted,error,setError,ready,previewing,preview,stopPreview,upload,remove,seek,play,loaded};
}
export type AudioTrack = ReturnType<typeof useAudioTrack>;
export function AudioSetup({track}:{track:AudioTrack}) {
  return <details className={s.audioSetup}><summary><Music2 size={15}/>Preparar música y locución</summary><p>Carga una pista única. Se queda en este dispositivo y acompaña todo el recorrido.</p><label className={s.audioUpload}>Cargar pista de audio<input type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,.mp3,.m4a,.wav,.ogg" onChange={track.upload}/></label>{track.source&&<div className={s.audioLoaded}><span>{track.ready?`Pista lista · ${Math.round(track.duration)} s`:'Preparando pista…'}</span>{track.ready&&<button type="button" className={s.audioPreview} onClick={track.preview}>{track.previewing?<><VolumeX size={14}/>Detener prueba</>:<><Volume2 size={14}/>Probar sonido 5 s</>}</button>}<button type="button" onClick={track.remove} aria-label="Quitar pista"><X size={15}/></button></div>}<p>La pista incluida sitúa la web en el segundo 45. Las pistas que cargues usan una distribución proporcional; requieren revisar sus propias marcas de locución.</p>{track.error&&<p role="alert">{track.error}</p>}</details>;
}
export function AudioToggle({track,manual}:{track:AudioTrack;manual:boolean}) {
  if(!track.source)return null;
  return <button type="button" disabled={!track.ready||manual} aria-pressed={!track.muted} onClick={()=>{if(track.muted){track.setMuted(false);if(track.element.current){track.element.current.muted=false;track.element.current.volume=1;void track.element.current.play().catch(()=>track.setError('El navegador bloqueó el sonido. Revisa el volumen de esta pestaña y del dispositivo.'));}}else track.setMuted(true);}} title={manual?'El audio se reproduce en modo automático':undefined}>{track.muted?<VolumeX size={16}/>:<Volume2 size={16}/>} {manual?'Audio: modo automático':track.muted?'Activar audio':'Audio encendido'}</button>;
}
