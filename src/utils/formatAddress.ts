/**
 * Address string formatting utilities.
 * Centralised here to keep render components free of string concatenation logic
 * and to ensure address display format is consistent across the application.
 */

import type { Address } from "@/src/types/address.types";

export function formatFullAddress(address: Address): string {
  const line2 = address.addressLine2 ? `, ${address.addressLine2}` : "";
  return `${address.addressLine1}${line2}, ${address.city}, ${address.state} ${address.zip}`;
}
