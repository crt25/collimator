const path = require("path");

const dynamicRoutesPattern = /\/([A-z]+)\/\d+/g;
const dynamicRoutesReplacement = "/$1/[$1Id]";

exports.handler = (evt, ctx, cb) => {
  const { request } = evt.Records[0].cf;
  
  // ensure /class/123 is rewritten to /class/[classId]
  const uri = request.uri.replace(dynamicRoutesPattern, dynamicRoutesReplacement);

  if (uri === "/") {
    request.uri = "/index.html";
  } else if (!path.extname(request.uri)) {
    // If URI doesn't have an extension, assume it's a page and add .html
    request.uri = `${uri}.html`;
  }

  cb(null, request);
};
