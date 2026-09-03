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
    }
  });

  if (!response.ok) {
    throw new Error("Nominatim search failed");
  }

  return response.json();
}

export async function findNearby(lat, lon) {
  const radius = config.osm.nearbyRadius;
  const query = `
    [out:json][timeout:20];
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
    body: new URLSearchParams({ data: query })
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
