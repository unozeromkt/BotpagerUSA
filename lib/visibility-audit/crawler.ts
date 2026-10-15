import "server-only";

import { fetchPublicPage as safeFetch } from "./public-page";
import { load } from "cheerio";
import {socialLink,type SocialLinks} from "./social-links";
import type { VisibilityAuditInput } from "./types";

const MAX_PAGES = 20;
const MAX_HTML_BYTES = 1_500_000;
const USER_AGENT = "BotPagerVisibilityAudit/1.0 (+https://botpager.com/visibility-audit)";

export type PageSignals = {
  url: string;
  status: number;
  title: string;
  description: string;
  headingsOne: string[];
  headingsTwo: string[];
  text: string;
  canonical: string;
  noindex: boolean;
  schemaTypes: string[];
  internalLinks: string[];
  hasPhone: boolean;
  hasEmail: boolean;
  hasAddress: boolean;
  hasForm: boolean;
  hasWhatsApp: boolean;
  hasCalendar: boolean;
  hasChat: boolean;
  hasCta: boolean;
  hasReviews: boolean;
  hasCredentials: boolean;
  hasFaq: boolean;
  hasMobileViewport: boolean;
  hasGoogleBusinessProfileLink: boolean;
  ogImage: string;
  socialLinks: SocialLinks;
  instagram: string;
  tiktok: string;
};

export type CrawlSnapshot = {
  finalUrl: string;
  home: PageSignals;
  pages: PageSignals[];
  robotsFound: boolean;
  sitemapFound: boolean;
  googlebotAllowed: boolean;
  robotsReliable: boolean;
  bingbotAllowed: boolean;
  oaiSearchBotAllowed: boolean;
  pageSpeed: { screenshotDataUrl: string; performanceScore?: number } | null;
};

function resolvedWebUrl(value: string | undefined, base: URL) {
  if (!value) return "";
  try {
    const resolved = new URL(value, base);
    return /^https?:$/.test(resolved.protocol) ? resolved.toString() : "";
  } catch { return ""; }
}

async function getPageSpeedSnapshot(url: string) {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return null;
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("category", "performance");
  endpoint.searchParams.set("key", key);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
    if (!response.ok) return null;
    const payload = await response.json() as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: { "final-screenshot"?: { details?: { data?: string } } };
      };
    };
    const screenshotDataUrl = payload.lighthouseResult?.audits?.["final-screenshot"]?.details?.data ?? "";
    const rawScore = payload.lighthouseResult?.categories?.performance?.score;
    return screenshotDataUrl.startsWith("data:image/")
      ? { screenshotDataUrl, performanceScore: typeof rawScore === "number" ? Math.round(rawScore * 100) : undefined }
      : null;
  } catch { return null; }
  finally { clearTimeout(timeout); }
}

function collectSchemaTypes(value: unknown, types: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaTypes(item, types));
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  const schemaType = record["@type"];
  if (typeof schemaType === "string") types.add(schemaType);
  if (Array.isArray(schemaType)) schemaType.forEach((item) => typeof item === "string" && types.add(item));
  Object.values(record).forEach((item) => collectSchemaTypes(item, types));
}

