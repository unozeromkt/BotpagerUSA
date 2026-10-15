import {Globe,MapPin,ExternalLink} from 'lucide-react';
import {SocialIcon,networkLabels} from './icons';
import {socialLink,type SocialLinks,type SocialNetwork} from '../../../../lib/visibility-audit/social-links';
import d from './diagnostic.module.css';
export function ProfileSignals({website:websiteInput,maps:mapsInput,socialLinks={}}:{website?:string;maps?:string;socialLinks?:SocialLinks}){
 const safe=(value?:string)=>{try{const url=new URL(value||'');return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:'';}catch{return '';}};
 const website=safe(websiteInput),maps=safe(mapsInput);
 const links=Object.entries(socialLinks).filter(([,url])=>url&&socialLink(url)) as [SocialNetwork,string][];
 if(!website&&!maps&&!links.length)return null;
 return <section className={d.profileSignals} aria-label="Enlaces identificados"><span className={d.kicker}>TU PRESENCIA CONECTADA</span><div>{website&&<a href={website} target="_blank" rel="noreferrer"><Globe size={20}/><span>Web<small>{new URL(website).hostname}</small></span><ExternalLink size={12}/></a>}{maps&&<a href={maps} target="_blank" rel="noreferrer"><MapPin size={20}/><span>Google Maps<small>Ver ficha</small></span><ExternalLink size={12}/></a>}{links.map(([network,url])=><a key={network} href={url} target="_blank" rel="noreferrer"><SocialIcon network={network}/><span>{networkLabels[network]}<small>{network==='whatsapp'?'Contacto directo':new URL(url).pathname.replace(/^\//,'').replace(/\/$/,'')}</small></span><ExternalLink size={12}/></a>)}</div><small>Enlaces identificados. Un perfil enlazado no acredita seguidores ni actividad reciente.</small></section>;
}
