import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "storybook/actions",
    "storybook/highlight",
    "storybook/viewport",
    // Add back when it supports storybook 10 (required for Next.js v16)
    // "storybook-addon-mock",
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (config, { configType }) => {
    // Customize the Vite config here
    return {
      ...config,
      optimizeDeps: {
        include: [
          /*"../backend",
          "iframe-rpc",
          "iframe-rpc-react",*/
        ],
      }
    };
  },
};
export default config;
