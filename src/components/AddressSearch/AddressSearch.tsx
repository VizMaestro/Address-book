/**
 * Filter panel — Figma node 1:13240 "Container".
 * Four controlled fields that emit the full filter state on every change,
 * allowing the parent to run filtering without needing to debounce or batch.
 * Each SelectField has a "— Clear —" item as the first option so the user
 * can reset that filter back to the unfiltered state.
 */

"use client";

import type { JSX } from "react";
import { useState } from "react";

import { InputField, SelectField, SelectItem } from "@sds/ui/primitives";

import type { AddressSearchFilters } from "@/src/types/address.types";

import styles from "./AddressSearch.module.css";

interface AddressSearchProps {
  onSearch?: (filters: AddressSearchFilters) => void;
}

export default function AddressSearch({ onSearch }: AddressSearchProps): JSX.Element {
  const [filters, setFilters] = useState<AddressSearchFilters>({
    warehouseLocation: "",
    vendor: "",
    paymentPolicy: "",
    status: "",
  });

  function handleInputChange(field: keyof AddressSearchFilters, value: string): void {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    onSearch?.(updated);
  }

  function handleSelectChange(
    field: keyof AddressSearchFilters,
    key: string | number | null
  ): void {
    // "__clear__" is the sentinel value for the clear option — maps to empty string
    const value = !key || key === "__clear__" ? "" : String(key);
    handleInputChange(field, value);
  }

  return (
    <section className={styles.section}>
      <div className={styles.headingWrapper}>
        <h2 className={styles.heading}>Address search</h2>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.fieldWrapper}>
          <InputField
            label="Warehouse location"
            placeholder="Enter a warehouse location"
            value={filters.warehouseLocation}
            onChange={(v) => handleInputChange("warehouseLocation", v)}
          />
        </div>

        <div className={styles.fieldWrapper}>
          <InputField
            label="Vendor"
            placeholder="Enter a vendor name"
            value={filters.vendor}
            onChange={(v) => handleInputChange("vendor", v)}
          />
        </div>

        <div className={styles.fieldWrapper}>
          <SelectField
            label="Payment policy"
            placeholder="Select a payment policy"
            selectedKey={filters.paymentPolicy || null}
            onSelectionChange={(key) => handleSelectChange("paymentPolicy", key as string | null)}
          >
            <SelectItem id="__clear__">— Clear selection —</SelectItem>
            <SelectItem id="Prepaid">Prepaid</SelectItem>
            <SelectItem id="Collect">Collect</SelectItem>
          </SelectField>
        </div>

        <div className={styles.fieldWrapper}>
          <SelectField
            label="Status"
            placeholder="Select an address status"
            selectedKey={filters.status || null}
            onSelectionChange={(key) => handleSelectChange("status", key as string | null)}
          >
            <SelectItem id="__clear__">— Clear selection —</SelectItem>
            <SelectItem id="Active">Active</SelectItem>
            <SelectItem id="Inactive">Inactive</SelectItem>
          </SelectField>
        </div>
      </div>
    </section>
  );
}
