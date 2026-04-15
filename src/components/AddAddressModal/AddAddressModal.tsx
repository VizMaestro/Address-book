/**
 * Add / Edit address dialog content.
 *
 * Figma nodes: 13:7305 (single entry) + 14:1616 (bulk upload).
 * Rendered inside an SDS Dialog opened either from PageHeader ("add" mode)
 * or from DashboardClient ("edit" mode).
 *
 * Modes
 * ──────
 * add  — shows the Tab bar (Single entry / Bulk upload); "Add address" button
 * edit — hides the Tab bar; shows only the single-entry fields pre-filled from
 *        `initialValues`; button label becomes "Save changes"
 *
 * Submission (single-entry panel only)
 * ─────────────────────────────────────
 * The address textarea is parsed via parseAddressText() into structured fields
 * (addressLine1, addressLine2?, city, state, zip, country).  All other fields
 * (warehouseCode, vendorName, paymentPlan, carrier) come directly from their
 * controlled inputs.  The merged object is passed to `onSubmit`.
 *
 * Warehouse options are sourced from warehouseLocations.ts.
 * Payment policy is always "Prepaid" or "Collect".
 */

"use client";

import type { JSX } from "react";
import { useState } from "react";

import {
  Button,
  ButtonGroup,
  DialogClose,
  InputField,
  SelectField,
  SelectItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextareaField,
  TextHeading,
  TextSmall,
  TextStrong,
} from "@sds/ui/primitives";
import { IconCheck, IconUpload, IconX } from "@sds/ui/icons";

import type { Address } from "@/src/types/address.types";
import { warehouseLocations } from "@/src/data/warehouseLocations";
import { parseAddressText, formatAddressToText } from "@/src/utils/parseAddress";
import styles from "./AddAddressModal.module.css";

interface AddAddressModalProps {
  onClose: () => void;
  /** Called with the fully-structured address data when the form is submitted. */
  onSubmit?: (data: Omit<Address, "id"> & { id?: string }) => void;
  /** "add" shows tabs and uses "Add address" label; "edit" hides tabs and uses "Save changes". */
  mode?: "add" | "edit";
  /** Pre-fills all fields when mode is "edit". */
  initialValues?: Address;
}

