import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spatial Horizon — Market Map: Space to Seabed",
  description:
    "Interactive market map of companies generating and analyzing spatial data across the full vertical — from satellites in orbit to sensors on the ocean floor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
