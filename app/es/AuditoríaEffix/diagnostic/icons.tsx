import {Palette,Clapperboard,Globe,MonitorSmartphone,MapPin,Bot,Workflow} from 'lucide-react';
import type {Category} from './types';
import type {SocialNetwork} from '../../../../lib/visibility-audit/social-links';
export const serviceIcons={creative:Palette,content:Clapperboard,presence:Globe,web:MonitorSmartphone,seo:MapPin,chatbot:Bot,crm:Workflow};
export function ServiceIcon({category,size=22}:{category:Category;size?:number}){const Icon=serviceIcons[category];return <Icon size={size} aria-hidden="true"/>;}
export const networkLabels:Record<SocialNetwork,string>={instagram:'Instagram',tiktok:'TikTok',facebook:'Facebook',linkedin:'LinkedIn',youtube:'YouTube',x:'X',whatsapp:'WhatsApp'};
export function SocialIcon({network,size=19}:{network:SocialNetwork;size?:number}){
 const shapes={
 instagram:<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>,
 tiktok:<path fill="currentColor" stroke="none" d="M14.4 3h3.1c.3 1.8 1.3 3 3.5 3.3v3.1a8.4 8.4 0 0 1-3.5-1v6.8a5.8 5.8 0 1 1-5.8-5.8c.4 0 .8 0 1.2.1v3.2a2.8 2.8 0 1 0 1.5 2.5V3Z"/>,
 facebook:<path d="M14 21v-8h3l.5-4H14V7c0-1 1-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>,
 linkedin:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m4 0v-7m0 3c0-4 6-4 6 0v4"/><circle cx="7" cy="7" r=".7" fill="currentColor"/></>,
 youtube:<><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor"/></>,
 x:<><path d="m4 3 12 18h4L8 3Zm0 18L20 3"/></>,
 whatsapp:<><path d="M20.6 11.6a8.5 8.5 0 0 1-12.4 7.5L3 20.5l1.4-5.1A8.5 8.5 0 1 1 20.6 11.6Z"/><path d="M8.3 7.2c-.8.6-.9 1.4-.5 2.5 1 2.8 3.3 5 6 5.8 1.1.3 1.9-.1 2.3-.9l.3-.9-2.6-1.3-.8 1c-1.4-.6-2.6-1.8-3.2-3.2l.9-.8-1.2-2.5Z"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[network]}</svg>;
}