export default function AddAddressModal({
  onClose,
  onSubmit,
  mode = "add",
  initialValues,
}: AddAddressModalProps): JSX.Element {
  const isEdit = mode === "edit";

  const [warehouseLocation, setWarehouseLocation] = useState<string | null>(
    initialValues?.warehouseCode ?? null,
  );
  const [vendor, setVendor] = useState(initialValues?.vendorName ?? "");
  const [paymentPolicy, setPaymentPolicy] = useState<string | null>(
    initialValues?.paymentPlan ?? null,
  );
  const [carrierName, setCarrierName] = useState(initialValues?.carrier ?? "");
  const [address, setAddress] = useState(
    initialValues ? formatAddressToText(initialValues) : "",
  );

  function handleSubmit(): void {
    const parsed = parseAddressText(address);
    onSubmit?.({
      id: initialValues?.id,
      warehouseCode: warehouseLocation ?? "",
      vendorName: vendor,
      paymentPlan: (paymentPolicy as Address["paymentPlan"]) ?? "Prepaid",
      carrier: carrierName,
      status: initialValues?.status ?? "Active",
      addressLine1: parsed.addressLine1,
      addressLine2: parsed.addressLine2,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      country: parsed.country,
    });
    onClose();
  }

  const singleEntryFields = (
    <>
      <div className={styles.description}>
        <TextStrong elementType="p">
          {isEdit ? "Edit address details" : "Quick entry for addresses"}
        </TextStrong>
        <TextSmall elementType="p" className={styles.descriptionBody}>
          {isEdit
            ? "Update the details below and click Save changes to apply."
            : "A very quick entry point to add single addresses thereby saving time and faster results"}
        </TextSmall>
      </div>

      <hr className={styles.divider} aria-hidden="true" />

      <div className={styles.fieldsRow}>
        <SelectField
          label="Warehouse location"
          placeholder="Select a warehouse location"
          selectedKey={warehouseLocation}
          onSelectionChange={(key) =>
            setWarehouseLocation(key ? String(key) : null)
          }
        >
          {warehouseLocations.map((wh) => (
            <SelectItem key={wh.id} id={wh.id}>
              {wh.label}
            </SelectItem>
          ))}
        </SelectField>

        <InputField
          label="Vendor"
          placeholder="Enter a vendor name"
          value={vendor}
          onChange={setVendor}
        />
      </div>

      <div className={styles.fieldsRow}>
        <SelectField
          label="Payment policy"
          placeholder="Select a payment policy"
          selectedKey={paymentPolicy}
          onSelectionChange={(key) =>
            setPaymentPolicy(key ? String(key) : null)
          }
        >
          <SelectItem id="Prepaid">Prepaid</SelectItem>
          <SelectItem id="Collect">Collect</SelectItem>
        </SelectField>

        <InputField
          label="Carrier name"
          placeholder="Enter a carrier name"
          value={carrierName}
          onChange={setCarrierName}
        />
      </div>

      <TextareaField
        label="Address"
        placeholder="Enter the address (e.g. 123 Main St, Suite 100, City, ST 12345)"
        value={address}
        onChange={setAddress}
        isResizable
      />

      <ButtonGroup align="end" className={styles.footer}>
        <Button variant="subtle" size="medium" onPress={onClose}>
          <IconX size="16" />
          Close
        </Button>
        <Button variant="primary" size="medium" onPress={handleSubmit}>
          <IconCheck size="16" />
          {isEdit ? "Save changes" : "Add address"}
        </Button>
      </ButtonGroup>
    </>
  );

  return (
    <>
      <DialogClose onPress={onClose} />

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <TextHeading elementType="h2" className={styles.title}>
            {isEdit ? "Edit address" : "Add address"}
          </TextHeading>
        </div>

        {isEdit ? (
          /* Edit mode — no tabs, just the single-entry form */
          <div className={styles.tabPanel}>{singleEntryFields}</div>
        ) : (
          /* Add mode — tab bar with single entry + bulk upload */
          <Tabs defaultSelectedKey="single-entry" className={styles.tabs}>
            <TabList
              aria-label="Address entry method"
              className={styles.tabList}
            >
              <Tab id="single-entry" className={styles.tab}>
                Single entry
              </Tab>
              <Tab id="bulk-upload" className={styles.tab}>
                Bulk upload
              </Tab>
            </TabList>

            {/* ── Single entry panel ──────────────────────────────────── */}
            <TabPanel id="single-entry" className={styles.tabPanel}>
              {singleEntryFields}
            </TabPanel>

            {/* ── Bulk upload panel ───────────────────────────────────── */}
            <TabPanel id="bulk-upload" className={styles.tabPanel}>
              <div className={styles.description}>
                <TextStrong elementType="p">Upload addresses at bulk</TextStrong>
                <TextSmall elementType="p" className={styles.descriptionBody}>
                  Download the template file provided below to get the .csv
                  file, edit the file to add the details needed and upload here
                  to create new/update the addresses.
                </TextSmall>
              </div>

              <hr className={styles.divider} aria-hidden="true" />

              <div className={styles.dropzone}>
                <IconUpload className={styles.uploadIcon} size="40" />

                <div className={styles.dropzoneTextBlock}>
                  <p className={styles.dropzoneText}>
                    Upload{" "}
                    <strong className={styles.dropzoneCsvBold}>.csv</strong>{" "}
                    template file after making the
                  </p>
                  <div className={styles.dropzoneInlineRow}>
                    <span className={styles.dropzoneText}>
                      necessary changes.
                    </span>
                    <Button variant="subtle" size="small" onPress={onClose}>
                      Close
                    </Button>
                    <span className={styles.dropzoneText}>from here</span>
                  </div>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        )}
      </div>
    </>
  );
}
