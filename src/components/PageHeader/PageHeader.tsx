/**
 * Page title bar — Figma node 5:4174 "Page Header".
 * Contains the application title, subtitle, and two action buttons.
 * The "Add address" button opens the AddAddressModal dialog via SDS DialogTrigger.
 * onDownload is optional so the component renders safely without a handler wired.
 */
"use client";

import type { JSX } from "react";

import {
  Button,
  ButtonGroup,
  Dialog,
  DialogModal,
  DialogTrigger,
} from "@sds/ui/primitives";
import { IconDownloadCloud, IconPlus } from "@sds/ui/icons";

import AddAddressModal from "@/src/components/AddAddressModal";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onDownload?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  onDownload,
}: PageHeaderProps): JSX.Element {
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{title}</h1>
        </div>

        <ButtonGroup className={styles.buttonGroup}>
          <Button variant="subtle" size="medium" onPress={onDownload}>
            <IconDownloadCloud size="16" />
            Download data
          </Button>

          <DialogTrigger>
            <Button variant="primary" size="medium">
              <IconPlus size="16" />
              Add address
            </Button>
            <DialogModal className={styles.addAddressOverlay}>
              <Dialog
                aria-label="Add address"
                type="card"
                className={styles.addAddressDialog}
              >
                {({ close }) => <AddAddressModal onClose={close} />}
              </Dialog>
            </DialogModal>
          </DialogTrigger>
        </ButtonGroup>
      </div>

      <div className={styles.supportingRow}>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </header>
  );
}
