import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizeAuditPhone(value: string): string | undefined {
  const phone = parsePhoneNumberFromString(value.trim(), "US");
  return phone?.isValid() ? phone.number : undefined;
}
