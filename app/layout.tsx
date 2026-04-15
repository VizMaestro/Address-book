/**
 * Root HTML shell for the Next.js app.
 * Imports SDS reset, theme tokens, icon font, and responsive utilities globally
 * so every component in the tree inherits the design system foundation.
 * Font variables are registered here and consumed by the SDS typography tokens.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@sds/ui/reset.css";
import "@sds/ui/theme.css";
import "@sds/ui/icons.css";
import "@sds/ui/responsive.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Address Book — WMS",
  description: "Warehouse vendor address management",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
