/**
 * Service layer for address data.
 * Components and pages import from here — never from addressApi.ts directly.
 * This keeps the API surface stable while the underlying transport can change.
 */

import type { Address, AddressMetrics } from "@/src/types/address.types";
import type { GetAddressesParams } from "@/src/api/addressApi";

import { fetchAddressesFromApi } from "@/src/api/addressApi";
import { computeMetrics } from "@/src/utils/computeMetrics";

export async function fetchAddresses(
  params?: GetAddressesParams
): Promise<Address[]> {
  return fetchAddressesFromApi(params);
}

export async function fetchMetrics(
  params?: GetAddressesParams
): Promise<AddressMetrics> {
  const addresses = await fetchAddressesFromApi(params);
  return computeMetrics(addresses);
}
