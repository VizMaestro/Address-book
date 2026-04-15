/**
 * Page title bar — Figma node 5:4174 "Page Header".
 * Contains the application title, subtitle, and two action buttons.
 * onDownload and onAddAddress are optional so the component renders
 * safely in contexts where those actions are not yet wired.
 */
"use client";

import type { JSX } from "react";

import { Button, ButtonGroup } from "@sds/ui/primitives";
import { IconDownloadCloud, IconPlus } from "@sds/ui/icons";

import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onDownload?: () => void;
  onAddAddress?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  onDownload,
  onAddAddress,
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
          <Button variant="primary" size="medium" onPress={onAddAddress}>
            <IconPlus size="16" />
            Add address
          </Button>
        </ButtonGroup>
      </div>

      <div className={styles.supportingRow}>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </header>
  );
}
