import "server-only";

import dns from "node:dns/promises";
import net from "node:net";
import { load } from "cheerio";
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
};

export type CrawlSnapshot = {
  finalUrl: string;
  home: PageSignals;
  pages: PageSignals[];
  robotsFound: boolean;
  sitemapFound: boolean;
  googlebotAllowed: boolean;
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

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
}

async function assertPublicUrl(url: URL) {
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only public HTTP websites can be audited.");
  if (!["", "80", "443"].includes(url.port)) throw new Error("Only standard website ports can be audited.");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Enter a public business website.");
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Enter a public business website.");
    return;
  }
  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error("The website does not resolve to a public address.");
  }
}

async function readLimitedText(response: Response) {
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_HTML_BYTES) throw new Error("The website page is too large to audit safely.");
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new Error("The website page is too large to audit safely.");
    }
    chunks.push(value);
  }
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(combined);
}

async function safeFetch(input: URL, timeoutMs = 8_000) {
  let current = new URL(input);
  for (let redirect = 0; redirect < 5; redirect += 1) {
    await assertPublicUrl(current);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(current, {
        redirect: "manual",
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5" },
        cache: "no-store",
        signal: controller.signal,
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("The website returned an invalid redirect.");
        current = new URL(location, current);
        continue;
      }
      return { response, finalUrl: current, text: await readLimitedText(response) };
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error("The website redirected too many times.");
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

function parsePage(url: URL, status: number, html: string): PageSignals {
  const $ = load(html);
  const schemaTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, element) => {
    try { collectSchemaTypes(JSON.parse($(element).text()), schemaTypes); } catch { /* Ignore malformed public markup. */ }
  });
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
    hasForm: $("form").length > 0 || /request (?:a )?(?:quote|estimate)|contact us|send message/.test(lowerText),
    hasWhatsApp: /wa\.me|whatsapp/.test(hrefValues + htmlLower),
    hasCalendar: /calendly|calendar|schedule (?:a |your )?(?:call|appointment)|book (?:a |your )?(?:call|appointment)/.test(lowerText + hrefValues),
    hasChat: /intercom|leadconnector|chat widget|livechat|chatbot|ai agent/.test(htmlLower),
    hasCta: /get (?:a )?(?:quote|estimate|started)|request (?:a )?(?:quote|estimate)|book now|schedule|call now|contact us/.test(lowerText),
    hasReviews: /testimonials?|customer reviews?|google reviews?|\b[4-5]\.[0-9]\s*(?:\/\s*5|stars?)/.test(lowerText),
    hasCredentials: /licensed|insured|certified|accredited|years? of experience|our team|meet the team|award/.test(lowerText),
    hasFaq: $("[itemtype*='FAQPage']").length > 0 || schemaTypes.has("FAQPage") || /frequently asked questions|\bfaq\b/.test(lowerText),
    hasMobileViewport: /width\s*=\s*device-width/i.test($('meta[name="viewport"]').attr("content") ?? ""),
    hasGoogleBusinessProfileLink,
    ogImage: resolvedWebUrl($('meta[property="og:image"], meta[name="twitter:image"]').first().attr("content"), url),
  };
}

function agentAllowed(robotsText: string, agent: string) {
  if (!robotsText.trim()) return true;
  const groups = robotsText.split(/(?=^\s*user-agent\s*:)/gim);
  const relevant = groups.filter((group) => {
    const agents = [...group.matchAll(/^\s*user-agent\s*:\s*([^#\r\n]+)/gim)].map((match) => match[1].trim().toLowerCase());
    return agents.includes(agent.toLowerCase()) || agents.includes("*");
  });
  return !relevant.some((group) => [...group.matchAll(/^\s*disallow\s*:\s*([^#\r\n]*)/gim)].some((match) => match[1].trim() === "/"));
}

function pagePriority(url: string) {
  const path = new URL(url).pathname.toLowerCase();
  if (path === "/" || path === "") return 100;
  if (/service|solution/.test(path)) return 90;
  if (/about|company|team/.test(path)) return 80;
  if (/contact|quote|book/.test(path)) return 75;
  if (/location|area|city/.test(path)) return 70;
  if (/faq|resource|blog|article/.test(path)) return 60;
  return 20 - path.split("/").length;
}

export async function crawlWebsite(input: VisibilityAuditInput): Promise<CrawlSnapshot> {
  const startUrl = new URL(input.websiteUrl);
  const homeFetch = await safeFetch(startUrl, 12_000);
  const contentType = homeFetch.response.headers.get("content-type") ?? "";
  if (!homeFetch.response.ok || !contentType.includes("text/html")) {
    throw new Error("We could not open the website homepage. Check the URL and try again.");
  }
  const home = parsePage(homeFetch.finalUrl, homeFetch.response.status, homeFetch.text);
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
    .slice(0, MAX_PAGES - 1);

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
    googlebotAllowed: agentAllowed(robotsText, "googlebot"),
    bingbotAllowed: agentAllowed(robotsText, "bingbot"),
    oaiSearchBotAllowed: agentAllowed(robotsText, "oai-searchbot"),
    pageSpeed: await pageSpeedPromise,
  };
}