export function parsePage(url: URL, status: number, html: string): PageSignals {
  const $ = load(html);
  const schemaTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, element) => {
    try { collectSchemaTypes(JSON.parse($(element).text()), schemaTypes); } catch { /* Ignore malformed public markup. */ }
  });
  // Read header/footer anchors and structured data before discarding scripts/SVG.
  const socialLinks:SocialLinks={};
  const remember=(value:string)=>{const found=socialLink(value);if(found&&!socialLinks[found.network])socialLinks[found.network]=found.url;};
  $('header a[href], footer a[href], nav a[href], a[href]').each((_,el)=>remember($(el).attr('href')||''));
  const structured=(value:unknown):void=>{if(Array.isArray(value)){value.forEach(structured);return;}if(value&&typeof value==='object'){for(const [key,item] of Object.entries(value)){if(key==='sameAs'){for(const link of Array.isArray(item)?item:[item])if(typeof link==='string')remember(link);}else structured(item);}}};
  $('script[type="application/ld+json"]').each((_,el)=>{try{structured(JSON.parse($(el).text()));}catch{/* Invalid metadata is not evidence. */}});
  // Framework hydration data often contains footer links that are not rendered in HTML.
  $('script:not([src]), template, noscript').each((_,el)=>{const content=$(el).html()?.replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/')||'';for(const match of content.matchAll(/https?:\/\/[^\s"'<>\\]+/g))remember(match[0]);});
  $("script, style, noscript, template, svg").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 180_000);
  const lowerText = text.toLowerCase();
  const internalLinks = new Set<string>();
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const linked = new URL(href, url);
      linked.hash = "";
      if (linked.origin === url.origin && /^https?:$/.test(linked.protocol)) internalLinks.add(linked.toString());
    } catch { /* Ignore malformed links. */ }
  });
  const metaRobots = $('meta[name="robots"], meta[name="googlebot"]').map((_, element) => $(element).attr("content") ?? "").get().join(" ").toLowerCase();
  const hrefValues = $("a[href]").map((_, element) => $(element).attr("href") ?? "").get().join(" ").toLowerCase();
  const htmlLower = html.toLowerCase();

  const hasGoogleBusinessProfileLink = $("a[href]").toArray().some((element) => {
    const href = $(element).attr("href") ?? "";
    return /(?:google\.[a-z.]+\/maps|maps\.app\.goo\.gl|g\.page\/|google\.[a-z.]+\/search\?.*query_place_id)/i.test(href);
  });
  return {
    url: url.toString(),
    status,
    title: $("title").first().text().trim(),
    description: $('meta[name="description"]').attr("content")?.trim() ?? "",
    headingsOne: $("h1").map((_, element) => $(element).text().replace(/\s+/g, " ").trim()).get().filter(Boolean),
    headingsTwo: $("h2").map((_, element) => $(element).text().replace(/\s+/g, " ").trim()).get().filter(Boolean),
    text,
    canonical: $('link[rel="canonical"]').attr("href")?.trim() ?? "",
    noindex: /(?:^|[,\s])noindex(?:$|[,\s])/.test(metaRobots),
    schemaTypes: [...schemaTypes],
    internalLinks: [...internalLinks],
    hasPhone: /tel:/i.test(hrefValues) || /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/.test(text),
    hasEmail: /mailto:/i.test(hrefValues) || /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text),
    hasAddress: /\b\d{1,6}\s+[a-z0-9.' -]+\s(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|pkwy|parkway)\b/i.test(text),
    hasForm: $("form").length > 0,
    hasWhatsApp: /wa\.me|whatsapp/.test(hrefValues + htmlLower),
    hasCalendar: /calendly|calendar|schedule (?:a |your )?(?:call|appointment)|book (?:a |your )?(?:call|appointment)/.test(lowerText + hrefValues),
    hasChat: /intercom|leadconnector|chat widget|livechat|chatbot|ai agent/.test(htmlLower),
    hasCta: /cotiz|reserva|agend|contáct|contacta|escríbe|comprar|lláma|conoce más|get (?:a )?(?:quote|estimate|started)|request (?:a )?(?:quote|estimate)|book now|schedule|call now|contact us/.test(lowerText),
    hasReviews: /testimonials?|customer reviews?|google reviews?|\b[4-5]\.[0-9]\s*(?:\/\s*5|stars?)/.test(lowerText),
    hasCredentials: /licensed|insured|certified|accredited|years? of experience|our team|meet the team|award/.test(lowerText),
    hasFaq: $("[itemtype*='FAQPage']").length > 0 || schemaTypes.has("FAQPage") || /frequently asked questions|\bfaq\b/.test(lowerText),
    hasMobileViewport: /width\s*=\s*device-width/i.test($('meta[name="viewport"]').attr("content") ?? ""),
    hasGoogleBusinessProfileLink,
    socialLinks, instagram: socialLinks.instagram||"", tiktok: socialLinks.tiktok||"",
    ogImage: resolvedWebUrl($('meta[property="og:image"], meta[name="twitter:image"]').first().attr("content"), url),
  };
}

