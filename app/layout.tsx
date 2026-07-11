import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ControlP",
  description: "Project command OS for Obsidian, Git and Graphify.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
