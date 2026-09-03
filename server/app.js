import express from "express";

import { config } from "./config/index.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { mountFrontend } from "./middleware/static-assets.js";

/**
 * Assembles the Express app. Ordering matters here and nowhere else:
 * body parsing, then the API, then the frontend (its SPA fallback is a
 * catch-all), then the error handler last so it sees everything.
 *
 * Returns the app without listening, so tests can import it and drive it
 * without binding a port.
 */
export async function createApp() {
  const app = express();

  app.use(express.json({ limit: config.requestBodyLimit }));
  app.use("/api", apiRoutes);

  await mountFrontend(app);

  app.use(errorHandler);

  return app;
}
