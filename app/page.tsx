/**
 * Application root — server component entry point.
 * Pre-fetches address data and metrics concurrently so both are available
 * before the first render; passes allAddresses to the client container
 * as a prop to keep filtering logic client-side without an additional API call.
 */

import type { JSX } from "react";

import NavigationSidebar from "@/src/components/NavigationSidebar";
import PageHeader from "@/src/components/PageHeader";
import MetricsRow from "@/src/components/MetricsRow";
import AddressSearchContainer from "@/src/components/AddressSearchContainer";

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
          <PageHeader
            title="Address Book"
            subtitle="Manage warehouse addresses, vendors, carriers, and payment policies."
          />
          <MetricsRow metrics={metrics} />
          <AddressSearchContainer allAddresses={allAddresses} />
        </main>
      </div>
    </div>
  );
}
