/**
 * Pure client-side filter predicate for Address[].
 * Isolated here so it can be replaced with server-side query param filtering
 * when the API endpoint supports it — swapping this file is the only change required.
 */

import type { Address } from "@/src/types/address.types";
import type { AddressSearchFilters } from "@/src/types/address.types";

export function filterAddresses(
  addresses: Address[],
  filters: AddressSearchFilters
): Address[] | undefined {
  const hasFilter =
    filters.warehouseLocation.trim() ||
    filters.vendor.trim() ||
    filters.paymentPolicy ||
    filters.status;

  if (!hasFilter) return undefined;

  return addresses.filter((address) => {
    if (
      filters.warehouseLocation.trim() &&
      !address.warehouseCode
        .toLowerCase()
        .includes(filters.warehouseLocation.trim().toLowerCase())
    ) {
      return false;
    }
    if (
      filters.vendor.trim() &&
      !address.vendorName
        .toLowerCase()
        .includes(filters.vendor.trim().toLowerCase())
    ) {
      return false;
    }
    if (filters.paymentPolicy && address.paymentPlan !== filters.paymentPolicy) {
      return false;
    }
    if (filters.status && address.status !== filters.status) {
      return false;
    }
    return true;
  });
}
