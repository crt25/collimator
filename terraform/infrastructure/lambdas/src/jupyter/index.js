const path = require("path");

exports.handler = (evt, ctx, cb) => {
  const { request } = evt.Records[0].cf;

  // drop first part of the path (the spa name: `/jupyter`)
  const uri = request.uri.replace(/^\/[^/]+/, "");

  // If the URI doesn't have an extension, assume it's a page/directory and rewrite to index.html
  if (!path.extname(request.uri)) {
    request.uri = "/index.html";
  }

  cb(null, request);
};
