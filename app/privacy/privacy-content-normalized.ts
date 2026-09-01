import { privacyContent as sourcePrivacyContent } from "./privacy-content";

// Use the exact legal entity spelling consistently across the public policies.
export const privacyContent = sourcePrivacyContent
  .replaceAll("BotPager, operated by UnoZero Marketing LLC", "This Privacy Policy applies to BotPager, a service operated by Uno Zero Marketing LLC")
  .replaceAll("), respects your privacy", "), which respects your privacy");
