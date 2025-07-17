/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: false, // Garante que a otimização está habilitada
  },
  env: {
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;
