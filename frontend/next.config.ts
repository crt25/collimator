import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";

let nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  productionBrowserSourceMaps: true,

  reactStrictMode: true,

  transpilePackages: ["../backend", "iframe-rpc", "iframe-rpc-react"],

  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },

  sassOptions: {
    // ignore deprecation warning from sass because of bootstrap
    // https://sass-lang.com/documentation/breaking-changes/import/
    quietDeps: true,
  },

  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

if (!process.env.BABEL_ENV || process.env.BABEL_ENV !== "coverage") {
  // it seems that sentry and babel are not compatible but fortunately we need
  // babel only for collecting coverage and sentry only for production (:

  nextConfig = withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: "hep-vaud",
    project: "crt-frontend",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: false,
  });
}

export default nextConfig;
