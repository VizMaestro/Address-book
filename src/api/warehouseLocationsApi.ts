/**
 * Low-level API wrapper for the warehouse locations endpoint.
 * All network calls go through this file — the service layer never calls fetch directly.
 *
 * HOW TO WIRE IN THE PROD CURL
 * ─────────────────────────────
 * When the PROD endpoint is confirmed, replace the mock import block below with
 * the real fetch call. The shape of the returned data must match
 * WarehouseLocationRecord[] exactly.
 *
 * ── PRODUCTION CURL ──────────────────────────────────────────────────────────
 * Paste your production curl equivalent here when moving to prod:
 *
 *   curl -X GET "$API_BASE_URL/warehouse-locations" \
 *        -H "Authorization: Bearer $API_TOKEN" \
 *        -H "Content-Type: application/json"
 *
 * With optional search filter:
 *
 *   curl -X GET "$API_BASE_URL/warehouse-locations?search=BOSTON" \
 *        -H "Authorization: Bearer $API_TOKEN" \
 *        -H "Content-Type: application/json"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Steps to migrate from mock to live:
 *   1. Copy .env.example → .env.local and set API_BASE_URL + API_TOKEN.
 *   2. Delete the mock import and the isMockMode branch below.
 *   3. Uncomment the fetch call in fetchWarehouseLocationsFromApi().
 *   4. Verify the API response shape matches WarehouseLocationRecord[] —
 *      adjust field names if needed.
 *
 * TODO: replace mock return with live call once PROD curl is confirmed — mock data mirrors expected response shape.
 */

import type {
  GetWarehouseLocationsParams,
  GetWarehouseLocationsResponse,
} from "@/src/types/warehouseLocation.types";
import { env } from "@/src/config/env";

// ─── Mock fallback ────────────────────────────────────────────────────────────
// Removed once PROD endpoint is live (see steps above).
import { warehouseLocations } from "@/src/data/warehouseLocations";

const isMockMode = !env.apiBaseUrl;

// ─── API wrapper ──────────────────────────────────────────────────────────────

export async function fetchWarehouseLocationsFromApi(
  params?: GetWarehouseLocationsParams
): Promise<GetWarehouseLocationsResponse> {
  if (isMockMode) {
    // TODO: remove this branch once PROD curl is confirmed
    const results = params?.search
      ? warehouseLocations.filter((wh) =>
          wh.label.toLowerCase().includes(params.search!.toLowerCase())
        )
      : warehouseLocations;
    return Promise.resolve(results);
  }

  const url = new URL(`${env.apiBaseUrl}/warehouse-locations`);
  if (params?.search) url.searchParams.set("search", params.search);

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
    throw new Error(
      `GET /warehouse-locations failed (${response.status}): ${message}`
    );
  }

  return response.json() as Promise<GetWarehouseLocationsResponse>;
}
