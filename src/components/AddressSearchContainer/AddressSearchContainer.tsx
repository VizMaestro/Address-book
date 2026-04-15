/**
 * Client boundary between the server page and the interactive search/results area.
 * Holds filter results in local state and runs client-side filtering so the server
 * page remains a pure async Server Component with no interactive state.
 * When the API supports query params, replace filterAddresses with a server action.
 */

"use client";

import type { JSX } from "react";
import { useState } from "react";

import type { Address, AddressSearchFilters } from "@/src/types/address.types";
import { filterAddresses } from "@/src/utils/filterAddresses";
import AddressSearch from "@/src/components/AddressSearch";
import MapContainer from "@/src/components/MapContainer";

interface AddressSearchContainerProps {
  allAddresses: Address[];
  /** Forwarded to each AddressRow's edit icon button via MapContainer → SearchResultCard. */
  onEditAddress?: (id: string) => void;
}

export default function AddressSearchContainer({
  allAddresses,
  onEditAddress,
}: AddressSearchContainerProps): JSX.Element {
  const [results, setResults] = useState<Address[] | undefined>(undefined);

  function handleSearch(filters: AddressSearchFilters): void {
    setResults(filterAddresses(allAddresses, filters));
  }

  return (
    <>
      <AddressSearch onSearch={handleSearch} />
      <MapContainer results={results} onEditAddress={onEditAddress} />
    </>
  );
}
