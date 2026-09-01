import { termsContent as sourceTermsContent } from "./terms-content";

// Keep the legal entity name consistent with the A2P brand registration and
// the disclosures shown elsewhere on the site. Avoid generic affiliate wording
// that can be misread as a lead-sharing relationship during campaign review.
export const termsContent = sourceTermsContent
  .replaceAll("UnoZero Marketing LLC", "Uno Zero Marketing LLC")
  .replaceAll("AFFILIATES", "RELATED ENTITIES")
  .replaceAll("affiliates", "related entities");
