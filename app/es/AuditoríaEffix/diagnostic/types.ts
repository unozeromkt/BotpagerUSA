import type {SocialLinks} from '../../../../lib/visibility-audit/social-links';
export type Category = 'creative'|'content'|'presence'|'web'|'seo'|'chatbot'|'crm';
export type EvidenceStatus = 'observed'|'declared'|'pending'|'na';
export type Candidate = { name:string; address:string; website:string; instagram:string; tiktok:string; maps:string; placeId?:string; socialLinks?:SocialLinks; sources:{title:string;url:string}[] };
export type Answers = { goal:'leads'|'brand'|'time'; response:'instant'|'nextday'|'none'|'unknown'; followup:'crm'|'manual'|'none'|'unknown'; content:'regular'|'occasional'|'none'|'unknown'; local:boolean; websiteState:'yes'|'no'|'unknown'; googleState:'yes'|'no'|'unknown'; chatbot:'ai'|'human'|'none'|'unknown'; identity?:'consistent'|'partial'|'none'|'unknown'; description:string };
export const defaultAnswers:Answers={goal:'leads',response:'unknown',followup:'unknown',content:'unknown',local:true,websiteState:'unknown',googleState:'unknown',chatbot:'unknown',identity:'unknown',description:''};
export type WebEvidence={url:string;title:string;description:string;headings:number;https:boolean;mobile:boolean;contact:boolean;cta:boolean;chatHint:boolean;noindex:boolean;canonical:boolean;sitemap:boolean|null;robots:boolean|null;performance:number|null;instagram:string;tiktok:string;socialLinks?:SocialLinks;pages:number};
export type GoogleEvidence={url:string;name:string;address:string;rating:number|null;reviews:number|null;phone:boolean;hours:boolean};
export type Scan={checkedAt:string;web:WebEvidence|null;google:GoogleEvidence|null;notes:string[]};
export type Check={id:string;category:Category;label:string;status:EvidenceStatus;value:string;points:number|null;weight:number;evidence:string;source?:string;action:string;impact:string;owner:'Groovy'|'BotPager'|'Groovy + BotPager';scene:number};
export type Report={business:string;website:string;description:string;checkedAt:string;checks:Check[];categories:{id:Category;label:string;score:number|null;coverage:number;weight:number;applicable:boolean}[];score:number|null;coverage:number;observed:number;declared:number;priorities:Check[];strengths:Check[];notes:string[];goal:Answers['goal'];socialLinks:SocialLinks};
export type DiagnosisContext={candidate:Candidate;answers:Answers;report:Report};
export const categoryInfo:{id:Category;label:string;weight:number;owner:Check['owner'];scene:number;summary:string;keywords:string[]}[]=[
 {id:'creative',label:'Dirección creativa',weight:15,owner:'Groovy',scene:1,summary:'Una identidad y una dirección visual que expresen lo que hace única a tu marca.',keywords:['Identidad visual','Branding','Diseño']},
 {id:'content',label:'Marketing de contenidos',weight:15,owner:'Groovy',scene:3,summary:'Ideas, reels y contenidos con un objetivo, un calendario y una voz propia.',keywords:['Reels','Feed social','IA generativa']},
 {id:'presence',label:'Presencia Online y Posicionamiento de marca',weight:15,owner:'Groovy',scene:2,summary:'Una marca reconocible, conectada y fácil de descubrir entre tus canales digitales.',keywords:['Redes sociales','Estrategia','Posicionamiento']},
 {id:'web',label:'Smart Website',weight:20,owner:'BotPager',scene:5,summary:'Tu marca en una web rápida, clara y preparada para convertir visitas en conversaciones.',keywords:['Web responsive','Formularios','Integraciones']},
 {id:'seo',label:'SEO Local',weight:10,owner:'BotPager',scene:2,summary:'Mejora cómo encuentran y evalúan tu negocio quienes buscan cerca de ti.',keywords:['Google Maps','Perfil de Empresa','Reseñas']},
 {id:'chatbot',label:'ChatBot con IA',weight:15,owner:'BotPager',scene:6,summary:'Una primera respuesta útil, con el contexto de tu negocio y respaldo de tu equipo.',keywords:['IA conversacional','WhatsApp','Atención 24/7']},
 {id:'crm',label:'CRM y Automatización',weight:10,owner:'BotPager',scene:7,summary:'Cada consulta con responsable, próximo paso y seguimiento en un solo lugar.',keywords:['CRM','Automatizaciones','Agenda']},
];
export const statusLabels:Record<EvidenceStatus,string>={observed:'Verificado',declared:'Declarado por ti',pending:'Por verificar',na:'No aplica'};
