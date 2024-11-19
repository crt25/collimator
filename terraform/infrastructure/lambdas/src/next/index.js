const path = require("path");

exports.handler = (evt, ctx, cb) => {
  const { request } = evt.Records[0].cf;
  const uri = request.uri;

  if (uri === "/") {
    request.uri = "/index.html";
  } else if (!path.extname(request.uri)) {
    // If URI doesn't have an extension, assume it's a page and add .html
    request.uri = `${uri}.html`;
  }

  cb(null, request);
};
