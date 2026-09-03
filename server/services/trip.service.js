import { badRequest } from "../lib/http-error.js";
import { generateTrip as generateWithGemini } from "./gemini.service.js";
import { searchPlaces, findNearby } from "./osm.service.js";

/**
 * Orchestrates trip creation: geocode the destination if the client didn't
 * already, pull nearby places to ground the model in real locations, then
 * generate.
 *
 * Both map lookups are best-effort. If Nominatim or Overpass is down or
 * rate-limiting us, the trip is still generated from the model's own knowledge
 * rather than failing the whole request — degraded, not broken.
 */
export async function createTrip(input) {
  const request = { ...(input || {}) };

  if (!request.destination || !request.durationDays || !request.budget) {
    throw badRequest("Destination, duration, and budget are required.");
  }

  if (!request.destinationCoords) {
    request.destinationCoords = await resolveCoords(request.destination);
  }

  if (request.destinationCoords && !request.nearby?.length) {
    request.nearby = await findNearby(
      request.destinationCoords.lat,
      request.destinationCoords.lon
    ).catch(() => []);
  }

  return generateWithGemini(request);
}

async function resolveCoords(destination) {
  const [result] = await searchPlaces(destination, 1).catch(() => []);

  if (!result) return undefined;

  return {
    lat: Number(result.lat),
    lon: Number(result.lon)
  };
}
