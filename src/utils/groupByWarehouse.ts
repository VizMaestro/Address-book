/**
 * Groups a flat Address array into a Map keyed by warehouseCode.
 * Map is used (not a plain object) to preserve insertion order, so warehouse
 * groups appear in the same sequence the API returns them.
 */

import type { Address } from "@/src/types/address.types";

export function groupByWarehouse(addresses: Address[]): Map<string, Address[]> {
  const groups = new Map<string, Address[]>();
  for (const address of addresses) {
    const existing = groups.get(address.warehouseCode);
    if (existing) {
      existing.push(address);
    } else {
      groups.set(address.warehouseCode, [address]);
    }
  }
  return groups;
}
