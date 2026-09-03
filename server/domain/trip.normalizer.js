import { pickFallbackPhoto } from "./photos.js";

/**
 * Turns whatever the model returned into the exact trip shape the client
 * renders.
 *
 * This is the trust boundary: every field the UI reads is defaulted here, so a
 * missing or malformed key in the model output degrades to a sensible value
 * instead of surfacing as `undefined` somewhere in a component. If the client
 * ever needs a new field, it gets defaulted here first.
 */
export function normalizeTrip(raw, request) {
  const destination = raw?.destination || request.destination;
  const days = Array.isArray(raw?.days) ? raw.days : [];

  return {
    id: crypto.randomUUID(),
    title: raw?.title || `${destination} ${request.durationDays}-Day Escape`,
    destination,
    startDate: request.startDate || "",
    durationDays: Number(request.durationDays) || days.length || 1,
    budget: request.budget,
    travelers: request.travelers,
    pace: request.pace,
    interests: request.interests,
    summary:
      raw?.summary ||
      `A personalized ${request.durationDays}-day route through ${destination}.`,
    heroImage: raw?.heroImage || pickFallbackPhoto(destination),
    center: raw?.center || request.destinationCoords || null,
    nearby: request.nearby || [],
    budgetBreakdown: raw?.budgetBreakdown || [],
    routeStrategy:
      raw?.routeStrategy ||
      "The itinerary groups nearby places each day to reduce backtracking.",
    days: days.map((day, index) => normalizeDay(day, index, destination)),
    createdAt: new Date().toISOString()
  };
}

function normalizeDay(day, index, destination) {
  return {
    day: Number(day.day) || index + 1,
    theme: day.theme || `Day ${index + 1}`,
    area: day.area || destination,
    routeSummary: day.routeSummary || "Stops are ordered by proximity and timing.",
    stops: Array.isArray(day.stops) ? day.stops.map(normalizeStop) : []
  };
}

function normalizeStop(stop, stopIndex) {
  return {
    order: Number(stop.order) || stopIndex + 1,
    time: stop.time || "",
    name: stop.name || `Stop ${stopIndex + 1}`,
    type: stop.type || "Sightseeing",
    duration: stop.duration || "",
    address: stop.address || "",
    why: stop.why || "",
    travelFromPrevious: stop.travelFromPrevious || "Start here",
    estimatedCost: stop.estimatedCost || "",
    latitude: Number(stop.latitude) || null,
    longitude: Number(stop.longitude) || null
  };
}
