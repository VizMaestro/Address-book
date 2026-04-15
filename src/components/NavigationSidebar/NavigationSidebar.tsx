/**
 * Vertical navigation sidebar — Figma node 1:13210 "Navigation".
 * iconMap is defined in this file (not in src/data/) because it maps icon names
 * to JSX elements, which cannot be expressed in a plain data module.
 */
"use client";

import type { JSX } from "react";

import { Avatar, Navigation } from "@sds/ui/primitives";
import {
  IconBookOpen,
  IconBox,
  IconBriefcase,
  IconChevronRight,
  IconLogOut,
  IconSettings,
  IconShoppingCart,
  IconTruck,
} from "@sds/ui/icons";

import type { NavItemConfig } from "@/src/data/navItems";
import { navItems } from "@/src/data/navItems";

import styles from "./NavigationSidebar.module.css";

const NAV_ICON_SIZE = "20" as const;

const iconMap: Record<NavItemConfig["iconName"], JSX.Element> = {
  truck: <IconTruck size={NAV_ICON_SIZE} />,
  box: <IconBox size={NAV_ICON_SIZE} />,
  shoppingCart: <IconShoppingCart size={NAV_ICON_SIZE} />,
  bookOpen: <IconBookOpen size={NAV_ICON_SIZE} />,
  settings: <IconSettings size={NAV_ICON_SIZE} />,
};

function NavLabel({ label, twoLine }: { label: string; twoLine?: boolean }): JSX.Element {
  if (!twoLine) {
    return <span className={styles.navLabel}>{label}</span>;
  }
  const lines = label.split("\n");
  return (
    <span className={styles.navLabel}>
      {lines.map((line, i) => (
        <span key={line}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}

export default function NavigationSidebar(): JSX.Element {
  return (
    <Navigation direction="column" className={styles.sidebar}>
      <div className={styles.topGroup}>
        <div className={styles.logoIcon}>
          <IconBriefcase size="24" />
        </div>
        <span className={styles.logoLabel}>WMS</span>

        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li
              key={item.id}
              className={
                item.active
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
            >
              <span className={styles.navIcon}>{iconMap[item.iconName]}</span>
              <NavLabel label={item.label} twoLine={item.twoLine} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.userArea}>
        <div className={styles.userAreaInner}>
          <Avatar size="large" initials="JD" alt="Jane Doe" />
          <span className={styles.userActionIcon}>
            <IconLogOut size="20" />
          </span>
          <span className={styles.chevronIcon}>
            <IconChevronRight size="24" />
          </span>
        </div>
      </div>
    </Navigation>
  );
}
