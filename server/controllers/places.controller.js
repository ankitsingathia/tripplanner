import { badGateway } from "../lib/http-error.js";
import { searchPlaces, findNearby, toSuggestion } from "../services/osm.service.js";

/** GET /api/search?input= — destination autocomplete. */
export async function search(req, res, next) {
  const input = String(req.query.input || "").trim();

  // Too short to be worth a round trip to Nominatim.
  if (!input || input.length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    const results = await searchPlaces(input, 7);
    res.json({ suggestions: results.map(toSuggestion) });
  } catch (error) {
    next(badGateway(error.message || "Search failed"));
  }
}

/** GET /api/nearby?lat=&lon= — places around a coordinate. */
export async function nearby(req, res, next) {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ message: "lat and lon are required." });
  }

  try {
    res.json({ nearby: await findNearby(lat, lon) });
  } catch (error) {
    next(badGateway(error.message || "Nearby lookup failed"));
  }
}
