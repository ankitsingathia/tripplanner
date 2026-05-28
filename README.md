# Wanderly AI Trip Planner

Wanderly is a resume-ready AI travel planner built with React, Tailwind CSS, Google Gemini, Firebase Auth, Firestore, OpenStreetMap, Leaflet, Nominatim, and Overpass.

## Features

- Google login with Firebase Authentication
- Firestore trip saving per authenticated user
- Gemini-generated day-wise itineraries with ordered nearby stops, travel legs, timings, budget notes, and route rationale
- OpenStreetMap + Leaflet route maps
- Nominatim city/place search with autocomplete suggestions
- Overpass lookup for nearby hotels, restaurants, cafes, and attractions
- Clean responsive dashboard inspired by modern travel products
- Demo mode when Firebase keys are not present, so the UI can still be reviewed locally

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and add keys:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Required Keys For Full Functionality

- `GEMINI_API_KEY`: Creates real itineraries instead of predefined sample content.
- `VITE_FIREBASE_*`: Enables Google OAuth and Firestore persistence.
- `OSM_USER_AGENT`: Identifies your app to Nominatim and Overpass. Use your app name and email.

No Google Maps or Google Places billing account is required.

## Firebase Setup

Enable Google sign-in in Firebase Authentication, create a Firestore database, and publish the rules in `firestore.rules`.

Suggested Firestore shape:

```txt
users/{uid}
users/{uid}/trips/{tripId}
```
