const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../../../../../libraries/iframe-rpc');
const linkPath = path.resolve(__dirname, '../src/iframe-rpc');

// Create symbolic link
fs.symlink(target, linkPath, "dir", (err) => {
  if (err) {
    console.error('Error creating symlink:', err);
  } else {
    console.log(`Symlink created: ${linkPath} -> ${target}`);
  }
});
