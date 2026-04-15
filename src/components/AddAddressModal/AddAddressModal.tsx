/**
 * Add address dialog content — Figma nodes 13:7305 (single entry) + 14:1616 (bulk upload).
 *
 * Rendered inside an SDS Dialog opened from PageHeader's "Add address" button.
 * Receives `onClose` from the Dialog render-prop.
 *
 * Tab layout
 * ──────────
 * Single entry  — two 50/50 field rows + full-width textarea + footer buttons
 * Bulk upload   — description + upload dropzone; NO footer buttons (X only)
 *
 * Warehouse options are sourced from warehouseLocations.json.
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

import { warehouseLocations } from "@/src/data/warehouseLocations";
import styles from "./AddAddressModal.module.css";

interface AddAddressModalProps {
  onClose: () => void;
}

export default function AddAddressModal({
  onClose,
}: AddAddressModalProps): JSX.Element {
  const [warehouseLocation, setWarehouseLocation] = useState<string | null>(
    null,
  );
  const [vendor, setVendor] = useState("");
  const [paymentPolicy, setPaymentPolicy] = useState<string | null>(null);
  const [carrierName, setCarrierName] = useState("");
  const [address, setAddress] = useState("");

  return (
    <>
      <DialogClose onPress={onClose} />

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <TextHeading elementType="h2" className={styles.title}>
            Add address
          </TextHeading>
        </div>

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
            <div className={styles.description}>
              <TextStrong elementType="p">
                Quick entry for addresses
              </TextStrong>
              <TextSmall elementType="p" className={styles.descriptionBody}>
                A very quick entry point to add single addresses thereby saving
                time and faster results
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
              placeholder="Enter the address"
              value={address}
              onChange={setAddress}
              isResizable
            />

            {/* Footer lives inside this panel only — bulk upload has no footer */}
            <ButtonGroup align="end" className={styles.footer}>
              <Button variant="subtle" size="medium" onPress={onClose}>
                <IconX size="16" />
                Close
              </Button>
              <Button variant="primary" size="medium">
                <IconCheck size="16" />
                Add address
              </Button>
            </ButtonGroup>
          </TabPanel>

          {/* ── Bulk upload panel ───────────────────────────────────── */}
          <TabPanel id="bulk-upload" className={styles.tabPanel}>
            <div className={styles.description}>
              <TextStrong elementType="p">
                Upload addresses at bulk
              </TextStrong>
              <TextSmall elementType="p" className={styles.descriptionBody}>
                Download the template file provided below to get the .csv file,
                edit the file to add the details needed and upload here to
                create new/update the addresses.
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
                  {/* "Close" dismisses the dialog so the user can prepare their CSV */}
                  <Button variant="subtle" size="small" onPress={onClose}>
                    Close
                  </Button>
                  <span className={styles.dropzoneText}>from here</span>
                </div>
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
}
