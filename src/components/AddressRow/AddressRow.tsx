/**
 * Single vendor address row.
 * Renders five fixed/flex columns (vendor, address, payment, carrier, status)
 * separated by 1px dividers, plus two action icon buttons.
 * Marked "use client" because IconButton uses react-aria press handlers.
 */

"use client";

import type { JSX } from "react";

import {
  IconCopy,
  IconCreditCard,
  IconDollarSign,
  IconEdit2,
  IconMap,
  IconShoppingBag,
  IconTruck,
} from "@sds/ui/icons";
import { IconButton, Tag, TextSmall, TextStrong } from "@sds/ui/primitives";

import type { Address } from "@/src/types/address.types";
import { formatFullAddress } from "@/src/utils/formatAddress";

import styles from "./AddressRow.module.css";

interface AddressRowProps {
  address: Address;
  onCopy?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function AddressRow({
  address,
  onCopy,
  onEdit,
}: AddressRowProps): JSX.Element {
  return (
    <div className={styles.row}>
      <div className={styles.vendorColumn}>
        <span className={styles.iconContainer}>
          <IconShoppingBag size="20" />
        </span>
        <TextStrong className={styles.vendorText}>{address.vendorName}</TextStrong>
      </div>

      <div className={styles.divider} />

      <div className={styles.addressColumn}>
        <span className={styles.iconContainer}>
          <IconMap size="20" />
        </span>
        <TextSmall className={styles.detailText}>{formatFullAddress(address)}</TextSmall>
      </div>

      <div className={styles.divider} />

      <div className={styles.paymentColumn}>
        <span className={styles.iconContainer}>
          {address.paymentPlan === "Collect" ? (
            <IconDollarSign size="20" />
          ) : (
            <IconCreditCard size="20" />
          )}
        </span>
        <TextSmall className={styles.detailText}>{address.paymentPlan}</TextSmall>
      </div>

      <div className={styles.divider} />

      <div className={styles.carrierColumn}>
        <span className={styles.iconContainer}>
          <IconTruck size="20" />
        </span>
        <TextSmall className={styles.detailText}>{address.carrier}</TextSmall>
      </div>

      <div className={styles.divider} />

      <div className={styles.statusColumn}>
        <Tag
          scheme={address.status === "Active" ? "positive" : "neutral"}
          variant="secondary"
        >
          {address.status}
        </Tag>
      </div>

      <div className={styles.divider} />

      <div className={styles.actionsColumn}>
        <IconButton
          aria-label="Copy address"
          variant="subtle"
          onPress={() => onCopy?.(address.id)}
        >
          <IconCopy size="20" />
        </IconButton>
        <IconButton
          aria-label="Edit address"
          variant="subtle"
          onPress={() => onEdit?.(address.id)}
        >
          <IconEdit2 size="20" />
        </IconButton>
      </div>
    </div>
  );
}
