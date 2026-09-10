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
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    // Tokens the model may spend reasoning before it starts answering.
    // Gemini 2.5 Flash does this by default, which adds wait time to every
    // itinerary; 0 turns it off. Only sent to 2.5 Flash models — see
    // thinkingConfigFor() in gemini.service.js.
    thinkingBudget: Number(process.env.GEMINI_THINKING_BUDGET ?? 0)
  },

  osm: {
    // Nominatim's usage policy requires an identifying User-Agent.
    userAgent:
      process.env.OSM_USER_AGENT || "WanderlyAITripPlanner/1.0 (local development)",
    nominatimUrl: "https://nominatim.openstreetmap.org/search",
    overpassUrl: "https://overpass-api.de/api/interpreter",
    // Metres around the destination to search for places.
    nearbyRadius: 5000,
    // Upper bound on each OpenStreetMap call. Overpass especially is slow and
    // flaky — measured at 3.9s when it answers and 11-13s before a 504 when it
    // doesn't — and trip generation waits on it before Gemini is even called.
    // Both lookups are best-effort, so giving up early means a less grounded
    // itinerary, not a failed one.
    nominatimTimeoutMs: 5000,
    overpassTimeoutMs: 8000
  },

  requestBodyLimit: "1mb"
};
