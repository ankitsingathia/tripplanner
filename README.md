# Wanderly

[![CI](https://github.com/ankitsingathia/tripplanner/actions/workflows/ci.yml/badge.svg)](https://github.com/ankitsingathia/tripplanner/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An AI trip planner that turns a destination and a handful of constraints into a day-by-day itinerary where the stops are actually in the right order — grounded in real OpenStreetMap places, drawn on a map, and saved to your account.

**[Try the live app →](https://tripplanner-jtno.onrender.com)** No sign-up needed: the login screen has a demo mode that runs the full planner and keeps trips in browser storage. It's on Render's free tier, so the first load after a quiet spell can take around 30 seconds.

![Itinerary view: a day's stops in order on a Leaflet map, with a timeline underneath](docs/screenshots/04-itinerary.png)

| Planning a trip | Trip overview |
| --- | --- |
| ![Trip creator with live destination autocomplete](docs/screenshots/05-planner.png) | ![Trip overview with route strategy and summary](docs/screenshots/03-overview.png) |

---

## The problem it solves

Most LLM itineraries read well and fall apart in practice: day two sends you across the city and back, half the restaurants closed years ago, and nothing has coordinates so you cannot check any of it.

Wanderly narrows that gap by refusing to let the model invent geography on its own. Before a single token is generated, the server resolves the destination to real coordinates, pulls the actual attractions, hotels, cafés and restaurants within 5 km from OpenStreetMap, and hands that list to the model as source material. The model's job becomes sequencing and reasoning, not recall. Every stop comes back with a latitude and longitude, so the route can be drawn — and if the geography is wrong, you see it immediately on the map.

## How a trip gets built

1. **Destination lookup** — typing hits `/api/search`, debounced at 250 ms with in-flight requests aborted, which proxies Nominatim and returns structured suggestions.
2. **Neighbourhood scan** — picking a suggestion fires an Overpass query around those coordinates for attractions, hotels, restaurants and cafés within 5 km, normalized and capped at 30 named places with valid coordinates.
3. **Prompt assembly** — trip constraints (dates, duration, budget, travelers, pace, interests, free-text notes) and up to 20 of those real places go into one structured prompt with explicit planning rules: group each day geographically, state travel time from the previous stop, respect plausible opening hours, keep costs inside the budget.
4. **Generation** — Gemini 2.5 Flash with `responseMimeType: application/json` and thinking turned off (`thinkingBudget: 0`), since the reasoning pass adds wait before the first token of a long reply. A fallback parser strips markdown fences and brace-matches, because "return only JSON" is a request, not a guarantee.
5. **Normalization** — `normalizeTrip()` fills a default for every field on the way out. A reply missing `routeStrategy` or half its stop metadata still produces a renderable trip instead of a crash.
6. **Render** — each day maps to a Leaflet view: numbered markers on the ordered stops, a polyline through the route, and the nearby OSM places behind it in grey for context.

## Decisions worth explaining

**The map lookups are bounded and shared.** Overpass is volunteer-run and slow. Measured against it, it answered in about 4 s when it worked and hung 11–13 s before a 504 when it didn't — and trip generation waits on it before Gemini is even called. Each lookup now gives up at 8 s (the map context is best-effort, so a timeout means a less grounded plan, not a failed one), and results are cached per ~110 m. The preview fired when you pick a destination and the request fired when you press Generate share one call; before that, a failed preview made the submit sit through a second slow lookup, 8.2 s of it.

**Bad model output is a 502, not a crash.** A reply with no JSON, or with braces around broken JSON, is reported as "could not be parsed" rather than escaping as a parser exception.

**One process, two modes.** In development Express mounts Vite as middleware for HMR; in production it serves `dist/` and falls back to `index.html` for any non-API GET, while unknown `/api` routes stay 404s. Same entry point, same routing — one service to deploy.

**The map respects the page.** Wheel-scrolling over a trip map scrolls the page; only a pinch zooms the map, tracked 1:1 with the gesture. The map also sits in its own stacking context, so Leaflet's internal z-indexes can't paint it over the sticky header.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | React 19, Vite 7, Tailwind CSS | Fast dev loop; utility CSS keeps a large multi-view app in one visual language |
| Server | Express 5 (Node 18+) | Keeps API keys server-side and hosts the SPA from one process |
| Model | Google Gemini 2.5 Flash | Structured JSON output mode, and cheap enough that regenerating a plan is not a decision |
| Geo | Nominatim, Overpass, Leaflet, OpenStreetMap tiles | No key, no quota negotiation, no per-map-load billing |
| Auth & data | Firebase Auth (Google), Cloud Firestore | Owner-scoped rules mean no session layer to write |
| Tests | Vitest, GitHub Actions | Runs the suite, lint and a production build on every push |

## Project layout

```
server/
  index.js        Binds the port — nothing else
  app.js          Middleware order: JSON body → /api → frontend → errors
  config/         Every environment variable, read once
  routes/         URL → controller table
  controllers/    HTTP in and out; no business logic
  services/       Trip orchestration, Gemini client, OpenStreetMap client and cache
  domain/         Prompt, trip normalizer, fallback photos
  lib/            HttpError, tolerant JSON extraction
  middleware/     Errors → JSON; Vite in dev, static files in prod
src/
  App.jsx         Auth state, trip state, view routing
  components/     TripCreator, TripDetail, TripMap, Dashboard, Explore, Profile, Shell
  services/       Firebase, and one tripStore interface over Firestore and localStorage
test/server/      API and server tests
firestore.rules   Owner-scoped access rules
```

Swapping the model provider touches `services/gemini.service.js`; swapping the image source touches `domain/photos.js`; a new endpoint is one line in `routes/` plus a controller.

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Whether the Gemini key is present and which geo providers are wired — never the key itself |
| `GET /api/search?input=` | Nominatim autocomplete; returns place id, label, coordinates, type |
| `GET /api/nearby?lat=&lon=` | Overpass scan around a point |
| `POST /api/generate-trip` | The planner. Geocodes and scans first if the client did not, then generates and normalizes |
| `GET /api/place-image?query=` | Deterministic hero image, seeded by destination name |

`/api/generate-trip` requires `destination`, `durationDays` and `budget`; everything else is optional and shapes the prompt.

## Tests

```bash
npm test
```

29 tests, about two seconds, no API key and no network — every outbound call is stubbed. They cover the parts most likely to break quietly: pulling JSON out of messy model replies, defaulting anything the model leaves out, sharing one Overpass lookup between preview and submit (including when it fails), the shape of the Gemini request, and the API's validation and 404 behaviour. CI runs lint, the tests and a production build on every push.

The suite covers the server. The React side is verified by hand for now.

## Running locally

Node 18 or newer.

```bash
git clone https://github.com/ankitsingathia/tripplanner.git
cd tripplanner
npm install
cp .env.example .env    # then add your GEMINI_API_KEY
npm run dev
```

Open http://localhost:5173. [`.env.example`](.env.example) lists every setting with a note on each; only `GEMINI_API_KEY` is needed to generate trips.

Two things worth knowing. `OSM_USER_AGENT` is not optional in spirit — Nominatim and Overpass are volunteer-run and will rate-limit or block anonymous traffic, so identify your build. And the Firebase block is genuinely optional: if any key is missing the app starts in demo mode rather than failing at boot, and trips persist to `localStorage` through the same `tripStore` interface the Firestore path uses, so the UI never learns which backend it is talking to.

## Deployment

Deployed on Render as a single web service:

- **Build:** `npm install && npm run build`
- **Start:** `NODE_ENV=production node server/index.js`
- **Environment:** the variables from `.env.example`; the server binds `process.env.PORT`.

`NODE_ENV=production` is the switch that matters — it makes Express serve the built bundle instead of booting Vite in middleware mode.

## Data and persistence

Signed-in trips live at `users/{uid}/trips/{tripId}`. The rules in `firestore.rules` scope every read and write to `request.auth.uid == userId`, on both the profile document and the trips subcollection — a signed-in user cannot reach another user's data by guessing a uid.

## Scope

Worth stating plainly. **Plan, Trips and Itinerary are the working product** — live geocoding, live place data, real generation, real persistence. **Explore, Bookings and Saved render fixed sample data**; they are built-out UI for flows that would need a booking or inventory integration behind them, and they are not pretending otherwise. Hero images come from a small curated set chosen deterministically by destination, not from an image search API. The geo cache is in-memory, which is right for one instance; running several would need a shared cache.

## License

[MIT](LICENSE)
