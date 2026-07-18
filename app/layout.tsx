import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const imageUrl = `${basePath}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Deployment Core · U.S. Nuclear Tracker",
    template: "%s · Deployment Core",
  },
  description: "Source-backed tracking of U.S. nuclear projects, companies, federal actions, capital, licensing, construction, criticality, and next milestones.",
  openGraph: {
    title: "Deployment Core · U.S. Nuclear Tracker",
    description: "From interest to repeat deployment: see who is building, what moved, and what comes next.",
    type: "website",
    images: [{ url: imageUrl, width: 1735, height: 907, alt: "Deployment Core — From interest to repeat deployment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deployment Core · U.S. Nuclear Tracker",
    description: "From interest to repeat deployment: see who is building, what moved, and what comes next.",
    images: [imageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
