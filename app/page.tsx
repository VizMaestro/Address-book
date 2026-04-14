import type { JSX } from "react";

import NavigationSidebar from "@/src/components/NavigationSidebar";
import PageHeader from "@/src/components/PageHeader";
import MetricsRow from "@/src/components/MetricsRow";
import AddressSearch from "@/src/components/AddressSearch";
import MapContainer from "@/src/components/MapContainer";

import { fetchMetrics } from "@/src/services/addressService";

import styles from "./AddressBookPage.module.css";

export default async function AddressBookPage(): Promise<JSX.Element> {
  const metrics = await fetchMetrics();

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
          <AddressSearch />
          <MapContainer />
        </main>
      </div>
    </div>
  );
}
