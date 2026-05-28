import { useEffect, useMemo, useState } from "react";
import { Compass, Loader2 } from "lucide-react";
import LoginPage from "./components/LoginPage";
import Shell from "./components/Shell";
import Dashboard from "./components/Dashboard";
import TripsView from "./components/TripsView";
import ExploreView from "./components/ExploreView";
import TripDetail from "./components/TripDetail";
import TripCreator from "./components/TripCreator";
import BookingsView from "./components/BookingsView";
import SavedView from "./components/SavedView";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import ProfileSetupModal from "./components/ProfileSetupModal";
import {
  isFirebaseConfigured,
  logout,
  subscribeToAuth,
  getUserProfile,
  updateUserProfile
} from "./services/firebase";
import {
  deleteTripForUser,
  loadTripsForUser,
  persistTripForUser
} from "./services/tripStore";
import { fallbackImages } from "./data/fallbackImages";

const demoUser = {
  uid: "demo-user",
  displayName: "Aarav Rajput",
  email: "demo@wanderly.app",
  photoURL: "",
  demo: true
};

const starterTrip = {
  id: "starter-amalfi",
  title: "Amalfi Coast Escape",
  destination: "Amalfi, Italy",
  startDate: "2026-06-12",
  durationDays: 7,
  budget: "Premium",
  travelers: "4 people",
  pace: "Balanced",
  interests: ["Coastal views", "Food", "Culture"],
  summary:
    "A coastal itinerary that starts in Naples, flows toward Positano and Amalfi, then finishes with quieter villages and sea views.",
  routeStrategy:
    "Each day follows the coastline or clusters nearby towns to avoid backtracking on narrow coastal roads.",
  heroImage: fallbackImages.amalfi,
  center: { lat: 40.634, lon: 14.6027 },
  nearby: [
    { id: "demo-1", name: "Amalfi Cathedral", category: "attraction", lat: 40.634, lon: 14.6027 },
    { id: "demo-2", name: "Ristorante Marina Grande", category: "restaurant", lat: 40.6336, lon: 14.6014 },
    { id: "demo-3", name: "Hotel Marina Riviera", category: "hotel", lat: 40.6331, lon: 14.6042 }
  ],
  budgetBreakdown: [
    { label: "Stay", amount: "EUR 1,050" },
    { label: "Food", amount: "EUR 520" },
    { label: "Transport", amount: "EUR 260" },
    { label: "Activities", amount: "EUR 410" }
  ],
  days: [
    {
      day: 1,
      theme: "Arrival and Amalfi Town",
      area: "Naples to Amalfi",
      routeSummary: "Airport arrival, hotel check-in, then an easy walk through central Amalfi.",
      stops: [
        {
          order: 1,
          time: "10:30 AM",
          name: "Naples International Airport",
          type: "Arrival",
          duration: "45 min",
          address: "Viale F. Ruffo di Calabria, Naples",
          why: "Start with a simple arrival window before the coastal transfer.",
          travelFromPrevious: "Start here",
          estimatedCost: "Included",
          latitude: 40.8846,
          longitude: 14.2908
        },
        {
          order: 2,
          time: "12:00 PM",
          name: "Private Transfer to Amalfi",
          type: "Transfer",
          duration: "1 hr 30 min",
          address: "Naples to Amalfi",
          why: "The fastest low-stress way to reach the coast with luggage.",
          travelFromPrevious: "Drive from airport",
          estimatedCost: "EUR 120",
          latitude: 40.6331,
          longitude: 14.6042
        },
        {
          order: 3,
          time: "4:00 PM",
          name: "Amalfi Cathedral and Piazza Duomo",
          type: "Culture",
          duration: "1 hr",
          address: "Piazza Duomo, Amalfi",
          why: "A compact first stop near most central hotels.",
          travelFromPrevious: "8 min walk from hotel",
          estimatedCost: "EUR 4",
          latitude: 40.634,
          longitude: 14.6027
        }
      ]
    }
  ],
  createdAt: "2026-05-26T10:00:00.000Z"
};

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [activeView, setActiveView] = useState("home");
  const [selectedTripId, setSelectedTripId] = useState(starterTrip.id);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    if (!isFirebaseConfigured) {
      setAuthReady(true);
    }

    return unsubscribe;
  }, []);

  // Load profile when user changes
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setShowProfileSetup(false);
        return;
      }

      if (user.demo) {
        // Check if demo user has done profile setup in this session
        const savedDemoProfile = sessionStorage.getItem("demo-profile");
        if (savedDemoProfile) {
          setProfile(JSON.parse(savedDemoProfile));
          setShowProfileSetup(false);
        } else {
          setProfile({
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
          setShowProfileSetup(true);
        }
        return;
      }

      // Firebase user — load from Firestore
      const storedProfile = await getUserProfile(user.uid);
      if (storedProfile) {
        setProfile({
          displayName: storedProfile.name || user.displayName,
          photoURL: storedProfile.photoURL || user.photoURL,
          travelPrefs: storedProfile.travelPrefs || null,
          profileSetupDone: storedProfile.profileSetupDone || false,
        });
        if (!storedProfile.profileSetupDone) {
          setShowProfileSetup(true);
        }
      } else {
        setProfile({
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setShowProfileSetup(true);
      }
    }

    loadProfile();
  }, [user]);

  useEffect(() => {
    async function hydrateTrips() {
      if (!user) return;
      setLoadingTrips(true);
      const storedTrips = await loadTripsForUser(user);
      const nextTrips = storedTrips.length ? storedTrips : [starterTrip];
      setTrips(nextTrips);
      setSelectedTripId(nextTrips[0]?.id || starterTrip.id);
      setLoadingTrips(false);
    }

    hydrateTrips();
  }, [user]);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId) || trips[0] || starterTrip,
    [selectedTripId, trips]
  );

  async function handleProfileSetupComplete(data) {
    const updatedProfile = {
      ...profile,
      displayName: data.displayName,
      photoURL: data.photoURL,
      profileSetupDone: true,
    };
    setProfile(updatedProfile);
    setShowProfileSetup(false);

    if (user?.demo) {
      sessionStorage.setItem("demo-profile", JSON.stringify(updatedProfile));
      setUser((prev) => ({
        ...prev,
        displayName: data.displayName,
        photoURL: data.photoURL,
      }));
    } else if (user?.uid) {
      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        photoURL: data.photoURL,
        profileSetupDone: true,
      });
    }
  }

  function handleProfileSetupSkip() {
    const updatedProfile = {
      ...profile,
      profileSetupDone: true,
    };
    setProfile(updatedProfile);
    setShowProfileSetup(false);

    if (user?.demo) {
      sessionStorage.setItem("demo-profile", JSON.stringify(updatedProfile));
    } else if (user?.uid) {
      updateUserProfile(user.uid, { profileSetupDone: true }).catch(() => {});
    }
  }

  async function handleUpdateProfile(data) {
    const updatedProfile = {
      ...profile,
      ...data,
      displayName: data.displayName || profile?.displayName,
    };

    // If photoURL was set, update it
    if (data.photoURL !== undefined) {
      updatedProfile.photoURL = data.photoURL;
    }

    setProfile(updatedProfile);

    if (user?.demo) {
      sessionStorage.setItem("demo-profile", JSON.stringify(updatedProfile));
      setUser((prev) => ({
        ...prev,
        displayName: updatedProfile.displayName,
        photoURL: updatedProfile.photoURL ?? prev.photoURL,
      }));
    } else if (user?.uid) {
      await updateUserProfile(user.uid, data);
    }
  }

  async function handleTripCreated(trip) {
    const savedTrip = await persistTripForUser(user, trip);
    setTrips((current) => [savedTrip, ...current.filter((item) => item.id !== starterTrip.id)]);
    setSelectedTripId(savedTrip.id);
    setActiveView("itinerary");
    setCreatorOpen(false);
  }

  async function handleDeleteTrip(tripId) {
    await deleteTripForUser(user, tripId);
    setTrips((current) => current.filter((trip) => trip.id !== tripId));
  }

  async function handleLogout() {
    if (user?.demo) {
      sessionStorage.removeItem("demo-profile");
      setUser(null);
      setTrips([]);
      setProfile(null);
      return;
    }

    await logout();
    setTrips([]);
    setProfile(null);
  }

  // Build an effective user object that merges auth + profile
  const effectiveUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      displayName: profile?.displayName || user.displayName,
      photoURL: profile?.photoURL || user.photoURL,
    };
  }, [user, profile]);

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
        <div className="flex items-center gap-3 rounded-lg border bg-white px-5 py-4 shadow-soft">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Preparing Wanderly
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onDemoLogin={() => setUser(demoUser)}
      />
    );
  }

  const content = {
    home: (
      <Dashboard
        user={effectiveUser}
        trips={trips}
        selectedTrip={selectedTrip}
        onNewTrip={() => setCreatorOpen(true)}
        onViewChange={setActiveView}
        onOpenTrip={(tripId) => {
          setSelectedTripId(tripId);
          setActiveView("itinerary");
        }}
      />
    ),
    trips: (
      <TripsView
        trips={trips}
        selectedTripId={selectedTripId}
        loading={loadingTrips}
        onNewTrip={() => setCreatorOpen(true)}
        onOpenTrip={(tripId) => {
          setSelectedTripId(tripId);
          setActiveView("itinerary");
        }}
        onDeleteTrip={handleDeleteTrip}
      />
    ),
    explore: <ExploreView onPlanDestination={(destination) => setCreatorOpen(destination)} />,
    itinerary: (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setActiveView("trips")}
        onNewTrip={() => setCreatorOpen(true)}
      />
    ),
    bookings: <BookingsView />,
    saved: <SavedView />,
    profile: (
      <ProfileView
        user={effectiveUser}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />
    ),
    settings: <SettingsView />
  }[activeView];

  return (
    <>
      <Shell
        activeView={activeView}
        onViewChange={setActiveView}
        onNewTrip={() => setCreatorOpen(true)}
        onLogout={handleLogout}
        user={effectiveUser}
      >
        {content}
      </Shell>
      <TripCreator
        open={Boolean(creatorOpen)}
        initialDestination={typeof creatorOpen === "string" ? creatorOpen : ""}
        onClose={() => setCreatorOpen(false)}
        onTripCreated={handleTripCreated}
      />
      {showProfileSetup && (
        <ProfileSetupModal
          user={effectiveUser}
          onComplete={handleProfileSetupComplete}
          onSkip={handleProfileSetupSkip}
        />
      )}
    </>
  );
}

function EmptyState({ title, message }) {
  return (
    <section className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-slate-500">{message}</p>
      </div>
    </section>
  );
}
