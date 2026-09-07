# BotPager SEO Audit

Audit date: September 7, 2026

Scope: repository state before Phase 2 architecture changes
Primary market: local service businesses in the United States

## Executive summary

BotPager already has a solid App Router foundation: the main commercial pages are server-prerendered, the homepage has Organization, WebSite, Service, and visible FAQ structured data, the site has generated `robots.txt` and `sitemap.xml`, and most images use `next/image` with dimensions or responsive sizing.

The largest SEO gap is information architecture. Almost every commercial topic currently resolves to either the homepage or an anchor on `/services`, so search engines do not have a dedicated canonical page for each service or industry intent. The global metadata also declares `/` as a canonical at the root layout, which creates an inheritance risk for routes that do not override it. Several utility pages are noindex but still crawlable, the audit conversion URL does not match the proposed public URL, and the legal pages render two visible H1 elements each.

The recommended sequence is to establish a safe, centralized route architecture first, then optimize the homepage, service pages, and selected industry pages in their dedicated phases. New detail routes should not be added to the sitemap or made indexable until they contain substantial, unique, intent-specific content.

## Technical baseline

- Framework: Next.js 16.3.0 with React and the App Router.
- Rendering: the public marketing routes are statically prerendered. `/[demoSlug]` is dynamically rendered and returns a 404 for unknown demo slugs.
- Styling: global CSS in `app/globals.css`; the main marketing experience is a large client component in `components/landing-page.tsx`.
- Route model: file-system routing under `app/`, with one root dynamic demo route.
- Baseline build: `npm run build` passes and generates 15 routes.
- Baseline lint: `npm run lint` fails because Next.js 16 no longer supports the `next lint` command. This is a tooling/configuration issue, not a lint finding in application code.

## Current route and indexation inventory

| URL | Purpose | Current indexation | Canonical | Sitemap | Finding |
| --- | --- | --- | --- | --- | --- |
| `/` | Main marketing homepage | index/follow | `/` | yes | Main commercial page; structured data present. |
| `/services` | Combined services hub | index/follow | `/services` | yes | Four services exist only as same-page anchors. |
| `/growth-game` | Interactive lead magnet | index/follow | `/growth-game` | yes | Useful experience, but commercial priority is high relative to core service pages. |
| `/audit` | Free audit flow | noindex/nofollow | inherited-risk | no | Primary conversion flow; proposed public URL is `/free-growth-audit/`. |
| `/conversion` | Legacy redirect | 308 permanent redirect to `/` | n/a | no | Existing URL is preserved correctly. |
| `/privacy` | Legal policy | index/follow | `/privacy` | yes | Two visible H1 elements. |
| `/terms` | Legal terms | index/follow | `/terms` | yes | Two visible H1 elements. |
| `/demos` | Private demo directory | noindex/nofollow | inherited-risk | no | Crawl is not blocked in `robots.txt`. |
| `/[demoSlug]` | Private client demo | noindex/nofollow when valid; 404 when unknown | inherited-risk | no | Root-level dynamic route increases route ambiguity but static routes take precedence. |
| `/voxpage-widget-lab` | Internal prototype | noindex/nofollow | inherited-risk | no | Crawl is not blocked in `robots.txt`. |
| `/api/audit` | Form/API endpoint | non-document endpoint | n/a | no | Should not be crawled. |
| `/api/growth-game` | Form/API endpoint | non-document endpoint | n/a | no | Should not be crawled. |

## Findings and priorities

### P0 — required before broad indexation

1. **Missing topic-cluster routes.** There are no dedicated URLs for Smart Websites, AI Agent, CRM & Automations, Local SEO & GEO, Google Ads, industry hubs, selected industry pages, resources, about, or the proposed audit URL. This prevents clean keyword-to-page mapping and strong contextual internal linking.
2. **Do not index thin scaffolds.** The target architecture includes many detail URLs, but publishing them with reused or placeholder copy would create thin or near-duplicate pages. Route data and templates can be prepared now; sitemap inclusion and indexability should wait for the content phases.

