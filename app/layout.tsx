import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AntSim - Ant Colony Simulation",
  description: "Interactive ant colony simulation demonstrating swarm intelligence and emergent behavior",
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
