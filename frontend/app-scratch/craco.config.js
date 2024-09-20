/* eslint-disable no-undef */
/* craco.config.js */
const path = require(`path`);
const webpack = require("webpack");
const cracoBabelLoader = require("craco-babel-loader");

// Plugins
const CopyWebpackPlugin = require("copy-webpack-plugin");

const ScratchWebpackConfigBuilder = require("scratch-webpack-configuration");

const baseConfig = new ScratchWebpackConfigBuilder({
  rootPath: path.resolve(__dirname),
  enableReact: true,
  shouldSplitChunks: false,
})
  .setTarget("browserslist")
  .merge({
    output: {
      assetModuleFilename: "static/assets/[name].[hash][ext][query]",
      library: {
        name: "GUI",
        type: "umd2",
      },
    },
    resolve: {
      fallback: {
        Buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
      },
    },
  })
  .addModuleRule({
    test: /\.(svg|png|wav|mp3|gif|jpg)$/,
    resourceQuery: /^$/, // reject any query string
    type: "asset", // let webpack decide on the best type of asset
  })
  .addPlugin(
    new webpack.DefinePlugin({
      "process.env.DEBUG": Boolean(process.env.DEBUG),
      "process.env.GA_ID": `"${process.env.GA_ID || "UA-000000-01"}"`,
      "process.env.GTM_ENV_AUTH": `"${process.env.GTM_ENV_AUTH || ""}"`,
      "process.env.GTM_ID": process.env.GTM_ID
        ? `"${process.env.GTM_ID}"`
        : null,
    }),
  )
  .addPlugin(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/scratch-blocks/media",
          to: "static/blocks-media/default",
        },
        {
          from: "node_modules/scratch-blocks/media",
          to: "static/blocks-media/high-contrast",
        },
        {
          // overwrite some of the default block media with high-contrast versions
          // this entry must come after copying scratch-blocks/media into the high-contrast directory
          from: "src/scratch/scratch-gui/src/lib/themes/high-contrast/blocks-media",
          to: "static/blocks-media/high-contrast",
          force: true,
        },
        {
          context: "node_modules/scratch-vm/dist/web",
          from: "extension-worker.{js,js.map}",
          noErrorOnMissing: true,
        },
      ],
    }),
  );

const config = baseConfig.get();

if (!process.env.CI) {
  baseConfig.addPlugin(new webpack.ProgressPlugin());
}

const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
  webpack: {
    ...config,
    alias: {
      "@scratch-submodule": resolvePath("src/scratch"),
    },
    // for craco this must be put here
    // https://stackoverflow.com/a/76150844/2897827
    configure: {
      // supress invalid source map warnings - some dependencies have invalid or inexistent source maps
      // https://stackoverflow.com/a/70975849/2897827
      // https://github.com/facebook/create-react-app/pull/11752
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
  plugins: [
    {
      plugin: cracoBabelLoader,
      options: {
        includes: [resolvePath("node_modules/scratch-paint")],
      },
    },
  ],
};
