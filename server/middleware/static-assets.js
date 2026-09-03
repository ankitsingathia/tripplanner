import path from "node:path";
import express from "express";

import { config } from "../config/index.js";

/**
 * Serves the frontend.
 *
 * In production that's the built `dist/` plus an SPA fallback so client-side
 * routes resolve on a hard refresh. In development Vite's own middleware
 * handles it, which is what gives HMR — one server on one port either way, so
 * there's no CORS or proxy config to keep in sync.
 */
export async function mountFrontend(app) {
  if (config.isProduction) {
    const distDir = path.join(config.rootDir, "dist");

    app.use(express.static(distDir));
    app.use((req, res, next) => {
      // API 404s should stay 404s, not fall through to index.html.
      if (req.method !== "GET" || req.path.startsWith("/api/")) {
        return next();
      }

      res.sendFile(path.join(distDir, "index.html"));
    });

    return;
  }

  const { createServer } = await import("vite");
  const vite = await createServer({
    root: config.rootDir,
    server: { middlewareMode: true },
    appType: "spa"
  });

  app.use(vite.middlewares);
}