### P1 — high impact

1. **Root canonical inheritance risk.** `app/layout.tsx` sets `alternates.canonical` to `/`. Routes such as `/audit`, `/demos`, `/voxpage-widget-lab`, and dynamic demos do not override it. Remove the canonical from the root layout and define self-referencing canonicals only on indexable pages.
2. **Service links point to fragments.** The header/footer and `/services` cards point to anchors such as `/services#smart-websites`, not dedicated service URLs. Update these when the service detail routes are ready.
3. **Primary CTA URL mismatch.** Calls to action use `/audit`, while the proposed architecture uses `/free-growth-audit/`. Make the descriptive URL canonical and permanently redirect the old URL so existing links remain valid.
4. **No dedicated About page.** Company information appears inside the homepage portfolio section. A separate `/about/` page should clarify the company, audience, services, and the relationship to Uno Zero Marketing LLC using only verified public information already present in the repository.
5. **No Google Ads service entity.** Paid ads appear in homepage/pricing copy but are absent from the four-item service schema and service architecture.

### P2 — medium impact

1. **Duplicate H1s on legal pages.** `/privacy` and `/terms` each render an H1 in the page intro and another in the document card. Keep one page-level H1 and demote the document duplicate.
2. **Crawl controls are broad.** `robots.ts` allows every route. Add disallow rules for `/api/`, `/demos`, `/voxpage-widget-lab`, and other private/demo patterns while retaining page-level noindex directives.
3. **Sitemap coverage is incomplete.** It currently contains only the homepage, combined services page, growth game, and legal pages. Add only canonical, indexable commercial routes as substantial pages are published.
4. **Sitemap dates are unstable.** Every request/build uses `new Date()`, implying that all pages changed at build time. Prefer content-derived or fixed update dates when a reliable source is available.
5. **No custom 404 experience.** Unknown URLs correctly return a 404 through Next.js, but there is no branded `app/not-found.tsx` that helps people recover via core navigation.
6. **Internal link coverage is shallow.** The homepage does not provide crawlable links from industry cards to industry hubs/details, resources links point to the homepage FAQ, and service-to-industry relationships do not yet exist.
7. **Placeholder social links.** Instagram, TikTok, and LinkedIn links use `href="#"`. They are not useful destinations and should be replaced with verified profiles or removed from navigation.

### P3 — quality and performance

1. **Large client boundary.** The 1,300+ line marketing component is marked `"use client"`, so mostly static marketing content is included in the client JavaScript boundary. Split interactive islands from static sections in a later performance pass.
2. **Large source assets.** Several PNG portfolio and hero images are approximately 1.2–1.8 MB. `next/image` mitigates delivery cost for many usages, but modern source formats and right-sized assets would reduce processing and transfer risk.
3. **Global chat on most routes.** The client-side chat experience is mounted on public, legal, audit, and most other routes. Validate its real-world impact on interaction latency and main-thread work.
4. **Heading semantics in interactive tools.** Audit and Growth Game screens render different H1s as state changes. This is acceptable for application states but should remain excluded from indexation if the primary content is not stable.
5. **Manifest has no icons.** The web manifest provides an empty icon list even though brand assets exist.

## Metadata and structured data review

- Homepage metadata, Open Graph metadata, Twitter card metadata, and a generated Open Graph image exist.
- The homepage FAQ schema mirrors visible FAQ content, which is the correct pattern.
- Organization and WebSite entities use consistent IDs and do not fabricate reviews or ratings.
- The homepage Service schema currently describes a broad bundled service and says `areaServed: North America`; the stated primary market is the United States. Reconcile this in the technical SEO/schema phase.
- `/services` uses an ItemList of services, but its URLs are fragment identifiers and Google Ads is missing.
- Detail-page Service and BreadcrumbList schema do not yet exist because the detail pages do not exist.
- Indexable pages generally define unique titles and descriptions. Pages that rely on root metadata need explicit review after the architecture is introduced.

