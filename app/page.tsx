/**
 * Application root — server component entry point.
 * Pre-fetches address data and metrics concurrently so both are available
 * before the first render; hands them to DashboardClient which owns all
 * interactive state (add/edit address, search results).
 */

import type { JSX } from "react";

import NavigationSidebar from "@/src/components/NavigationSidebar";
import DashboardClient from "@/src/components/DashboardClient";

import { fetchAddresses, fetchMetrics } from "@/src/services/addressService";

import styles from "./AddressBookPage.module.css";

export default async function AddressBookPage(): Promise<JSX.Element> {
  const [metrics, allAddresses] = await Promise.all([
    fetchMetrics(),
    fetchAddresses(),
  ]);

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <NavigationSidebar />
        <main className={styles.main}>
          <DashboardClient initialAddresses={allAddresses} metrics={metrics} />
        </main>
      </div>
    </div>
  );
}
