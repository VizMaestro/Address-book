/**
 * Client-side state owner for the Address Book dashboard.
 *
 * PageHeader and AddressSearchContainer are siblings under a server component
 * and cannot share React state. This client wrapper owns the address list and
 * the edit-dialog state so both children always read from the same source of
 * truth without a context provider or a global store.
 *
 */

"use client";

import type { JSX } from "react";
import { useState } from "react";

import {
  Dialog,
  DialogModal,
  DialogTrigger,
} from "@sds/ui/primitives";

import type { Address, AddressMetrics } from "@/src/types/address.types";
import PageHeader from "@/src/components/PageHeader";
import MetricsRow from "@/src/components/MetricsRow";
import AddressSearchContainer from "@/src/components/AddressSearchContainer";
import AddAddressModal from "@/src/components/AddAddressModal";

import styles from "./DashboardClient.module.css";

interface DashboardClientProps {
  initialAddresses: Address[];
  metrics: AddressMetrics;
}

export default function DashboardClient({
  initialAddresses,
  metrics,
}: DashboardClientProps): JSX.Element {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  function handleAddAddress(data: Omit<Address, "id">): void {
    const newEntry: Address = {
      ...data,
      id: crypto.randomUUID(),
    };
    setAddresses((prev) => [newEntry, ...prev]);
  }

  function handleEditClick(id: string): void {
    const found = addresses.find((a) => a.id === id) ?? null;
    setEditingAddress(found);
  }

  function handleUpdateAddress(data: Omit<Address, "id"> & { id?: string }): void {
    if (!editingAddress) return;
    const updatedId = data.id ?? editingAddress.id;
    setAddresses((prev) =>
      prev.map((a) => (a.id === updatedId ? { ...a, ...data, id: updatedId } : a))
    );
    setEditingAddress(null);
  }

  function handleEditClose(): void {
    setEditingAddress(null);
  }

  return (
    <>
      <PageHeader
        title="Address Book"
        subtitle="Manage warehouse addresses, vendors, carriers, and payment policies."
        onAddAddress={handleAddAddress}
      />
      <MetricsRow metrics={metrics} />
      <AddressSearchContainer
        allAddresses={addresses}
        onEditAddress={handleEditClick}
      />

      {/* ── Programmatically-controlled edit dialog ───────────────────── */}
      <DialogTrigger isOpen={!!editingAddress} onOpenChange={handleEditClose}>
        <DialogModal className={styles.editAddressOverlay}>
          <Dialog
            aria-label="Edit address"
            type="card"
            className={styles.editAddressDialog}
          >
            {({ close }) =>
              editingAddress ? (
                <AddAddressModal
                  mode="edit"
                  initialValues={editingAddress}
                  onClose={() => {
                    close();
                    handleEditClose();
                  }}
                  onSubmit={handleUpdateAddress}
                />
              ) : (
                <span />
              )
            }
          </Dialog>
        </DialogModal>
      </DialogTrigger>
    </>
  );
}
