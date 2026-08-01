/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Por defecto Next.js limita los server actions a 1MB; las fotos
      // de la cámara del celular suelen superarlo (se comprimen antes de
      // subirse, pero esto queda como margen de seguridad).
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
