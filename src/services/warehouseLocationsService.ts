/**
 * Service layer for warehouse location data.
 * Components and pages import from here — never from warehouseLocationsApi.ts directly.
 * This keeps the API surface stable while the underlying transport can change.
 */

import type {
  GetWarehouseLocationsParams,
  GetWarehouseLocationsResponse,
} from "@/src/types/warehouseLocation.types";

import { fetchWarehouseLocationsFromApi } from "@/src/api/warehouseLocationsApi";

export async function fetchWarehouseLocations(
  params?: GetWarehouseLocationsParams
): Promise<GetWarehouseLocationsResponse> {
  return fetchWarehouseLocationsFromApi(params);
}
