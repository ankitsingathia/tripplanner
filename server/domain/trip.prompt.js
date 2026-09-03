/**
 * Builds the Gemini prompt for a trip request.
 *
 * Kept separate from the Gemini client on purpose: prompt wording is the thing
 * that changes most often, and it should be editable without touching the
 * transport code or risking a change to how responses are parsed.
 */
export function buildTripPrompt(request) {
  const nearby = (request.nearby || [])
    .slice(0, 20)
    .map((place) => `- ${place.name} (${place.category}) near ${place.area || request.destination}`)
    .join("\n");

  return `
You are Wanderly, a senior travel planner. Generate a real, practical itinerary using current public travel knowledge.

Return only valid JSON. Do not include markdown.

Trip request:
- Destination: ${request.destination}
- Start date: ${request.startDate || "flexible"}
- Duration: ${request.durationDays} days
- Budget: ${request.budget}
- Travelers: ${request.travelers}
- Pace: ${request.pace}
- Interests: ${request.interests?.join(", ") || "balanced sightseeing, food, culture"}
- Notes: ${request.notes || "none"}
- Destination coordinates: ${
    request.destinationCoords
      ? `${request.destinationCoords.lat}, ${request.destinationCoords.lon}`
      : "unknown"
  }

Open map context from Nominatim/Overpass:
${nearby || "- No nearby places supplied. Use your travel knowledge carefully."}

Planning rules:
- Build a day-wise route.
- Within each day, order stops so the next spot is geographically sensible and nearby.
- Include travel time/mode from the previous stop.
- Prefer realistic opening-hour timing and avoid impossible jumps.
- Mix iconic sights with local food or neighborhood experiences.
- Keep costs aligned with the budget.
- Use the supplied nearby hotels, restaurants, cafes, and attractions when they fit the traveler.
- Include approximate latitude and longitude for every stop so the route can be drawn on OpenStreetMap.
- If exact live data is uncertain, make a clearly reasonable planning estimate.

JSON schema:
{
  "title": "string",
  "destination": "string",
  "center": {"lat": 0, "lon": 0},
  "summary": "string",
  "routeStrategy": "string",
  "budgetBreakdown": [{"label":"string","amount":"string"}],
  "days": [
    {
      "day": 1,
      "theme": "string",
      "area": "string",
      "routeSummary": "string",
      "stops": [
        {
          "order": 1,
          "time": "string",
          "name": "string",
          "type": "string",
          "duration": "string",
          "address": "string",
          "why": "string",
          "travelFromPrevious": "string",
          "estimatedCost": "string",
          "latitude": 0,
          "longitude": 0
        }
      ]
    }
  ]
}`.trim();
}
