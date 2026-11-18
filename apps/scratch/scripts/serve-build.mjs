/**
 * Serves the production build of the Scratch app (../build) under /scratch,
 * the base path it is built for. The build consists of static files only.
 *
 * Used by the tests when SCRATCH_TEST_TARGET=build, see playwright.config.ts.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT ?? 3103);
const basePath = "/scratch";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "build",
);

if (!existsSync(path.join(root, "edit.html"))) {
  console.error(
    `The Scratch app is not built (${root} has no edit.html). Run 'yarn build' first.`,
  );
  process.exit(1);
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

const isFile = (file) => existsSync(file) && statSync(file).isFile();

const resolveFile = (urlPath) => {
  if (!urlPath.startsWith(`${basePath}/`)) {
    return null;
  }

  const file = path.join(
    root,
    decodeURIComponent(urlPath.slice(basePath.length)),
  );

  // do not serve anything outside of the build
  if (!file.startsWith(root + path.sep)) {
    return null;
  }

  if (isFile(file)) {
    return file;
  }

  // pages are exported as <name>.html and requested without the extension
  return isFile(`${file}.html`) ? `${file}.html` : null;
};

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  const file = resolveFile(pathname);

  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type":
      contentTypes[path.extname(file).toLowerCase()] ??
      "application/octet-stream",
    "Content-Length": statSync(file).size,
    // the files only change when the app is re-built
    "Cache-Control": "no-cache",
  });
  createReadStream(file).pipe(response);
});

server.listen(port, () => {
  console.log(
    `Serving the Scratch app from '${root}' on http://localhost:${port}${basePath}/edit`,
  );
});
