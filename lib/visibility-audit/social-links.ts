export type SocialNetwork = 'instagram'|'tiktok'|'facebook'|'linkedin'|'youtube'|'x'|'whatsapp';
export type SocialLinks = Partial<Record<SocialNetwork,string>>;
const hosts:Record<string,SocialNetwork>={ 'instagram.com':'instagram','tiktok.com':'tiktok','facebook.com':'facebook','fb.com':'facebook','linkedin.com':'linkedin','youtube.com':'youtube','youtu.be':'youtube','twitter.com':'x','x.com':'x','wa.me':'whatsapp','api.whatsapp.com':'whatsapp','whatsapp.com':'whatsapp'};
/** Accept profile/contact links only, not sharing controls or embedded posts. */
export function socialLink(value:string):{network:SocialNetwork;url:string}|null{
 try{
  const decoded=value.replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/&amp;/g,'&').replace(/\\u0026/g,'&');
  const url=new URL(decoded.startsWith('//')?`https:${decoded}`:decoded);
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return null;
  const host=url.hostname.toLowerCase().replace(/^(www|m|mobile|web)\./,'');
  const network=hosts[host];if(!network)return null;
  const path=url.pathname.split('/').filter(Boolean);const first=(path[0]||'').toLowerCase();
  if(!first||/^(share|sharer|sharer.php|intent|dialog|login|accounts|plugins|embed|watch|reel|reels|p|stories|explore|hashtag|tag|search|home|shorts|status|i)$/.test(first))return null;
  if(network==='tiktok'&&(!first.startsWith('@')||path.length>1))return null;
  if(network==='instagram'&&path.length!==1)return null;
  if(network==='linkedin'&&(!['company','in','school','showcase'].includes(first)||path.length<2))return null;
  if(network==='youtube'&&!(first.startsWith('@')||['channel','c','user'].includes(first)))return null;
  if(network==='x'&&path.length!==1)return null;
  if(network!=='whatsapp'&&!(network==='facebook'&&first==='profile.php'))url.search='';
  url.hash='';return {network,url:url.href};
 }catch{return null;}
}
