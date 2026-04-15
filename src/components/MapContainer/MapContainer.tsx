/**
 * Results area — "Map Container" section.
 * Toggles between an empty-state illustration (no active filter) and a
 * scrollable list of SearchResultCard components (filter has returned results).
 * Grouping by warehouse is deferred to this component so SearchResultCard
 * receives a clean, pre-grouped slice of the data.
 */

import type { JSX } from "react";

import Image from "next/image";

import type { Address } from "@/src/types/address.types";
import { groupByWarehouse } from "@/src/utils/groupByWarehouse";
import SearchResultCard from "@/src/components/SearchResultCard";

import styles from "./MapContainer.module.css";

interface MapContainerProps {
  results?: Address[];
  onCopyAddress?: (id: string) => void;
  onEditAddress?: (id: string) => void;
}

export default function MapContainer({
  results,
  onCopyAddress,
  onEditAddress,
}: MapContainerProps): JSX.Element {
  const hasResults = results && results.length > 0;

  if (hasResults) {
    const groups = groupByWarehouse(results);
    return (
      <section className={styles.resultsContainer}>
        {Array.from(groups.entries()).map(([code, addresses]) => (
          <SearchResultCard
            key={code}
            warehouseCode={code}
            addresses={addresses}
            onCopyAddress={onCopyAddress}
            onEditAddress={onEditAddress}
          />
        ))}
      </section>
    );
  }

  return (
    <section className={styles.mapContainer}>
      <Image
        src="/illustration-warehouse.png"
        alt="Warehouse staff illustration"
        width={390}
        height={234}
        className={styles.illustration}
        priority
        unoptimized
      />
      <div className={styles.textGroup}>
        <p className={styles.emptyHeading}>Search to find the address</p>
        <p className={styles.emptyBody}>
          Use the text entry sections above to search for an address
        </p>
      </div>
    </section>
  );
}
