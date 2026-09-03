import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Every environment-dependent value the server reads is resolved here, once,
 * so the rest of the codebase never touches `process.env` directly. Adding a
 * new setting means adding it here and nowhere else.
 */
export const config = {
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT || 5173),

  // Repo root — the Vite project root in dev, and where `dist/` lands in prod.
  rootDir: path.resolve(serverDir, "..", ".."),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models"
  },

  osm: {
    // Nominatim's usage policy requires an identifying User-Agent.
    userAgent:
      process.env.OSM_USER_AGENT || "WanderlyAITripPlanner/1.0 (local development)",
    nominatimUrl: "https://nominatim.openstreetmap.org/search",
    overpassUrl: "https://overpass-api.de/api/interpreter",
    // Metres around the destination to search for places.
    nearbyRadius: 5000
  },

  requestBodyLimit: "1mb"
};
