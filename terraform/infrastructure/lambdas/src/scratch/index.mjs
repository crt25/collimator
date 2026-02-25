import path from 'path';

const dynamicRoutesPattern = /\/([A-Za-z]+)\/\d+(?=\/)/g;
const dynamicRoutesReplacement = '/$1/[$1Id]';

export const handler = async (evt) => {
  const request = evt.Records[0].cf.request;

  const uri = request.uri
    // drop first part of the path (the spa name: `/scratch`)
    .replace(/^\/[^/]+/, '')
    // ensure /class/123 is rewritten to /class/[classId]
    .replace(dynamicRoutesPattern, dynamicRoutesReplacement);

  if (uri === '/') {
    request.uri = '/index.html';
  } else if (!path.extname(uri)) {
    request.uri = `${uri}.html`;
  } else {
    request.uri = uri;
  }

  return request;
};