export function agentAllowed(robotsText: string, agent: string) {
 const groups:{agents:string[];rules:{allow:boolean;path:string}[]}[]=[];let current={agents:[] as string[],rules:[] as {allow:boolean;path:string}[]};
 for(const line of robotsText.split(/\r?\n/)){const match=line.replace(/#.*/,'').trim().match(/^([^:]+):\s*(.*)$/);if(!match)continue;const field=match[1].trim().toLowerCase(),value=match[2].trim();if(field==='user-agent'){if(current.rules.length){groups.push(current);current={agents:[],rules:[]};}current.agents.push(value.toLowerCase());}else if(['allow','disallow'].includes(field)&&current.agents.length){current.rules.push({allow:field==='allow',path:value});}}
 groups.push(current);const specificity=(g:typeof current)=>Math.max(-1,...g.agents.map(a=>a==='*'?0:agent.toLowerCase().includes(a)?a.length:-1));const best=Math.max(-1,...groups.map(specificity));if(best<0)return true;
 const rules=groups.filter(g=>specificity(g)===best).flatMap(g=>g.rules).filter(r=>r.path==='/'||r.path==='/*');return !rules.some(r=>!r.allow)||rules.some(r=>r.allow);
}

function pagePriority(url: string) {
  const path = new URL(url).pathname.toLowerCase();
  if (path === "/" || path === "") return 100;
  if (/service|solution|servicio|solucion/.test(path)) return 90;
  if (/about|company|team|nosotros|equipo/.test(path)) return 80;
  if (/contact|quote|book|cotiza|reserva/.test(path)) return 75;
  if (/location|area|city/.test(path)) return 70;
  if (/faq|resource|blog|article/.test(path)) return 60;
  return 20 - path.split("/").length;
}

export async function crawlWebsite(input: VisibilityAuditInput, options:{maxPages?:number}={}): Promise<CrawlSnapshot> {
  const maxPages=Math.max(1,Math.min(MAX_PAGES,options.maxPages??MAX_PAGES));
  const startUrl = new URL(input.websiteUrl);
  const homeFetch = await safeFetch(startUrl, 12_000);
  const contentType = homeFetch.response.headers.get("content-type") ?? "";
  if (!homeFetch.response.ok || !contentType.includes("text/html")) {
    throw new Error("We could not open the website homepage. Check the URL and try again.");
  }
  const home = parsePage(homeFetch.finalUrl, homeFetch.response.status, homeFetch.text);
  home.noindex ||= /\bnoindex\b/i.test(homeFetch.response.headers.get("x-robots-tag")||"");
  const origin = homeFetch.finalUrl.origin;
  const pageSpeedPromise = getPageSpeedSnapshot(homeFetch.finalUrl.toString());

  const [robotsResult, sitemapResult] = await Promise.allSettled([
    safeFetch(new URL("/robots.txt", origin), 5_000),
    safeFetch(new URL("/sitemap.xml", origin), 5_000),
  ]);
  const robots = robotsResult.status === "fulfilled" ? robotsResult.value : null;
  const sitemap = sitemapResult.status === "fulfilled" ? sitemapResult.value : null;
  const robotsText = robots?.response.ok ? robots.text : "";

  const candidates = home.internalLinks
    .filter((url) => {
      const path = new URL(url).pathname.toLowerCase();
      return !/\.(?:jpg|jpeg|png|gif|webp|svg|pdf|zip|xml|json)$/i.test(path) && !/privacy|terms|login|cart|checkout/.test(path);
    })
    .sort((left, right) => pagePriority(right) - pagePriority(left))
    .slice(0, maxPages - 1);

  const pages: PageSignals[] = [home];
  for (let index = 0; index < candidates.length; index += 4) {
    const batch = candidates.slice(index, index + 4);
    const results = await Promise.allSettled(batch.map(async (url) => {
      const fetched = await safeFetch(new URL(url), 6_000);
      const type = fetched.response.headers.get("content-type") ?? "";
      if (!type.includes("text/html")) return null;
      return parsePage(fetched.finalUrl, fetched.response.status, fetched.text);
    }));
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) pages.push(result.value);
    });
  }

  return {
    finalUrl: homeFetch.finalUrl.toString(),
    home,
    pages: pages.slice(0, MAX_PAGES),
    robotsFound: Boolean(robots?.response.ok),
    sitemapFound: Boolean(sitemap?.response.ok && /<(?:urlset|sitemapindex)[\s>]/i.test(sitemap.text)),
    robotsReliable: Boolean(robots&&(robots.response.ok||robots.response.status===404)),
    googlebotAllowed: agentAllowed(robotsText, "googlebot"),
    bingbotAllowed: agentAllowed(robotsText, "bingbot"),
    oaiSearchBotAllowed: agentAllowed(robotsText, "oai-searchbot"),
    pageSpeed: await pageSpeedPromise,
  };
}

/** Lightweight discovery, before the full four-page diagnostic. */
export async function discoverWebsiteLinks(website:string):Promise<SocialLinks>{
 const result=await safeFetch(new URL(website),7000);
 if(!result.response.ok||!result.response.headers.get('content-type')?.includes('text/html'))return {};
 return parsePage(result.finalUrl,result.response.status,result.text).socialLinks;
}
