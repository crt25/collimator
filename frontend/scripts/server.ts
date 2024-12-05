import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dynamicRoutesPattern = /\/([A-z]+)\/\d+/g;
const dynamicRoutesReplacement = "/$1/[$1Id]";

const app = express();

const staticDir = path.join(__dirname, "..", "dist");

app.use(
  "/api",
  createProxyMiddleware<Request, Response>({
    target: `${process.env.BACKEND_URL ?? "https://localhost:3001"}/api`,
    changeOrigin: true,
  }),
);

app.use(
  "/socket.io",
  createProxyMiddleware<Request, Response>({
    target: `${process.env.BACKEND_URL ?? "https://localhost:3001"}/socket.io`,
    changeOrigin: true,
    ws: true,
  }),
);

app.use((request, response, next) => {
  let [urlPath, search] = request.url.split("?");

  urlPath = urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath;

  // ensure /class/123 is rewritten to /class/[classId]
  urlPath = urlPath.replace(dynamicRoutesPattern, dynamicRoutesReplacement);
  search = search ? `?${search}` : "";

  if (urlPath === "/" || urlPath === "") {
    request.url = `/index.html${search}`;
  } else if (!path.extname(urlPath)) {
    // If URI doesn't have an extension, assume it's a page and add .html
    request.url = `${urlPath}.html${search}`;
  }

  next();
});

app.use(express.static(staticDir));

const server = app.listen(process.env.PORT ?? 9999, () => {
  const address = server.address();

  if (!address || typeof address !== "object") {
    throw new Error("Failed to start");
  }

  console.log(
    `Serving frontend from '${staticDir}' on http://localhost:${address.port}`,
  );
});
