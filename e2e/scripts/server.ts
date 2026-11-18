import path from "path";
import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { CrtApp, getAppPath, getFrontendPath } from "../setup/helpers";

const dynamicRoutesPattern = /\/([A-z]+)\/\d+/g;
const dynamicRoutesReplacement = "/$1/[$1Id]";

const app = express();

const staticDir = path.join(getFrontendPath(), "dist");
const scratchAppDir = path.join(getAppPath(CrtApp.scratch), "build");
const jupyterAppDir = path.join(getAppPath(CrtApp.jupyter), "dist", "app");

app.use("/scratch", (request, response, next) => {
  let [urlPath, search] = request.url.split("?");

  urlPath = urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath;
  search = search ? `?${search}` : "";

  if (urlPath === "/" || urlPath === "") {
    request.url = `/index.html${search}`;
  } else if (!path.extname(urlPath)) {
    // If URI doesn't have an extension, assume it's a page and add .html
    request.url = `${urlPath}.html${search}`;
  }

  next();
});

app.use("/scratch", express.static(scratchAppDir));

app.use("/jupyter", (request, response, next) => {
  let [urlPath, search] = request.url.split("?");

  urlPath = urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath;
  search = search ? `?${search}` : "";

  if (urlPath === "/" || urlPath === "") {
    request.url = `index.html${search}`;
  } else if (urlPath === "/lab") {
    request.url = `/lab/index.html${search}`;
  } else if (!path.extname(urlPath)) {
    request.url = `${urlPath}.html${search}`;
  } else {
    request.url = `${urlPath}${search}`;
  }

  next();
});

app.use("/jupyter", express.static(jupyterAppDir));

console.log(
  `Serving Scratch app from '${scratchAppDir}' on http://localhost:${process.env.PORT ?? 9999}/scratch`,
);
console.log(
  `Serving Jupyter app from '${jupyterAppDir}' on http://localhost:${process.env.PORT ?? 9999}/jupyter`,
);
app.use(
  "/api",
  createProxyMiddleware<Request, Response>({
    target: `${process.env.BACKEND_URL ?? "https://localhost:3001"}/api`,
    changeOrigin: true,
  }),
);

const frontendDevUrl = process.env.FRONTEND_DEV_URL;

if (!frontendDevUrl) {
  app.use(
    "/socket.io",
    createProxyMiddleware<Request, Response>({
      target: `${process.env.BACKEND_URL ?? "https://localhost:3001"}/socket.io`,
      changeOrigin: true,
      ws: true,
    }),
  );
} else {
  // Frontend mode "dev": forward everything that is not served here to the
  // Next.js dev server, which resolves dynamic routes itself.
  console.log(`Forwarding frontend requests to ${frontendDevUrl}`);

  const isServedHere = (urlPath: string): boolean =>
    ["/socket.io", "/api", "/scratch", "/jupyter"].some(
      (prefix) => urlPath === prefix || urlPath.startsWith(`${prefix}/`),
    );

  // Filter by path instead of mounting on a path: the filter also applies to
  // websocket upgrades, a mount path does not. Without it this proxy would
  // also grab the dev server's hot-reload websocket.
  app.use(
    createProxyMiddleware<Request, Response>({
      target: process.env.BACKEND_URL ?? "https://localhost:3001",
      pathFilter: "/socket.io",
      changeOrigin: true,
      ws: true,
    }),
  );

  app.use(
    createProxyMiddleware<Request, Response>({
      target: frontendDevUrl,
      pathFilter: (urlPath) => !isServedHere(urlPath),
      changeOrigin: true,
      ws: true,
    }),
  );
}

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

server.on("error", (err) => {
  console.error("Server error:", err);
});
