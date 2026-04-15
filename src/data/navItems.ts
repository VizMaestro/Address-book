/**
 * Static navigation item configuration for the sidebar.
 * The `active` flag marks the current page; update it when routing is added.
 */

export interface NavItemConfig {
  id: string;
  iconName: "truck" | "box" | "shoppingCart" | "bookOpen" | "settings";
  label: string;
  active?: boolean;
  twoLine?: boolean;
}

export const navItems: NavItemConfig[] = [
  { id: "load-mgmt", iconName: "truck", label: "Load\nMgmt", twoLine: true },
  { id: "backlog", iconName: "box", label: "Backlog" },
  { id: "order-picking", iconName: "shoppingCart", label: "Order\nPicking", twoLine: true },
  { id: "address-book", iconName: "bookOpen", label: "Address\nBook", active: true, twoLine: true },
  { id: "settings", iconName: "settings", label: "Settings" },
];
