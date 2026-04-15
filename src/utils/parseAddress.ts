/**
 * Utilities for converting between a free-text address string (typed into
 * the textarea) and the structured Address fields expected by the API.
 *
 * Supported input formats (comma- or newline-separated):
 *   {street}, {city}, {ST} {zip}
 *   {street}, {unit}, {city}, {ST} {zip}
 *   {street}, {city}, {ST} {zip}, {country}
 *   {street}, {unit}, {city}, {ST} {zip}, {country}
 *   Multi-line equivalents (newlines treated as commas)
 *
 * If parsing fails the raw text is placed in addressLine1 so no input is lost.
 */

import type { Address } from "@/src/types/address.types";

type ParsedAddress = Pick<
  Address,
  "addressLine1" | "city" | "state" | "zip" | "country"
> & {
  addressLine2?: string;
};

/**
 * Regex that identifies the "STATE ZIP" token inside a comma-delimited part.
 * Matches US-style "TX 75201" and Canadian-style "ON M5V 1J1".
 */
const STATE_ZIP_RE = /^(.*?)\s+([A-Z]{2})\s+([\dA-Z][\d\sA-Z-]{1,9})$/i;

/**
 * Two-letter strings that are recognised as standalone country codes rather
 * than state abbreviations when they appear as the very last comma-segment.
 */
const COUNTRY_CODES = new Set(["US", "CA", "MX", "GB", "AU", "DE", "FR"]);

export function parseAddressText(raw: string): ParsedAddress {
  const normalised = raw
    .replace(/\r?\n/g, ",")
    .replace(/,+/g, ",")
    .trim();

  const parts = normalised
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { addressLine1: raw, city: "", state: "", zip: "", country: "US" };
  }

  // Country code appears last when present; stripping it before scanning avoids
  // mistaking a two-letter country for a state abbreviation.
  let country = "US";
  const lastPart = parts[parts.length - 1];
  if (COUNTRY_CODES.has(lastPart.toUpperCase()) && parts.length > 1) {
    country = lastPart.toUpperCase();
    parts.pop();
  }

  // Scan right-to-left so that a street containing a two-letter word is not
  // matched before the actual "STATE ZIP" segment closer to the end.
  let stateZipIdx = -1;
  let city = "";
  let state = "";
  let zip = "";

  for (let i = parts.length - 1; i >= 0; i--) {
    const match = STATE_ZIP_RE.exec(parts[i]);
    if (match) {
      city = match[1].trim();
      state = match[2].toUpperCase();
      zip = match[3].trim();
      stateZipIdx = i;
      break;
    }
  }

  if (stateZipIdx === -1) {
    // No recognisable state/zip — preserve the raw input rather than silently
    // discarding address components the user typed.
    return { addressLine1: raw, city: "", state: "", zip: "", country };
  }

  const streetParts = parts.slice(0, stateZipIdx);

  const addressLine1 = streetParts[0] ?? "";
  const addressLine2 = streetParts[1] ?? undefined;

  return { addressLine1, addressLine2, city, state, zip, country };
}

/**
 * Converts a structured Address back into the single-line text that would
 * produce the same structure when passed back through parseAddressText.
 * Used to pre-fill the textarea when opening the edit modal.
 */
export function formatAddressToText(address: Address): string {
  const line2 = address.addressLine2 ? `, ${address.addressLine2}` : "";
  return `${address.addressLine1}${line2}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
}
