import type { CrawlSnapshot } from "./crawler";
import type { VisibilityAuditInput, VisibilityAuditReport, VisibilityFinding } from "./types";

function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

export function scoreVisibilityAudit(input: VisibilityAuditInput, snapshot: CrawlSnapshot): VisibilityAuditReport {
  const pages = snapshot.pages;
  const home = snapshot.home;
  const combinedText = pages.map((page) => page.text.toLowerCase()).join(" ").slice(0, 500_000);
  const types = new Set(pages.flatMap((page) => page.schemaTypes).map((type) => type.toLowerCase()));
  const cityTerms = input.city.toLowerCase().split(/[,/|-]/).map((term) => term.trim()).filter((term) => term.length > 2);
  const serviceTerms = input.businessType.toLowerCase().split(/\s+|&/).filter((term) => term.length > 3 && !["services", "service", "other", "local"].includes(term));
  const hasCity = cityTerms.some((term) => combinedText.includes(term));
  const hasServiceClarity = serviceTerms.some((term) => combinedText.includes(term));
  const hasServicePages = pages.some((page) => /service|solution/.test(new URL(page.url).pathname.toLowerCase()));
  const hasAbout = pages.some((page) => /about|team|company/.test(new URL(page.url).pathname.toLowerCase()));
  const hasContact = pages.some((page) => /contact|quote|book/.test(new URL(page.url).pathname.toLowerCase()));
  const hasLocationPage = pages.some((page) => /location|service-area|areas-we-serve|city/.test(new URL(page.url).pathname.toLowerCase()));
  const hasPhone = pages.some((page) => page.hasPhone);
  const hasEmail = pages.some((page) => page.hasEmail);
  const hasAddress = pages.some((page) => page.hasAddress);
  const hasForm = pages.some((page) => page.hasForm);
  const hasWhatsApp = pages.some((page) => page.hasWhatsApp);
  const hasCalendar = pages.some((page) => page.hasCalendar);
  const hasChat = pages.some((page) => page.hasChat);
  const hasCta = pages.some((page) => page.hasCta);
  const hasReviews = pages.some((page) => page.hasReviews);
  const hasCredentials = pages.some((page) => page.hasCredentials);
  const hasFaq = pages.some((page) => page.hasFaq);
  const hasGoogleBusinessProfileLink = pages.some((page) => page.hasGoogleBusinessProfileLink);
  const hasLocalSchema = ["localbusiness", "organization", "professionalservice", "homeandconstructionbusiness"].some((type) => types.has(type));
  const hasServiceSchema = types.has("service") || types.has("product");
  const hasAnySchema = types.size > 0;
  const titlesGood = pages.filter((page) => page.title.length >= 18 && page.title.length <= 70).length / pages.length >= .65;
  const descriptionsGood = pages.filter((page) => page.description.length >= 70 && page.description.length <= 180).length / pages.length >= .5;
  const headingsGood = home.headingsOne.length === 1 && pages.filter((page) => page.headingsOne.length === 1).length / pages.length >= .6;
  const canonicalGood = Boolean(home.canonical);
  const secure = new URL(snapshot.finalUrl).protocol === "https:";
  const brokenPages = pages.filter((page) => page.status >= 400).length;

  let search = 0;
  search += secure ? 15 : 0;
  search += home.status === 200 ? 10 : 0;
  search += titlesGood ? 14 : 5;
  search += descriptionsGood ? 10 : 3;
  search += headingsGood ? 12 : 4;
  search += snapshot.sitemapFound ? 12 : 0;
  search += snapshot.googlebotAllowed ? 10 : 0;
  search += canonicalGood ? 9 : 0;
  search += hasServicePages ? 8 : 2;
  if (!home.hasMobileViewport) search -= 6;
  if (brokenPages) search -= Math.min(12, brokenPages * 4);
  if (home.noindex) search = Math.min(search, 10);

  let local = 0;
  local += hasCity ? 24 : 0;
  local += hasPhone ? 18 : 0;
  local += hasAddress ? 14 : 0;
  local += hasLocalSchema ? 17 : 0;
  local += hasLocationPage ? 12 : 0;
  local += hasServiceClarity ? 15 : 4;
  local += hasGoogleBusinessProfileLink ? 8 : 0;

  let reputation = 0;
  reputation += hasReviews ? 30 : 5;
  reputation += hasCredentials ? 20 : 0;
  reputation += hasAbout ? 16 : 0;
  reputation += hasContact && (hasPhone || hasEmail) ? 18 : 5;
  reputation += hasLocalSchema ? 16 : 0;

  let ai = 0;
  ai += snapshot.oaiSearchBotAllowed ? 18 : 0;
  ai += snapshot.googlebotAllowed ? 9 : 0;
  ai += snapshot.bingbotAllowed ? 8 : 0;
  ai += hasAnySchema ? 14 : 0;
  ai += hasLocalSchema ? 10 : 0;
  ai += hasServiceSchema ? 8 : 0;
  ai += hasServiceClarity ? 13 : 3;
  ai += hasCity ? 10 : 0;
  ai += hasFaq ? 10 : 0;

  let conversion = 0;
  conversion += hasPhone ? 18 : 0;
  conversion += hasForm ? 20 : 0;
  conversion += hasWhatsApp ? 8 : 0;
  conversion += hasCalendar ? 12 : 0;
  conversion += hasChat ? 14 : 0;
  conversion += hasCta ? 18 : 0;
  conversion += hasContact ? 10 : 0;

  search = clamp(search); local = clamp(local); reputation = clamp(reputation); ai = clamp(ai); conversion = clamp(conversion);
  let overallScore = Math.round(search * .25 + local * .20 + reputation * .15 + ai * .25 + conversion * .15);
  if (home.noindex) overallScore = Math.min(overallScore, 39);

  const findings: Array<VisibilityFinding & { rank: number }> = [];
  const add = (finding: VisibilityFinding, rank: number) => findings.push({ ...finding, rank });
  if (home.noindex) add({ id: "homepage-hidden", priority: "High Priority", title: "Your homepage may be hidden from search results.", impact: "Customers can have difficulty finding the business even when they search for its services.", evidence: "The homepage asks search engines not to include it in results.", recommendation: "Remove the search visibility block and confirm that the homepage can be indexed.", category: "search" }, 100);
  if (!hasServiceClarity || !hasServicePages) add({ id: "service-clarity", priority: "High Priority", title: "Search engines do not clearly understand your main services.", impact: "The website has fewer chances to appear when nearby customers search for the work you provide.", evidence: hasServicePages ? "Service-related wording is limited across the pages reviewed." : "No clear primary service page was found in the pages reviewed.", recommendation: "Create focused, useful pages for the services that generate the most valuable inquiries.", category: "search" }, 92);
  if (!hasCity) add({ id: "local-clarity", priority: "High Priority", title: "Your service area is not clear enough online.", impact: "Google and potential customers may not confidently connect the business with searches in your target market.", evidence: `The pages reviewed did not clearly mention ${input.city}.`, recommendation: "Clarify the real service area on core pages and connect it with the services offered.", category: "local" }, 90);
  if (!hasAnySchema || !hasLocalSchema) add({ id: "entity-clarity", priority: "High Priority", title: "AI systems receive weak structured information about your business.", impact: "AI-powered search can have more difficulty identifying what the business does, where it works and why it is relevant.", evidence: hasAnySchema ? "Structured information exists, but it does not clearly identify the business entity." : "No structured business information was found on the pages reviewed.", recommendation: "Add accurate structured business, service and location information to the website.", category: "ai" }, 88);
  if (!hasFaq) add({ id: "answer-coverage", priority: "Medium Priority", title: "Important customer questions are not answered clearly.", impact: "Customers and AI assistants have less useful information when comparing local providers.", evidence: "No clear FAQ or question-and-answer coverage was found in the pages reviewed.", recommendation: "Publish concise answers to real questions about services, process, service area and next steps.", category: "ai" }, 76);
  if (!snapshot.oaiSearchBotAllowed || !snapshot.googlebotAllowed || !snapshot.bingbotAllowed) add({ id: "crawler-access", priority: "High Priority", title: "Some search or AI systems may be blocked from reading the website.", impact: "Blocked systems cannot reliably understand or surface the business in discovery experiences.", evidence: `Crawler access found: Google ${snapshot.googlebotAllowed ? "allowed" : "blocked"}, Bing ${snapshot.bingbotAllowed ? "allowed" : "blocked"}, OAI Search ${snapshot.oaiSearchBotAllowed ? "allowed" : "blocked"}.`, recommendation: "Review crawler rules and allow legitimate search systems to access public business pages.", category: "ai" }, 95);
  if (!hasReviews) add({ id: "trust-signals", priority: "Medium Priority", title: "The website shows limited customer trust signals.", impact: "Prospects may hesitate when they cannot quickly verify other customers' experiences.", evidence: "Clear review or testimonial signals were not found in the pages reviewed.", recommendation: "Feature authentic customer feedback and connect it with relevant services and outcomes.", category: "reputation" }, 72);
  if (!hasCredentials) add({ id: "authority-signals", priority: "Opportunity", title: "Your experience and credentials could be easier to verify.", impact: "Clear authority signals help customers and discovery systems understand why the business is trustworthy.", evidence: "Limited team, credential, license, certification or experience information was found.", recommendation: "Add accurate experience, team and credential information where it helps customers decide.", category: "reputation" }, 58);
  if (!hasCta || (!hasForm && !hasPhone)) add({ id: "conversion-path", priority: "High Priority", title: "Visitors do not have a strong next step.", impact: "Search visibility is less valuable when interested visitors cannot quickly call, request a quote or book.", evidence: "The pages reviewed provide limited direct response or lead-capture options.", recommendation: "Add a clear primary action and make calls or quote requests easy on every important service page.", category: "conversion" }, 86);
  if (!hasChat && !hasCalendar) add({ id: "fast-response", priority: "Opportunity", title: "The website could respond to new interest faster.", impact: "Local prospects often contact multiple providers, so an immediate response can preserve more opportunities.", evidence: "No clear chat, AI agent or online scheduling path was found.", recommendation: "Add a useful instant-response or scheduling path that connects with lead follow-up.", category: "conversion" }, 55);
  if (!snapshot.sitemapFound) add({ id: "discovery-map", priority: "Medium Priority", title: "Search engines may not have a clear map of your website.", impact: "Important service pages can take longer to discover or may receive less consistent attention.", evidence: "A working public sitemap was not found at the standard website location.", recommendation: "Publish and maintain a sitemap that includes the pages customers need to find.", category: "search" }, 68);
  if (!titlesGood || !headingsGood) add({ id: "page-focus", priority: "Medium Priority", title: "Some pages do not communicate their purpose quickly.", impact: "Unclear page focus makes it harder for both people and search engines to match the page with a customer need.", evidence: "Several reviewed pages have weak or inconsistent page titles and main headings.", recommendation: "Give each important page one clear topic aligned with a service or customer question.", category: "search" }, 70);
  if (brokenPages) add({ id: "unavailable-pages", priority: "Medium Priority", title: "Some website paths lead to unavailable pages.", impact: "Dead ends create a poor customer experience and make the website harder for search systems to navigate.", evidence: `${brokenPages} reviewed internal page${brokenPages === 1 ? " returned" : "s returned"} an error response.`, recommendation: "Repair or redirect unavailable internal pages so important journeys remain complete.", category: "search" }, 74);

  const strengths: string[] = [];
  if (secure && home.status === 200) strengths.push("Your website is secure and accessible.");
  if (hasPhone && hasContact) strengths.push("Customers can easily find your contact information.");
  if (hasReviews) strengths.push("Your website communicates useful customer trust signals.");
  if (hasCity && hasServiceClarity) strengths.push("Your services and local market are communicated clearly.");
  if (hasAnySchema && hasLocalSchema) strengths.push("Your site gives search systems structured business information.");
  if (hasCta && (hasForm || hasPhone)) strengths.push("Visitors have a clear path to contact the business.");
  if (strengths.length < 3 && titlesGood) strengths.push("Important pages use descriptive search titles.");
  if (strengths.length < 3 && snapshot.googlebotAllowed) strengths.push("Google can access the public website content.");

  const issues = findings.sort((a, b) => b.rank - a.rank).slice(0, 5).map(({ rank: _rank, ...finding }) => finding);
  const recommendationMap: Record<string, string> = {
    search: "Improve your website structure and service pages for Google",
    local: "Strengthen local search and service-area visibility",
    reputation: "Build stronger reputation and authority signals",
    ai: "Improve how AI systems understand your business",
    conversion: "Add better conversion tools and AI lead capture",
  };
  const recommendations = [...new Set(issues.map((issue) => recommendationMap[issue.category]))];
  if (!hasAnySchema) recommendations.push("Add structured business information");
  if (!hasServicePages) recommendations.push("Create pages targeting your most valuable services");

  const rating: VisibilityAuditReport["rating"] = overallScore < 40 ? "Poor" : overallScore < 60 ? "Needs Improvement" : overallScore < 80 ? "Good" : "Strong";
  const schemaLabels = [...types].slice(0, 4).map((type) => type.replace(/([a-z])([A-Z])/g, "$1 $2")).join(", ");
  const previewImage = snapshot.pageSpeed?.screenshotDataUrl || (home.ogImage.startsWith("https://") ? home.ogImage : "");
  return {
    websiteUrl: snapshot.finalUrl,
    businessType: input.businessType,
    city: input.city,
    overallScore,
    rating,
    scannedPages: pages.length,
    generatedAt: new Date().toISOString(),
    scores: [
      { key: "search", label: "Search Visibility", score: search, summary: search >= 70 ? "Your search foundation is in good shape." : "Your search foundation has clear room to improve." },
      { key: "local", label: "Local Visibility", score: local, summary: local >= 70 ? "Your local market signals are clear." : "Your local relevance needs stronger signals." },
      { key: "reputation", label: "Online Reputation", score: reputation, summary: reputation >= 70 ? "Your site communicates meaningful trust." : "Your online authority could be clearer." },
      { key: "ai", label: "AI Readiness", score: ai, summary: ai >= 70 ? "AI systems can interpret useful business signals." : "AI systems need clearer business information." },
      { key: "conversion", label: "Conversion Readiness", score: conversion, summary: conversion >= 70 ? "Visitors have useful ways to take action." : "The next step for visitors could be stronger." },
    ],
    strengths: strengths.slice(0, 3),
    issues,
    recommendations: [...new Set(recommendations)].slice(0, 7),
    checks: [
      { label: "Secure website", status: secure ? "Found" : "Needs attention", detail: secure ? "The site loads over HTTPS." : "The site does not consistently use a secure connection." },
      { label: "Google Business Profile", status: hasGoogleBusinessProfileLink ? "Found" : "Not found", detail: hasGoogleBusinessProfileLink ? "A direct Google Maps or Business Profile link appears on the website." : "No direct profile link was found on the pages reviewed; this does not confirm that a profile does not exist." },
      { label: "Customer reviews", status: hasReviews ? "Found" : "Not found", detail: hasReviews ? "Review or testimonial signals appear on the website." : "Clear review or testimonial signals were not found on the website." },
      { label: "Structured business data", status: hasLocalSchema ? "Found" : hasAnySchema ? "Needs attention" : "Not found", detail: hasLocalSchema ? `Business schema detected${schemaLabels ? `: ${schemaLabels}` : ""}.` : hasAnySchema ? "Some structured data exists, but business identity could be clearer." : "No structured data was detected on the pages reviewed." },
      { label: "Google crawler access", status: snapshot.googlebotAllowed ? "Allowed" : "Blocked", detail: snapshot.googlebotAllowed ? "Public crawler rules allow Googlebot." : "Crawler rules appear to block Googlebot." },
      { label: "AI search crawler access", status: snapshot.oaiSearchBotAllowed ? "Allowed" : "Blocked", detail: snapshot.oaiSearchBotAllowed ? "Public crawler rules allow OAI-SearchBot." : "Crawler rules appear to block OAI-SearchBot." },
      { label: "XML sitemap", status: snapshot.sitemapFound ? "Found" : "Not found", detail: snapshot.sitemapFound ? "A working sitemap was found at the standard location." : "A working sitemap was not found at the standard location." },
      { label: "Local area clarity", status: hasCity ? "Found" : "Needs attention", detail: hasCity ? `${input.city} appears in the reviewed website content.` : `${input.city} was not clearly mentioned in the reviewed content.` },
      { label: "Contact path", status: hasCta && (hasPhone || hasForm) ? "Found" : "Needs attention", detail: hasCta && (hasPhone || hasForm) ? "Visitors have a visible way to contact or request service." : "The customer next step could be clearer." },
      { label: "Mobile performance", status: snapshot.pageSpeed?.performanceScore === undefined ? "Not measured" : snapshot.pageSpeed.performanceScore >= 70 ? "Found" : "Needs attention", detail: snapshot.pageSpeed?.performanceScore === undefined ? "Add a PageSpeed API key to include this live measurement." : `Google mobile performance score: ${snapshot.pageSpeed.performanceScore}/100.` },
    ],
    sitePreview: {
      imageUrl: previewImage,
      imageKind: snapshot.pageSpeed?.screenshotDataUrl ? "Mobile screenshot" : previewImage ? "Website preview" : "No preview available",
      pageTitle: home.title || new URL(snapshot.finalUrl).hostname,
      mainHeading: home.headingsOne[0] || "No clear main heading found",
      performanceScore: snapshot.pageSpeed?.performanceScore,
    },
    scannedUrls: pages.map((page) => page.url),
  };
}
