/**
 * Type contract for the warehouse locations API.
 * Field names and shapes must stay in sync with src/data/warehouseLocations.ts
 * and src/api/warehouseLocationsApi.ts.
 */

export interface WarehouseLocationRecord {
  id: string;
  label: string;
}

export interface GetWarehouseLocationsParams {
  search?: string;
}

export type GetWarehouseLocationsResponse = WarehouseLocationRecord[];
