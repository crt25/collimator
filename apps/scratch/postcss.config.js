/* eslint-disable no-undef */
module.exports = {
  plugins: [
    "postcss-flexbugs-fixes",
    [
      "postcss-preset-env",
      {
        autoprefixer: {
          flexbox: "no-2009",
        },
        stage: 3,
        features: {
          "custom-properties": false,
        },
      },
    ],
    // https://github.com/scratchfoundation/scratch-webpack-configuration/blob/308ad647caaf8bae31224a7467c4642b7c32ce2f/src/index.cjs#L209-L212
    "postcss-import",
    "postcss-simple-vars",
    "autoprefixer",
  ],
};
