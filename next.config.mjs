/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite abrir el dev server desde la LAN (desktop y móvil).
  // Next 16 bloquea por defecto los assets de dev servidos a orígenes cruzados.
  allowedDevOrigins: ["192.168.1.76", "localhost", "127.0.0.1"],
};

export default nextConfig;
