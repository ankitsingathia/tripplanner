import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const app = express();
const appUserAgent =
  process.env.OSM_USER_AGENT || "WanderlyAITripPlanner/1.0 (local development)";

app.use(express.json({ limit: "1mb" }));

const fallbackPhotos = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
];

function pickFallbackPhoto(seed = "") {
  const score = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackPhotos[score % fallbackPhotos.length];
}

function extractJson(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const body = fenced?.[1] ?? text;
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(body.slice(start, end + 1));
    }
  }

  return null;
}

function normalizeTrip(raw, request) {
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
    days: days.map((day, index) => ({
      day: Number(day.day) || index + 1,
      theme: day.theme || `Day ${index + 1}`,
      area: day.area || destination,
      routeSummary: day.routeSummary || "Stops are ordered by proximity and timing.",
      stops: Array.isArray(day.stops)
        ? day.stops.map((stop, stopIndex) => ({
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
          }))
        : []
    })),
    createdAt: new Date().toISOString()
  };
}

function buildTripPrompt(request) {
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

async function generateWithGemini(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    const error = new Error("Missing GEMINI_API_KEY");
    error.status = 400;
    throw error;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildTripPrompt(request) }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Gemini request failed");
    error.status = response.status;
    throw error;
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("\n");
  const parsed = extractJson(text);

  if (!parsed) {
    const error = new Error("Gemini returned a response that could not be parsed as JSON.");
    error.status = 502;
    throw error;
  }

  return normalizeTrip(parsed, request);
}

async function nominatimSearch(query, limit = 6) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: String(limit)
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      "User-Agent": appUserAgent,
      "Accept-Language": "en"
    }
  });

  if (!response.ok) {
    throw new Error("Nominatim search failed");
  }

  return response.json();
}

async function overpassNearby(lat, lon) {
  const query = `
    [out:json][timeout:20];
    (
      node(around:5000,${lat},${lon})["tourism"="attraction"];
      way(around:5000,${lat},${lon})["tourism"="attraction"];
      node(around:5000,${lat},${lon})["tourism"="hotel"];
      node(around:5000,${lat},${lon})["amenity"~"restaurant|cafe"];
    );
    out center tags 60;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": appUserAgent
    },
    body: new URLSearchParams({ data: query })
  });

  if (!response.ok) {
    throw new Error("Overpass nearby lookup failed");
  }

  const payload = await response.json();

  return (payload.elements || [])
    .map((item) => {
      const tags = item.tags || {};
      const latValue = item.lat ?? item.center?.lat;
      const lonValue = item.lon ?? item.center?.lon;
      const category =
        tags.amenity || tags.tourism || tags.leisure || tags.historic || "place";

      return {
        id: `${item.type}-${item.id}`,
        name: tags.name || tags["name:en"],
        category,
        area: tags["addr:suburb"] || tags["addr:city"] || "",
        lat: latValue,
        lon: lonValue
      };
    })
    .filter((item) => item.name && item.lat && item.lon)
    .slice(0, 30);
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    mapProvider: "OpenStreetMap",
    searchProvider: "Nominatim",
    nearbyProvider: "Overpass"
  });
});

app.post("/api/generate-trip", async (req, res) => {
  try {
    const request = { ...(req.body || {}) };

    if (!request.destination || !request.durationDays || !request.budget) {
      return res.status(400).json({
        message: "Destination, duration, and budget are required."
      });
    }

    if (!request.destinationCoords) {
      const [destinationResult] = await nominatimSearch(request.destination, 1).catch(() => []);
      if (destinationResult) {
        request.destinationCoords = {
          lat: Number(destinationResult.lat),
          lon: Number(destinationResult.lon)
        };
      }
    }

    if (request.destinationCoords && !request.nearby?.length) {
      request.nearby = await overpassNearby(
        request.destinationCoords.lat,
        request.destinationCoords.lon
      ).catch(() => []);
    }

    const trip = await generateWithGemini(request);
    res.json({ trip });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Unable to generate trip."
    });
  }
});

app.get("/api/search", async (req, res) => {
  const input = String(req.query.input || "").trim();

  if (!input || input.length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    const payload = await nominatimSearch(input, 7);
    const suggestions = payload.map((item) => {
      const address = item.address || {};
      const mainText =
        address.city ||
        address.town ||
        address.village ||
        address.state ||
        item.name ||
        item.display_name?.split(",")[0];

      return {
        placeId: String(item.place_id),
        label: item.display_name,
        mainText,
        secondaryText: [address.state, address.country].filter(Boolean).join(", "),
        lat: Number(item.lat),
        lon: Number(item.lon),
        type: item.type,
        category: item.category
      };
    });

    res.json({ suggestions });
  } catch (error) {
    res.status(502).json({ message: error.message || "Search failed" });
  }
});

app.get("/api/nearby", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ message: "lat and lon are required." });
  }

  try {
    const nearby = await overpassNearby(lat, lon);
    res.json({ nearby });
  } catch (error) {
    res.status(502).json({ message: error.message || "Nearby lookup failed" });
  }
});

app.get("/api/place-image", (req, res) => {
  const query = String(req.query.query || "").trim();
  res.json({ imageUrl: pickFallbackPhoto(query) });
});

if (isProduction) {
  app.use(express.static(path.join(root, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(root, "dist", "index.html"));
  });
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}

const port = Number(process.env.PORT || 5173);

app.listen(port, () => {
  console.log(`Wanderly running at http://localhost:${port}`);
});
