import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "storybook-react-intl",
    "@storybook/addon-coverage",
    "storybook-addon-mock",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    // Add the packages you want to transpile here
    const transpileModules = [
      "../backend",
      "iframe-rpc",
      "iframe-rpc-react",
    ];

    const transpileRegex = new RegExp(
      `node_modules/(?!(${transpileModules.join("|")})/)`,
    );


    // Modify existing swc rule to include the selected node_modules
    (config?.module?.rules ?? []).forEach((rule) => {
      if (
        rule &&
        typeof rule === "object" &&
        "use" in rule &&
        typeof rule.use === "object" &&
        "loader" in rule.use &&
        rule.use.loader?.includes("swc")
      ) {
        rule.exclude = transpileRegex;
      }
    });

    return config;
  },
};
export default config;
