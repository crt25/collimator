/**
 * Serves the built JupyterLite app (../dist/app) under /jupyter/, the base URL
 * it is built for. The app consists of static files only, so the tests need
 * neither a backend nor the platform frontend.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT ?? 3102);
const basePath = "/jupyter";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "dist",
  "app",
);

if (!existsSync(path.join(root, "lab", "index.html"))) {
  console.error(
    `The Jupyter app is not built (${root} has no lab/index.html). Run 'task build' in apps/jupyter first.`,
  );
  process.exit(1);
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ipynb": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".wasm": "application/wasm",
  ".whl": "application/octet-stream",
  ".zip": "application/zip",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
};

const resolveFile = (urlPath) => {
  if (urlPath !== basePath && !urlPath.startsWith(`${basePath}/`)) {
    return null;
  }

  const relative = decodeURIComponent(urlPath.slice(basePath.length));
  const file = path.join(root, relative);

  // do not serve anything outside of the app
  if (file !== root && !file.startsWith(root + path.sep)) {
    return null;
  }

  if (existsSync(file) && statSync(file).isDirectory()) {
    return path.join(file, "index.html");
  }

  return file;
};

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  const file = resolveFile(pathname);

  if (!file || !existsSync(file) || !statSync(file).isFile()) {
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
    `Serving the Jupyter app from '${root}' on http://localhost:${port}${basePath}/lab/index.html`,
  );
});
