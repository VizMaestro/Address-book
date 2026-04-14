import type { Address, AddressMetrics } from "@/src/types/address.types";

export function computeMetrics(addresses: Address[]): AddressMetrics {
  const warehouseSet = new Set(addresses.map((a) => a.warehouseCode));
  return {
    total: addresses.length,
    warehouseLocations: warehouseSet.size,
    active: addresses.filter((a) => a.status === "Active").length,
    inactive: addresses.filter((a) => a.status === "Inactive").length,
    prepaid: addresses.filter((a) => a.paymentPlan === "Prepaid").length,
  };
}
