# Wanderly AI Trip Planner 🌍

Wanderly is a professional-grade, AI-driven travel planning application. It leverages the power of Large Language Models (LLMs) and Open Source Geographic Data to create highly personalized, geographically optimized itineraries.

Developed with a focus on seamless UX and robust architecture, Wanderly is "resume-ready" and demonstrates integration across a modern full-stack ecosystem.

---

## ✨ Key Features

- **🧠 Intelligent Itineraries**: Uses Google Gemini to generate day-by-day plans with logical stop ordering, timing estimates, and budget breakdowns.
- **🗺️ Interactive Mapping**: Built-in OpenStreetMap and Leaflet integration for real-time visualization of your travel route.
- **🔍 Smart Search**: Real-time destination suggestions via Nominatim and local POI (Points of Interest) data from the Overpass API.
- **🔐 Secure Authentication**: Firebase Auth integration with Google Sign-In for personalized user profiles.
- **💾 Cloud Persistence**: Persistent storage for your saved trips using Google Firestore.
- **📱 Responsive Glassmorphism UI**: A premium, mobile-first design using Tailwind CSS with modern UI/UX principles.
- **🛠️ Demo Mode**: Fully functional local environment even without Firebase keys, allowing for immediate UI/UX evaluation.

---

## 🛠️ Technology Stack

| Category           | Technology                                      |
|--------------------|-------------------------------------------------|
| **Frontend**       | React (Vite), Tailwind CSS, Lucide Icons        |
| **Backend/BaaS**   | Node.js (Express), Firebase Auth, Firestore     |
| **AI Engine**      | Google Gemini API (Pro/Flash)                  |
| **Geospatial**     | Leaflet, OpenStreetMap, Nominatim, Overpass API |
| **State/Logic**    | React Hooks, Express Middleware                 |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or Yarn

### Installation

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY=your_key_here
   OSM_USER_AGENT=Wanderly/1.0 (contact@example.com)
   
   # Optional: Firebase Config
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   ```

3. **Launch the Development Server**:
   ```bash
   node server/index.js
   ```
   *The app uses a custom Express server to handle both Vite middleware and API proxying.*

---

## 📁 Architecture

The project follows a modular structure for easy scalability:

- `/src/components`: UI components organized by feature (Dashboard, TripDetail, Explore).
- `/server`: Express server logic, Gemini API integrations, and middleware.
- `/public`: Static assets and icons.
- `firestore.rules`: Security rules for database protection.

---


