/**
 * Mirrors the shape expected from the PROD /addresses endpoint.
 * Field names and types must stay in sync with the API contract — do not rename without updating addressApi.ts.
 */

export interface AddressSearchFilters {
  warehouseLocation: string;
  vendor: string;
  paymentPolicy: string;
  status: string;
}

export interface Address {
  id: string;
  warehouseCode: string;
  vendorName: string;
  carrier: string;
  paymentPlan: "Prepaid" | "Collect";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  status: "Active" | "Inactive";
}

export interface AddressMetrics {
  total: number;
  warehouseLocations: number;
  active: number;
  inactive: number;
  prepaid: number;
}