## Content and semantic review

- The homepage has one H1 and a logical section hierarchy. Its current H1 and title are close to the target strategy but will be updated in Phase 3.
- `/services` has one H1 and service detail sections as H2s. These sections contain enough source material to seed, but not replace, dedicated service pages.
- Image alternative text is generally descriptive. Decorative brand marks correctly use empty alt text; meaningful workflow and industry images use descriptive alt text.
- The homepage establishes local service businesses, websites, AI response, CRM, automation, Local SEO, Google Business Profile, Search/Maps, ads, inquiries, bookings, and customers. Keyword coverage should be refined naturally in Phase 3 rather than expanded indiscriminately.

## Architecture decision for Phase 2

Target URL families:

- Service hub: `/services/`
- Service details: `/services/smart-websites/`, `/services/ai-agent/`, `/services/crm-automations/`, `/services/local-seo-geo/`, `/services/google-ads/`
- Industry hub: `/industries/`
- Initial industry details: `/industries/home-services/`, `/industries/pressure-washing/`, `/industries/cleaning-services/`, `/industries/landscaping/`, `/industries/plumbing/`, `/industries/hvac/`, `/industries/roofing/`, `/industries/electricians/`
- Resource hub and future articles: `/resources/` and `/resources/[article-slug]/`
- Conversion and trust pages: `/free-growth-audit/` and `/about/`

Implementation principles:

1. Keep all existing URLs working.
2. Use a permanent redirect from `/audit` to `/free-growth-audit` after the new canonical route is live.
3. Centralize service and industry route definitions so navigation, static generation, metadata, and later sitemap entries cannot drift.
4. Publish the hubs with useful orientation copy and crawlable internal links.
5. Prepare detail route templates without adding thin pages to the XML sitemap. Make detail pages indexable only when their unique Phase 4/5 content is complete.
6. Reserve `/resources/[article-slug]/` as a dynamic route that returns a real 404 for unknown/unpublished content; do not generate placeholder articles.

## Proposed phased changes after this audit

- **Phase 2:** establish route/config architecture; add hubs; preserve `/audit`; update top-level navigation; keep incomplete detail pages out of the sitemap.
- **Phases 3–4:** optimize homepage intent; publish five substantial service pages with metadata, schema, FAQ content, and contextual links.
- **Phase 5:** publish selected substantial industry pages from the shared industry model; expand only when unique content exists.
- **Phase 6:** remove root canonical inheritance, tighten robots and sitemap, add breadcrumbs/schema, fix duplicate H1s, create a branded 404, and address lint configuration.
- **Phases 7–8:** strengthen answer-first entity clarity and hub-and-spoke internal linking.
- **Phase 9:** create the content roadmap and publish resources intentionally.
- **Phase 10:** validate rendered metadata, status codes, schema, responsive behavior, and the final production build.

## Files affected by the planned work

- Existing: `app/layout.tsx`, `app/page.tsx`, `app/services/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/audit/page.tsx`, `components/landing-page.tsx`, `app/globals.css`, `next.config.ts`, `package.json`.
- New architecture: route data under `lib/seo/`; route segments under `app/services/`, `app/industries/`, `app/resources/`, `app/free-growth-audit/`, and `app/about/`; shared marketing page components as needed.

## Validation checklist

- Confirm every public route returns the intended 200, 308, or 404 status.
- Confirm exactly one canonical per indexable page in rendered HTML.
- Confirm noindex routes do not enter the sitemap.
- Confirm titles/descriptions are unique and visible content supports their search intent.
- Validate all JSON-LD as parseable JSON and against visible page content.
- Confirm one stable page-level H1 on every indexable marketing page.
- Test internal links, keyboard access, mobile navigation, image sizing, and primary CTAs.
- Run TypeScript/build validation and replace the obsolete lint script with a supported ESLint command before final validation.
