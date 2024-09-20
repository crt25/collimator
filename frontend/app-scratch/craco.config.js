/* eslint-disable no-undef */
/* craco.config.js */
const path = require(`path`);
const webpack = require(`webpack`);

// craco plugins
const cracoBabelLoader = require("craco-babel-loader");
const cracoCSSModules = require("craco-css-modules");

// webpack plugins
const CopyWebpackPlugin = require("copy-webpack-plugin");

const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
  // see https://craco.js.org/docs/configuration/webpack/
  webpack: {
    alias: {
      "@scratch-submodule": resolvePath("src/scratch"),
    },
    // webpack plugins
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "node_modules/scratch-blocks/media",
              to: "src/scratch/scratch-gui/static/blocks-media/default",
            },
            {
              from: "node_modules/scratch-blocks/media",
              to: "src/scratch/scratch-gui/static/blocks-media/high-contrast",
            },
            {
              // overwrite some of the default block media with high-contrast versions
              // this entry must come after copying scratch-blocks/media into the high-contrast directory
              from: "src/scratch/scratch-gui/src/lib/themes/high-contrast/blocks-media",
              to: "src/scratch/scratch-gui/static/blocks-media/high-contrast",
              force: true,
            },
            {
              context: "node_modules/scratch-vm/dist/web",
              from: "extension-worker.{js,js.map}",
              noErrorOnMissing: true,
            },
          ],
        }),
      ],
      remove: [],
    },
    /*style: {
      css: {
        loaderOptions: {
          modules: {
            auto: true,
            exportLocalsConvention: function (name) {
              console.log("name", name);
              return "test123";
            },
          },
        },
      },
    },*/
    // https://craco.js.org/docs/configuration/getting-started/#object-literals-and-functions
    configure: (webpackConfig) => {
      // supress invalid source map warnings - some dependencies have invalid or inexistent source maps
      // https://stackoverflow.com/a/70975849/2897827
      // https://github.com/facebook/create-react-app/pull/11752
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      webpackConfig.resolve.fallback = {
        // provide web-compatible fallbacks for node modules, re
        ...webpackConfig.resolve.fallback,
        // The '/' is important, see https://www.npmjs.com/package/buffer#usage
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
      };

      // kebab-case to camelCase for CSS class names in CSS modules - this is required by scratch

      // copied and adapted from https://stackoverflow.com/a/74149013/2897827

      webpackConfig.module.rules
        .find(({ oneOf }) => !!oneOf)
        .oneOf.filter(({ use }) => JSON.stringify(use)?.includes("css-loader"))
        .reduce((acc, { use }) => acc.concat(use), [])
        .filter(
          (use) =>
            typeof use === "object" &&
            use.loader &&
            use.loader.includes("css-loader"),
        )
        .forEach(({ options }) => {
          if (options.modules) {
            // following the scratch config at https://github.com/scratchfoundation/scratch-webpack-configuration/blob/06b35c21a82ff29a596bd7a4c233731a00d3d49e/src/index.cjs#L173
            options.modules.exportLocalsConvention = "camelCase";

            // enable CSS modules for all files, see https://webpack.js.org/loaders/css-loader/#auto
            options.modules.auto = undefined;
          }
        });

      return webpackConfig;
    },
  },
  // craco plugins
  plugins: [
    {
      plugin: cracoBabelLoader,
      options: {
        includes: [resolvePath("node_modules/scratch-paint")],
      },
    },
    { plugin: cracoCSSModules },
  ],
};
