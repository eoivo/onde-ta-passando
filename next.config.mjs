/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    API_KEY: process.env.API_KEY,
  },
  // Desativar o bailout do CSR/Suspense que está causando o erro
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
