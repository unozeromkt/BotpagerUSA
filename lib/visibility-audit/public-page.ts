import 'server-only';
import dns from 'node:dns/promises';
import net from 'node:net';
import http from 'node:http';
import https from 'node:https';

export function isPublicAddress(address:string){
 if(net.isIPv4(address)){const [a,b]=address.split('.').map(Number);return !(a===0||a===10||a===127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19)||a>=224);}
 // Only globally routed IPv6; also excludes IPv4-mapped addresses.
 return net.isIPv6(address)&&/^[23][0-9a-f]{3}:/i.test(address);
}
export async function fetchPublicPage(input:URL,timeoutMs=8000){
 const deadline=Date.now()+timeoutMs;
 let current=new URL(input);
 for(let redirect=0;redirect<5;redirect++){
  if(!['http:','https:'].includes(current.protocol)||current.username||current.password||!['','80','443'].includes(current.port))throw Error('Only public standard HTTP websites can be audited.');
  const hostname=current.hostname.replace(/^\[|\]$/g,'').toLowerCase().replace(/\.$/,'');
  if(hostname==='localhost'||/\.(local|internal|localhost)$/.test(hostname))throw Error('Enter a public business website.');
  const remaining=deadline-Date.now();if(remaining<=0)throw Error('Website timeout.');
  let timer:ReturnType<typeof setTimeout>|undefined;
  const addresses=await Promise.race([dns.lookup(hostname,{all:true}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('DNS timeout.')),remaining);})]).finally(()=>clearTimeout(timer));
  if(!addresses.length||addresses.some(a=>!isPublicAddress(a.address)))throw Error('Enter a public business website.');
  const address=addresses[0];
  const result=await new Promise<{status:number;headers:Headers;text:string}>((resolve,reject)=>{
   const headers=new Headers();let bytes=0;const chunks:Buffer[]=[];
   // Connect to the checked address, keeping the original Host and TLS identity.
   const request=(current.protocol==='https:'?https:http).request({protocol:current.protocol,hostname:address.address,family:address.family,port:current.port||undefined,servername:hostname,path:current.pathname+current.search,method:'GET',headers:{Host:current.host,'User-Agent':'BotPagerDiagnostic/1.0','Accept':'text/html,application/xhtml+xml,text/plain,application/xml;q=0.9'}},response=>{
    Object.entries(response.headers).forEach(([key,value])=>{if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);});
    if(Number(headers.get('content-length'))>1500000){response.destroy();request.destroy(Error('Website page too large.'));return;}
    response.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>1500000){request.destroy(Error('Website page too large.'));return;}chunks.push(chunk);});
    response.on('error',reject);response.on('end',()=>resolve({status:response.statusCode||502,headers,text:Buffer.concat(chunks).toString('utf8')}));
   });
   const limit=setTimeout(()=>request.destroy(Error('Website timeout.')),Math.max(1,deadline-Date.now()));
   request.on('error',reject);request.on('close',()=>clearTimeout(limit));request.end();
  });
  if([301,302,303,307,308].includes(result.status)){const location=result.headers.get('location');if(!location)throw Error('Invalid website redirect.');current=new URL(location,current);continue;}
  return {response:{ok:result.status>=200&&result.status<300,status:result.status,headers:result.headers},finalUrl:current,text:result.text};
 }
 throw Error('Too many website redirects.');
}
