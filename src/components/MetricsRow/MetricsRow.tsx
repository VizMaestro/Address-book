/**
 * Address statistics summary — Figma node 6:4558 "Metrics Row".
 * Displays five aggregate counts derived from the full address dataset.
 * Receives pre-computed metrics as a prop so it has no data-fetching dependency.
 */
"use client";

import type { JSX, ReactNode } from "react";

import {
  IconAlertCircle,
  IconCheck,
  IconCreditCard,
  IconLayers,
  IconShoppingBag,
} from "@sds/ui/icons";

import type { AddressMetrics } from "@/src/types/address.types";

import styles from "./MetricsRow.module.css";

interface MetricItemProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

function MetricItem({ icon, label, value }: MetricItemProps): JSX.Element {
  return (
    <div className={styles.metricItem}>
      <div className={styles.iconContainer}>
        <span className={styles.metricIcon}>{icon}</span>
      </div>
      <div className={styles.labelGroup}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricValue}>{value}</span>
      </div>
    </div>
  );
}

function Divider(): JSX.Element {
  return <div className={styles.divider} />;
}

interface MetricsRowProps {
  metrics: AddressMetrics;
}

export default function MetricsRow({ metrics }: MetricsRowProps): JSX.Element {
  return (
    <section className={styles.metricsRow}>
      <MetricItem
        icon={<IconShoppingBag size="20" />}
        label="Total addresses"
        value={metrics.total}
      />
      <Divider />
      <MetricItem
        icon={<IconLayers size="20" />}
        label="Warehouse locations"
        value={metrics.warehouseLocations}
      />
      <Divider />
      <MetricItem
        icon={<IconCheck size="20" />}
        label="Active addresses"
        value={metrics.active}
      />
      <Divider />
      <MetricItem
        icon={<IconAlertCircle size="20" />}
        label="Inactive addresses"
        value={metrics.inactive}
      />
      <Divider />
      <MetricItem
        icon={<IconCreditCard size="20" />}
        label="Prepaid addresses"
        value={metrics.prepaid}
      />
    </section>
  );
}
