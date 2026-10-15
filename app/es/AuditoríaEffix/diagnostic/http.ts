import 'server-only';
export class DiagnosticError extends Error{constructor(message:string,public status=400){super(message);}}
const budget={hour:0,count:0,active:0};
export async function readRequest(request:Request):Promise<Record<string,unknown>>{
 const origin=request.headers.get('origin');if(origin&&new URL(origin).host!==(request.headers.get('host')||new URL(request.url).host)||request.headers.get('sec-fetch-site')==='cross-site')throw new DiagnosticError('Abre el diagnóstico desde esta experiencia.',403);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new DiagnosticError('Formato no compatible.',415);
 const reader=request.body?.getReader();if(!reader)throw new DiagnosticError('Faltan los datos.');const chunks:Uint8Array[]=[];let bytes=0;
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>16000){await reader.cancel();throw new DiagnosticError('La solicitud es demasiado grande.',413);}chunks.push(value);}
 try{const value=JSON.parse(Buffer.concat(chunks).toString());if(!value||Array.isArray(value)||typeof value!=='object')throw Error();return value;}catch{throw new DiagnosticError('No pudimos leer los datos.');}
}
export async function limited<T>(action:()=>Promise<T>){const hour=Math.floor(Date.now()/3600000);if(budget.hour!==hour){budget.hour=hour;budget.count=0;}if(budget.active>=4||budget.count>=120)throw new DiagnosticError('Estamos atendiendo otros diagnósticos. Inténtalo en unos minutos.',429);budget.count++;budget.active++;try{return await action();}finally{budget.active--;}}
export function clean(value:unknown,max=200){return typeof value==='string'?value.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):'';}
export function publicLink(value:unknown){try{const url=new URL(clean(value,1000));if(!['https:','http:'].includes(url.protocol)||url.username||url.password)return '';return url.toString();}catch{return '';}}
export function jsonError(error:unknown){return Response.json({message:error instanceof DiagnosticError?error.message:'No pudimos completar la consulta. Puedes continuar con tus datos.'},{status:error instanceof DiagnosticError?error.status:502,headers:{'Cache-Control':'no-store'}});}
