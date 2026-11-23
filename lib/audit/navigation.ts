const campaignParameters = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

export function roofingAuditHref(search: string) {
  const incoming = new URLSearchParams(search);
  const campaign = new URLSearchParams();
  for (const key of campaignParameters) {
    const value = incoming.get(key);
    if (value) campaign.set(key, value);
  }
  const query = campaign.toString();
  return `/free-growth-audit/roofing${query ? `?${query}` : ""}`;
}
