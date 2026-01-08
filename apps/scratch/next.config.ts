import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import type { NextConfig } from "next";
import type { Configuration, RuleSetRule } from "webpack";

const resolvePath = (relativePath: string): string =>
  path.resolve(import.meta.dirname, relativePath);

const nextConfig: NextConfig = {
  basePath: "/scratch",
  output: "export", // Outputs a Single-Page Application (SPA)
  distDir: "build", // Changes the build output directory to `build`
  transpilePackages: ["scratch-paint", "iframe-rpc", "iframe-rpc-react"],

  webpack(webpackConfig: Configuration, { webpack }) {
    if (webpackConfig.resolve == null) {
      webpackConfig.resolve = {};
    }

    // Add custom alias
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      "@scratch-submodule": resolvePath("src/scratch-editor"),
    };

    webpackConfig.resolve.symlinks = false;

    // https://github.com/scratchfoundation/scratch-editor/blob/v11.6.0-react-18/packages/scratch-gui/webpack.config.js#L44-L47
    webpackConfig.resolve.fallback = {
      // provide web-compatible fallbacks for node modules
      ...webpackConfig.resolve.fallback,
      // The '/' is important, see https://www.npmjs.com/package/buffer#usage
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
    };

    if (webpackConfig.module == null) {
      webpackConfig.module = { rules: [] };
    }

    if (!Array.isArray(webpackConfig.module.rules)) {
      webpackConfig.module.rules = [];
    }

    // Excluding scratch-paint from next-swc-loader
    webpackConfig.module.rules.forEach((rule) => {
      if (
        typeof rule === "object" &&
        rule !== null &&
        "oneOf" in rule &&
        rule.oneOf !== undefined
      ) {
        rule.oneOf.forEach((one) => {
          if (
            typeof one === "object" &&
            one !== null &&
            one.use &&
            typeof one.use === "object" &&
            "loader" in one.use &&
            one.use.loader &&
            one.use.loader.includes("next-swc-loader")
          ) {
            let existingExclude: typeof one.exclude = undefined;

            if (one.exclude !== undefined) {
              existingExclude = Array.isArray(one.exclude)
                ? one.exclude
                : [one.exclude];
            }
            one.exclude = [...(existingExclude ?? []), /scratch-paint\/dist/];
          }
        });
      }
    });

    const isNoGlobalCssErrorLoader = (
      rule: Exclude<
        Exclude<Configuration["module"], undefined>["rules"],
        undefined
      >[number],
    ): rule is RuleSetRule & {
      use: { options: { reason: string } };
    } =>
      typeof rule === "object" &&
      rule !== null &&
      "use" in rule &&
      typeof rule.use === "object" &&
      "options" in rule.use &&
      typeof rule.use.options === "object" &&
      rule.use.options !== null &&
      "reason" in rule.use.options &&
      typeof rule.use.options.reason === "string" &&
      rule.use.options.reason.includes("Please move global styles");

    const cssRules = webpackConfig.module.rules.find(
      (rule): rule is RuleSetRule =>
        typeof rule === "object" &&
        rule !== null &&
        "oneOf" in rule &&
        rule.oneOf !== undefined &&
        rule.oneOf.findIndex(isNoGlobalCssErrorLoader) >= 0,
    );
    if (cssRules === undefined || cssRules.oneOf === undefined) {
      throw new Error("Could not find NextJS CSS rule to overwrite.");
    }

    const noGlobalCssErrorLoaderIdx = cssRules.oneOf.findIndex(
      isNoGlobalCssErrorLoader,
    );

    if (noGlobalCssErrorLoaderIdx < 0) {
      throw new Error("Could not find NextJS CSS no-global-css error loader.");
    }

    // Replace the existing CSS rule with our custom rules
    // to support non .module.css CSS modules.
    // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L186-L238
    cssRules.oneOf.splice(
      noGlobalCssErrorLoaderIdx,
      1,
      {
        // Default CSS modules rule.
        test: /^(?!.*\.global\.css$).*\.css$/,
        exclude: [],
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: false,
                localIdentName: "[name]_[local]_[hash:base64:5]",
                exportLocalsConvention: "camelCase",
              },
              importLoaders: 1,
              esModule: false,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  "postcss-import",
                  "postcss-simple-vars",
                  "autoprefixer",
                ],
              },
            },
          },
        ],
      },
      {
        test: [],
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  "postcss-import",
                  "postcss-simple-vars",
                  "autoprefixer",
                ],
              },
            },
          },
        ],
      },
    );

    // https://github.com/scratchfoundation/scratch-editor/blob/v11.6.0-react-18/packages/scratch-gui/webpack.config.js#L50-L54
    webpackConfig.module.rules.push({
      test: /\.(svg|png|wav|mp3|gif|jpg)$/,
      resourceQuery: /^$/, // reject any query string
      type: "asset", // let webpack decide on the best type of asset
    });

    webpackConfig.module.rules.push({
      // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L138-L144
      resourceQuery: "?asset",
      type: "asset",
    });

    webpackConfig.module.rules.push({
      // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L145-L151
      // Output is saved with the default asset module filename.
      resourceQuery: /^\?(resource|file)$/,
      type: "asset/resource",
    });

    webpackConfig.module.rules.push({
      // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L152-L158
      // Because the file is inlined, there is no filename.
      resourceQuery: /^\?(inline|url)$/,
      type: "asset/inline",
    });

    webpackConfig.module.rules.push({
      // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L159-L169
      resourceQuery: /^\?(source|raw)$/,
      type: "asset/source",
      generator: {
        // This filename seems unused, but if it ever gets used,
        // its extension should not match the asset's extension.
        filename: "assets/[name].[hash][ext][query].js",
      },
    });

    webpackConfig.module.rules.push({
      // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L170-L174
      resourceQuery: "?arrayBuffer",
      type: "javascript/auto",
      use: "arraybuffer-loader",
    });

    webpackConfig.module.rules.push({
      // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L176-L182
      test: /\.hex$/,
      type: "asset/resource",
    });

    if (webpackConfig.plugins == null) {
      webpackConfig.plugins = [];
    }

    webpackConfig.plugins.push(
      // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L248-L250
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    );

    webpackConfig.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/scratch-blocks/media",
            to: resolvePath("public/static/blocks-media/default"),
          },
          {
            from: "node_modules/scratch-blocks/media",
            to: resolvePath("public/static/blocks-media/high-contrast"),
          },
          {
            // overwrite some of the default block media with high-contrast versions
            // this entry must come after copying scratch-blocks/media into the high-contrast directory
            from: "src/scratch-editor/packages/scratch-gui/src/lib/themes/high-contrast/blocks-media",
            to: resolvePath("public/static/blocks-media/high-contrast"),
            force: true,
          },
          {
            context: "node_modules/@scratch/scratch-vm/dist/web",
            from: "extension-worker.{js,js.map}",
            to: resolvePath("public/"),
            noErrorOnMissing: true,
          },
          {
            context: "node_modules/scratch-storage/dist/web",
            from: "chunks/fetch-worker.*.{js,js.map}",
            to: resolvePath("public/"),
            noErrorOnMissing: true,
          },
          {
            context: "node_modules/scratch-storage/dist/web",
            from: "chunks/vendors-*.{js,js.map}",
            to: resolvePath("public/"),
            noErrorOnMissing: true,
          },
        ],
      }),
    );

    return webpackConfig;
  },
};

export default nextConfig;
