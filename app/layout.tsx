import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ControlP",
  description: "Project command OS for Obsidian, Git and Graphify.",
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning: extensiones del navegador (p. ej. Chrome
  // Remote Desktop) inyectan atributos en <html> antes de hidratar.
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
