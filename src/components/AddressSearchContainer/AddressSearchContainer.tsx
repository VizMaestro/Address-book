/**
 * Client boundary between the server page and the interactive search/results area.
 * Holds filter results in local state and runs client-side filtering so the server
 * page remains a pure async Server Component with no interactive state.
 * When the API supports query params, replace filterAddresses with a server action.
 */

"use client";

import type { JSX } from "react";
import { useState } from "react";

import AddressSearch from "@/src/components/AddressSearch";
import MapContainer from "@/src/components/MapContainer";

import type { Address, AddressSearchFilters } from "@/src/types/address.types";
import { filterAddresses } from "@/src/utils/filterAddresses";

interface AddressSearchContainerProps {
  allAddresses: Address[];
  /** Forwarded to each AddressRow's edit icon button via MapContainer → SearchResultCard. */
  onEditAddress?: (id: string) => void;
}

export default function AddressSearchContainer({
  allAddresses,
  onEditAddress,
}: AddressSearchContainerProps): JSX.Element {
  const [activeFilters, setActiveFilters] = useState<AddressSearchFilters | null>(null);
  const results = activeFilters ? filterAddresses(allAddresses, activeFilters) : undefined;

  function handleSearch(filters: AddressSearchFilters): void {
    setActiveFilters(filters);
  }

  return (
    <>
      <AddressSearch onSearch={handleSearch} />
      <MapContainer results={results} onEditAddress={onEditAddress} />
    </>
  );
}
