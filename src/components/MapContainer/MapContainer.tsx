import type { JSX } from "react";

import Image from "next/image";

import styles from "./MapContainer.module.css";

export default function MapContainer(): JSX.Element {
  return (
    <section className={styles.mapContainer}>
      <Image
        src="/illustration-warehouse.png"
        alt="Warehouse staff illustration"
        width={390}
        height={234}
        className={styles.illustration}
        priority
        unoptimized
      />
      <div className={styles.textGroup}>
        <p className={styles.emptyHeading}>Search to find the address</p>
        <p className={styles.emptyBody}>
          Use the text entry sections above to search for an address
        </p>
      </div>
    </section>
  );
}
