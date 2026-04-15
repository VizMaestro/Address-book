/**
 * Warehouse group card — "Card (Slot)" section.
 * Renders one card per warehouse code: a header with the location identifier
 * and a stacked list of AddressRow components for every vendor at that location.
 */

import type { JSX } from "react";

import { IconLayers } from "@sds/ui/icons";
import { TextStrong } from "@sds/ui/primitives";

import type { Address } from "@/src/types/address.types";
import AddressRow from "@/src/components/AddressRow";

import styles from "./SearchResultCard.module.css";

interface SearchResultCardProps {
  warehouseCode: string;
  addresses: Address[];
  onCopyAddress?: (id: string) => void;
  onEditAddress?: (id: string) => void;
}

export default function SearchResultCard({
  warehouseCode,
  addresses,
  onCopyAddress,
  onEditAddress,
}: SearchResultCardProps): JSX.Element {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={styles.headerIcon}>
          <IconLayers size="20" />
        </span>
        <TextStrong className={styles.headerText}>{warehouseCode}</TextStrong>
      </header>
      <div className={styles.addressStack}>
        {addresses.map((address) => (
          <AddressRow
            key={address.id}
            address={address}
            onCopy={onCopyAddress}
            onEdit={onEditAddress}
          />
        ))}
      </div>
    </article>
  );
}
