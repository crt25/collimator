/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  distDir: "build",

  reactStrictMode: true,

  eslint: {
    // ignore ESLint during compilation - we check it on the CI
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
