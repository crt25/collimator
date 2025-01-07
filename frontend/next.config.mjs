/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  distDir: "dist",
  productionBrowserSourceMaps: true,

  reactStrictMode: true,

  transpilePackages: ["../backend"],

  eslint: {
    // ignore ESLint during compilation - we check it on the CI
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
