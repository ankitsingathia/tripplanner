import { config } from "../config/index.js";

/**
 * GET /api/health
 *
 * Reports which providers are wired up. `geminiConfigured` is deliberately a
 * boolean, never the key itself.
 */
export function health(_req, res) {
  res.json({
    ok: true,
    geminiConfigured: Boolean(config.gemini.apiKey),
    mapProvider: "OpenStreetMap",
    searchProvider: "Nominatim",
    nearbyProvider: "Overpass"
  });
}
