# Wanderly

An AI trip planner that turns a destination and a handful of constraints into a day-by-day itinerary where the stops are actually in the right order — grounded in real OpenStreetMap places, drawn on a map, and saved to your account.

**Live app:** https://tripplanner-jtno.onrender.com
**Source:** https://github.com/ankitsingathia/tripplanner

You can try it without signing up. The login screen has a demo mode that runs the full planner and keeps trips in browser storage.

---

## The problem it solves

Most LLM itineraries read well and fall apart in practice: day two sends you across the city and back, half the restaurants closed years ago, and nothing has coordinates so you cannot check any of it.

Wanderly narrows that gap by refusing to let the model invent geography on its own. Before a single token is generated, the server resolves the destination to real coordinates, pulls the actual attractions, hotels, cafés and restaurants within 5 km from OpenStreetMap, and hands that list to the model as source material. The model's job becomes sequencing and reasoning, not recall. Every stop comes back with a latitude and longitude, so the route can be drawn — and if the geography is wrong, you see it immediately on the map.

## How a trip gets built

1. **Destination lookup** — typing hits `/api/search`, debounced at 250 ms with in-flight requests aborted, which proxies Nominatim and returns structured suggestions.
2. **Neighborhood scan** — selecting a suggestion fires an Overpass query around those coordinates: `tourism=attraction`, `tourism=hotel`, and `amenity~restaurant|cafe` within 5 km, normalized and capped at 30 named places with valid coordinates.
3. **Prompt assembly** — trip constraints (dates, duration, budget, travelers, pace, interests, free-text notes) and up to 20 of those real places go into a single structured prompt with explicit planning rules: group each day geographically, state travel time from the previous stop, respect plausible opening hours, keep costs inside the budget.
4. **Generation** — Gemini 2.5 Flash, called with `responseMimeType: application/json`. A fallback parser strips markdown fences and brace-matches, because "return only JSON" is a request, not a guarantee.
5. **Normalization** — `normalizeTrip()` fills a default for every field on the way out. A model response missing `routeStrategy` or half its stop metadata still produces a renderable trip instead of a crash.
6. **Render** — each day maps to a Leaflet view: numbered circle markers on the ordered stops, a polyline through the route, and the nearby OSM places behind it in grey for context.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | React 19, Vite 7, Tailwind CSS | Fast dev loop; utility CSS keeps a large multi-view app in one visual language |
| Server | Express 5 (Node 18+) | Keeps API keys server-side and hosts the SPA from one process — one service to deploy |
| Model | Google Gemini 2.5 Flash | Structured JSON output mode, and cheap enough that regenerating a plan is not a decision |
| Geo | Nominatim, Overpass, Leaflet, OpenStreetMap tiles | No key, no quota negotiation, no per-map-load billing |
| Auth & data | Firebase Auth (Google), Cloud Firestore | Owner-scoped rules mean no session layer to write |

One process serves both sides. In development the Express app mounts Vite as middleware for HMR; in production it serves `dist/` and falls back to `index.html` for any non-API GET. Same entry point, same routing, in both modes.

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Reports whether the Gemini key is present and which geo providers are wired |
| `GET /api/search?input=` | Nominatim autocomplete; returns place id, label, coordinates, type |
| `GET /api/nearby?lat=&lon=` | Overpass POI scan around a point |
| `POST /api/generate-trip` | The planner. Geocodes and scans first if the client did not, then generates and normalizes |
| `GET /api/place-image?query=` | Deterministic hero image, seeded by destination name |

`/api/generate-trip` requires `destination`, `durationDays`, and `budget`; everything else is optional and shapes the prompt.

## Running locally

Node 18 or newer.

```bash
git clone https://github.com/ankitsingathia/tripplanner.git
cd tripplanner
npm install
npm run dev
```

Then open http://localhost:5173.

Create a `.env` in the project root:

```env
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
OSM_USER_AGENT=Wanderly/1.0 (you@example.com)

# Optional — omit for demo mode
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Two things worth knowing. `OSM_USER_AGENT` is not optional in spirit — Nominatim and Overpass are volunteer-run and will rate-limit or block anonymous traffic, so identify your build. And the Firebase block is genuinely optional: the app checks that every key is present, and if any is missing it starts in demo mode rather than failing at boot. Trips then persist to `localStorage` through the same `tripStore` interface the Firestore path uses, so the UI never learns which backend it is talking to.

## Deployment

Deployed on Render as a single web service:

- **Build:** `npm install && npm run build`
- **Start:** `NODE_ENV=production node server/index.js`
- **Environment:** the variables above; the server binds `process.env.PORT`.

`NODE_ENV=production` is the switch that matters — it makes Express serve the built bundle instead of booting Vite in middleware mode. The live instance runs on Render's free tier, so the first request after an idle period waits on a cold start.

## Data and persistence

Signed-in trips live at `users/{uid}/trips/{tripId}`. The Firestore rules in `firestore.rules` scope every read and write to `request.auth.uid == userId`, on both the profile document and the trips subcollection — a signed-in user cannot reach another user's data by guessing a uid.

## Layout

```
server/index.js          Express app: geo proxies, prompt building, Gemini call, SPA serving
src/App.jsx              Auth state, trip state, view routing
src/components/          TripCreator, TripDetail, TripMap, Dashboard, Explore, Profile, Shell
src/services/firebase.js Auth, Firestore reads/writes, configuration detection
src/services/tripStore.js One interface over Firestore and localStorage
firestore.rules          Owner-scoped access rules
```

## Scope

Worth stating plainly. **Plan, Trips, and Itinerary are the working product** — live geocoding, live POI data, real generation, real persistence. **Explore, Bookings, and Saved render fixed sample data**; they are built-out UI surfaces for flows that would need a booking or inventory integration behind them, and they are not pretending otherwise. Hero images come from a small curated fallback set chosen deterministically by destination, not from an image search API. Geo responses are not cached server-side yet, which is the first thing to add if this ever takes real traffic.
