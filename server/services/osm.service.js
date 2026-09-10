import { config } from "../config/index.js";

/**
 * OpenStreetMap data access — Nominatim for geocoding, Overpass for what's
 * around a coordinate. Both are free, rate-limited, public endpoints, so both
 * calls are treated as things that can and will fail; callers decide whether a
 * failure is fatal or just means "no map context this time".
 */

export async function searchPlaces(query, limit = 6) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: String(limit)
  });

  const response = await fetch(`${config.osm.nominatimUrl}?${params}`, {
    headers: {
      "User-Agent": config.osm.userAgent,
      "Accept-Language": "en"
    },
    signal: AbortSignal.timeout(config.osm.nominatimTimeoutMs)
  });

  if (!response.ok) {
    throw new Error("Nominatim search failed");
  }

  return response.json();
}

// The trip creator asks for nearby places twice: once for the preview when a
// destination is picked, and again at submit whenever that preview came back
// empty. Without this, a failed preview meant the submit sat through a second
// slow Overpass call before Gemini was even called — measured at 8s on top of
// the generation itself. Caching the promise (not the result) also covers a
// submit that lands while the preview is still in flight.
const nearbyCache = new Map();
const NEARBY_HIT_TTL_MS = 10 * 60 * 1000;
// Short, so a flaky Overpass gets retried soon, but long enough to cover the
// gap between picking a destination and pressing generate.
const NEARBY_MISS_TTL_MS = 60 * 1000;
const NEARBY_CACHE_LIMIT = 500;

export function findNearby(lat, lon) {
  // ~110 m of rounding; the search radius is 5 km, so nearby picks share results.
  const key = `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
  const cached = nearbyCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.promise;

  if (nearbyCache.size >= NEARBY_CACHE_LIMIT) {
    // Maps iterate in insertion order, so this drops the oldest entry.
    nearbyCache.delete(nearbyCache.keys().next().value);
  }

  const promise = fetchNearby(lat, lon);
  nearbyCache.set(key, { promise, expires: Date.now() + NEARBY_HIT_TTL_MS });
  promise.catch(() => {
    nearbyCache.set(key, { promise, expires: Date.now() + NEARBY_MISS_TTL_MS });
  });

  return promise;
}

async function fetchNearby(lat, lon) {
  const radius = config.osm.nearbyRadius;
  // Keep Overpass's own query timeout in step with ours, so it stops working
  // on a query we've already given up on.
  const serverTimeout = Math.ceil(config.osm.overpassTimeoutMs / 1000);
  const query = `
    [out:json][timeout:${serverTimeout}];
    (
      node(around:${radius},${lat},${lon})["tourism"="attraction"];
      way(around:${radius},${lat},${lon})["tourism"="attraction"];
      node(around:${radius},${lat},${lon})["tourism"="hotel"];
      node(around:${radius},${lat},${lon})["amenity"~"restaurant|cafe"];
    );
    out center tags 60;
  `;

  const response = await fetch(config.osm.overpassUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": config.osm.userAgent
    },
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(config.osm.overpassTimeoutMs)
  });

  if (!response.ok) {
    throw new Error("Overpass nearby lookup failed");
  }

  const payload = await response.json();

  return (payload.elements || [])
    .map(toNearbyPlace)
    .filter((item) => item.name && item.lat && item.lon)
    .slice(0, 30);
}

/** Overpass elements are either nodes (lat/lon) or ways (center.lat/lon). */
function toNearbyPlace(item) {
  const tags = item.tags || {};

  return {
    id: `${item.type}-${item.id}`,
    name: tags.name || tags["name:en"],
    category: tags.amenity || tags.tourism || tags.leisure || tags.historic || "place",
    area: tags["addr:suburb"] || tags["addr:city"] || "",
    lat: item.lat ?? item.center?.lat,
    lon: item.lon ?? item.center?.lon
  };
}

/** Shapes a Nominatim result into the autocomplete suggestion the UI expects. */
export function toSuggestion(item) {
  const address = item.address || {};

  return {
    placeId: String(item.place_id),
    label: item.display_name,
    mainText:
      address.city ||
      address.town ||
      address.village ||
      address.state ||
      item.name ||
      item.display_name?.split(",")[0],
    secondaryText: [address.state, address.country].filter(Boolean).join(", "),
    lat: Number(item.lat),
    lon: Number(item.lon),
    type: item.type,
    category: item.category
  };
}
