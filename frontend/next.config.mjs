/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
  },

  eslint: {
    // ignore ESLint during compilation - we check it on the CI
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
