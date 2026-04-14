/**
 * Low-level API wrapper for the addresses endpoint.
 * All network calls go through this file — the service layer never calls fetch directly.
 *
 * HOW TO WIRE IN THE PROD CURL
 * ─────────────────────────────
 * When the PROD endpoint is confirmed, replace the mock import block below with the
 * real fetch call. The shape of the returned data must match Address[] exactly.
 *
 * Equivalent curl for the GET /addresses endpoint:
 *
 *   curl -X GET "$API_BASE_URL/addresses" \
 *        -H "Authorization: Bearer $API_TOKEN" \
 *        -H "Content-Type: application/json"
 *
 * Equivalent curl for POST (create address):
 *
 *   curl -X POST "$API_BASE_URL/addresses" \
 *        -H "Authorization: Bearer $API_TOKEN" \
 *        -H "Content-Type: application/json" \
 *        -d '{ "warehouseCode": "...", "vendorName": "...", ... }'
 *
 * Steps to migrate from mock to live:
 *   1. Copy .env.example → .env.local and set API_BASE_URL + API_TOKEN.
 *   2. Delete the mock import and the isMockMode branch below.
 *   3. Uncomment the fetch call in fetchAddressesFromApi().
 *   4. Verify the API response shape matches Address[] — adjust field names if needed.
 *
 * TODO: replace mock return with live call once PROD curl is confirmed — mock data mirrors expected response shape.
 */

import type { Address } from "@/src/types/address.types";
import { env } from "@/src/config/env";

// ─── Mock fallback ────────────────────────────────────────────────────────────
// Removed once PROD endpoint is live (see steps above).
import { mockAddresses } from "@/src/data/mockAddresses";

const isMockMode = !env.apiBaseUrl;

// ─── Request / response types ─────────────────────────────────────────────────

export interface GetAddressesParams {
  warehouseCode?: string;
  vendor?: string;
  paymentPlan?: "Prepaid" | "Collect";
  status?: "Active" | "Inactive";
}

// ─── API wrapper ──────────────────────────────────────────────────────────────

export async function fetchAddressesFromApi(
  params?: GetAddressesParams
): Promise<Address[]> {
  if (isMockMode) {
    // TODO: remove this branch once PROD curl is confirmed
    return Promise.resolve(mockAddresses);
  }

  const url = new URL(`${env.apiBaseUrl}/addresses`);
  if (params?.warehouseCode) url.searchParams.set("warehouseCode", params.warehouseCode);
  if (params?.vendor) url.searchParams.set("vendor", params.vendor);
  if (params?.paymentPlan) url.searchParams.set("paymentPlan", params.paymentPlan);
  if (params?.status) url.searchParams.set("status", params.status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.apiToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Unknown error");
    throw new Error(`GET /addresses failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<Address[]>;
}
