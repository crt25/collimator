const path = require('path');

module.exports = {
  extends: [
    path.join(__dirname, '../.eslintrc.js'),
    "next/core-web-vitals",
    "next/typescript",
    "plugin:prettier/recommended"
  ],
};