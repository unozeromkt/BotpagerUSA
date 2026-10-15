"use client";
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { Camera, Upload, X } from "lucide-react";
import s from "./experience.module.css";
export type BrandAssets = { logo: string | null; accent: string; generated: string | null };
export const emptyAssets: BrandAssets = { logo: null, accent: "#562ff4", generated: null };
export function BrandMark({ assets, business }: { assets: BrandAssets; business: string }) {
  return assets.logo ? <img className={s.customerLogo} src={assets.logo} alt={`Logo de ${business}`}/> : <span aria-hidden="true">✳</span>;
}
export function brandStyle(assets: BrandAssets): CSSProperties { return { "--brand-color": assets.accent } as CSSProperties; }

export async function prepareLogo(file: File): Promise<Pick<BrandAssets, "logo" | "accent">> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Usa una foto JPG, PNG o WebP. Si tu foto es HEIC, expórtala como JPG.");
  if (file.size > 12_000_000) throw new Error("La imagen debe pesar menos de 12 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    if (!img.width || !img.height || img.width*img.height > 45_000_000) throw new Error("La imagen es demasiado grande. Prueba con una copia más pequeña.");
    const canvas = document.createElement("canvas"), scale = Math.min(1, 1000/Math.max(img.width,img.height));
    canvas.width = Math.max(1,Math.round(img.width*scale)); canvas.height = Math.max(1,Math.round(img.height*scale));
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("No pudimos preparar tu imagen.");
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    let logo = canvas.toDataURL("image/png");
    if (logo.length > 2_600_000) { const small = document.createElement("canvas"); small.width=Math.round(canvas.width*.6); small.height=Math.round(canvas.height*.6); small.getContext("2d")!.drawImage(canvas,0,0,small.width,small.height); logo=small.toDataURL("image/png"); }
    if (logo.length > 2_600_000) throw new Error("Prueba con una foto más pequeña o un logo sobre fondo sencillo.");
    const pixels = ctx.getImageData(0,0,canvas.width,canvas.height).data; const colors = new Map<string, number>();
    for (let i=0;i<pixels.length;i+=64) { const [r,g,b,a]=pixels.slice(i,i+4); const max=Math.max(r,g,b), min=Math.min(r,g,b); if(a<180||max-min<45||max<60||min>190)continue; const key=[r,g,b].map(x=>Math.min(240,Math.round(x/24)*24)).join(','); colors.set(key,(colors.get(key)||0)+1); }
    const dominant=[...colors].sort((a,b)=>b[1]-a[1])[0]?.[0];
    return { logo, accent: dominant ? `rgb(${dominant})` : "#562ff4" };
  } finally { URL.revokeObjectURL(url); }
}

export function useBrandAssets() {
  const [assets,setAssets]=useState<BrandAssets>(emptyAssets),[processing,setProcessing]=useState(false),[generating,setGenerating]=useState(false),[assetError,setAssetError]=useState('');
  const request=useRef<AbortController|null>(null), version=useRef(0), generationVersion=useRef(0);
  const pendingBusiness=useRef<{business:string;description:string}|null>(null), requested=useRef<{business:string;description:string;logo:string}|null>(null);
  useEffect(()=>()=>{version.current++;generationVersion.current++;request.current?.abort();},[]);
  function invalidate(resetUpload=false){if(resetUpload){setProcessing(false);version.current++;}generationVersion.current++;request.current?.abort();request.current=null;pendingBusiness.current=null;requested.current=null;setGenerating(false);setAssets(value=>({...value,generated:null}));setAssetError('');}
  async function requestGeneration(business:string,description:string,logo:string){
    if(requested.current?.business===business&&requested.current.logo===logo&&requested.current.description===description)return;
    request.current?.abort();
    const id=++generationVersion.current,assetVersion=version.current,controller=new AbortController();
    requested.current={business,description,logo};request.current=controller;setGenerating(true);setAssets(value=>({...value,generated:null}));setAssetError('');
    try{
      const response=await fetch('/es/experienciaEffix/api/mockups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({business,description,logo,consent:true}),signal:controller.signal});
      const data=await response.json();
      if(!response.ok)throw new Error(data.message||'No pudimos generar la propuesta.');
      if(typeof data.image!=='string'||!data.image.startsWith('data:image/webp;base64,'))throw new Error('No recibimos una imagen compatible.');
      if(id===generationVersion.current&&assetVersion===version.current)setAssets(value=>({...value,generated:data.image}));
    }catch(error){if(id===generationVersion.current&&!controller.signal.aborted){requested.current=null;setAssetError(error instanceof Error?error.message:'No pudimos generar la propuesta.');}}
    finally{if(id===generationVersion.current){setGenerating(false);request.current=null;}}
  }
  async function upload(event: ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value='';if(!file)return;invalidate(true);setAssets(emptyAssets);const id=version.current;setProcessing(true);try{const result=await prepareLogo(file);if(id===version.current){setAssets({...result,generated:null});if(pendingBusiness.current)void requestGeneration(pendingBusiness.current.business,pendingBusiness.current.description,result.logo!);}}catch(error){if(id===version.current)setAssetError(error instanceof Error?error.message:'No pudimos abrir la imagen.');}finally{if(id===version.current)setProcessing(false);}}
  function remove(){invalidate(true);setProcessing(false);setAssets(emptyAssets);}
  function startGeneration(business:string,description:string,available:boolean){const name=business.trim(),context=description.trim();if(!available||!name||name.length>50||context.length>400)return;pendingBusiness.current={business:name,description:context};if(assets.logo&&!processing)void requestGeneration(name,context,assets.logo);}
  return {assets,processing,generating,assetError,upload,remove,invalidate,startGeneration};
}
export type AssetController = ReturnType<typeof useBrandAssets>;
export function BrandInput({ controller, available }: { controller: AssetController; available: boolean }) {
  const {assets,processing,assetError}=controller;
  return <div className={s.brandInput}>
    <div className={s.uploadHeading}><b>Tu logo, en el centro de todo</b><span>Opcional</span></div>
    <div className={s.uploadButtons}><label><Upload size={16}/>Subir logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={controller.upload} aria-label="Subir logo" disabled={processing}/></label><label><Camera size={16}/>Tomar foto<input type="file" accept="image/*" capture="environment" onChange={controller.upload} aria-label="Tomar foto del logo" disabled={processing}/></label></div>
    {processing&&<p role="status">Preparando tu imagen…</p>}
    {assets.logo&&<div className={s.logoReview}><img src={assets.logo} alt="Imagen original cargada"/><div><b>Este es tu punto de partida</b><span>Conservamos tu logo en los mockups.</span></div><button type="button" aria-label="Quitar logo" onClick={controller.remove}><X size={16}/></button></div>}
    <p className={s.uploadHint}>Usa el archivo del logo o una foto de frente y bien iluminada. La vista previa se prepara en este dispositivo.</p>
    {available&&assets.logo?<p className={s.generationStatus}>Al iniciar, enviaremos el nombre, la descripción y el logo a OpenAI para crear tus mockups. Los verás al final del recorrido.</p>:!available?<p className={s.aiUnavailable}>La generación con IA no está habilitada en esta demo. Los mockups con tu logo están disponibles.</p>:null}
    {assetError&&<p className={s.error} role="alert">{assetError}</p>}
  </div>;
}
