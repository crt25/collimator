import path from 'path';

export const handler = async (evt) => {
  const request = evt.Records[0].cf.request;

  // drop first part of the path (the spa name: `/jupyter`)
  const uri = request.uri.replace(/^\/[^/]+/, '');

  if (uri === '/') {
    request.uri = '/index.html';
  } else if (!path.extname(uri)) {
    request.uri = `${uri}.html`;
  } else {
    request.uri = uri;
  }

  return request;
};
