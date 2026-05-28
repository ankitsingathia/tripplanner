import { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, MapPin, Sparkles, Users, WalletCards, X } from "lucide-react";

const interestOptions = [
  "Iconic sights",
  "Local food",
  "Culture",
  "Nature",
  "Shopping",
  "Nightlife",
  "Hidden gems",
  "Photography"
];

const budgets = ["Budget", "Moderate", "Premium", "Luxury"];
const paces = ["Relaxed", "Balanced", "Packed"];

export default function TripCreator({ open, initialDestination, onClose, onTripCreated }) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState(4);
  const [budget, setBudget] = useState("Moderate");
  const [travelers, setTravelers] = useState("2 people");
  const [pace, setPace] = useState("Balanced");
  const [notes, setNotes] = useState("");
  const [interests, setInterests] = useState(["Iconic sights", "Local food", "Culture"]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [nearbyPreview, setNearbyPreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDestination(initialDestination || "");
      setSelectedPlace(null);
      setNearbyPreview([]);
      setError("");
    }
  }, [open, initialDestination]);

  useEffect(() => {
    if (!open || destination.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?input=${encodeURIComponent(destination)}`,
          { signal: controller.signal }
        );
        const payload = await response.json();
        setSuggestions(payload.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [destination, open]);

  useEffect(() => {
    if (!selectedPlace?.lat || !selectedPlace?.lon) {
      setNearbyPreview([]);
      return;
    }

    const controller = new AbortController();
    async function loadNearby() {
      try {
        const response = await fetch(
          `/api/nearby?lat=${selectedPlace.lat}&lon=${selectedPlace.lon}`,
          { signal: controller.signal }
        );
        const payload = await response.json();
        setNearbyPreview(payload.nearby || []);
      } catch {
        setNearbyPreview([]);
      }
    }

    loadNearby();

    return () => controller.abort();
  }, [selectedPlace]);

  const canSubmit = useMemo(
    () => destination.trim() && durationDays > 0 && budget && !submitting,
    [destination, durationDays, budget, submitting]
  );

  function toggleInterest(value) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          durationDays,
          budget,
          travelers,
          pace,
          interests,
          notes,
          destinationCoords: selectedPlace
            ? { lat: selectedPlace.lat, lon: selectedPlace.lon }
            : null,
          nearby: nearbyPreview
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to generate trip.");
      }

      let trip = payload.trip;

      try {
        const photoResponse = await fetch(
          `/api/place-image?query=${encodeURIComponent(trip.destination || destination)}`
        );
        const photoPayload = await photoResponse.json();
        trip = {
          ...trip,
          heroImage: photoPayload.imageUrl || trip.heroImage
        };
      } catch {
        // The generated itinerary is still useful without a fetched image.
      }

      await onTripCreated(trip);
    } catch (submitError) {
      setError(submitError.message || "Unable to generate trip.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-soft">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Create AI Trip</h2>
            <p className="mt-1 text-sm text-slate-500">Gemini will plan the route stop by stop.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 p-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-5">
            <Field label="Destination" icon={MapPin}>
              <div className="relative">
                <input
                  value={destination}
                  onChange={(event) => {
                    setDestination(event.target.value);
                    setSelectedPlace(null);
                  }}
                  className="input"
                  placeholder="Search Paris, Bali, Tokyo..."
                  required
                />
                {suggestions.length ? (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
                    {suggestions.slice(0, 5).map((item) => (
                      <button
                        type="button"
                        key={item.placeId || item.label}
                        onClick={() => {
                          setDestination(item.label);
                          setSelectedPlace(item);
                          setSuggestions([]);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm transition hover:bg-blue-50"
                      >
                        <span className="font-medium text-slate-800">{item.mainText}</span>
                        {item.secondaryText ? (
                          <span className="ml-2 text-slate-500">{item.secondaryText}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </Field>

            {nearbyPreview.length ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Found {nearbyPreview.length} nearby hotels, restaurants, cafes, and attractions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {nearbyPreview.slice(0, 6).map((place) => (
                    <span
                      key={place.id || place.name}
                      className="rounded-md bg-white px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {place.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date" icon={Calendar}>
                <input
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="input"
                  type="date"
                />
              </Field>
              <Field label="Duration" icon={Calendar}>
                <input
                  value={durationDays}
                  onChange={(event) => setDurationDays(Number(event.target.value))}
                  className="input"
                  type="number"
                  min="1"
                  max="21"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Travelers" icon={Users}>
                <input
                  value={travelers}
                  onChange={(event) => setTravelers(event.target.value)}
                  className="input"
                  placeholder="2 people"
                />
              </Field>
              <Field label="Budget" icon={WalletCards}>
                <div className="grid grid-cols-2 gap-2">
                  {budgets.map((item) => (
                    <Toggle
                      key={item}
                      active={budget === item}
                      onClick={() => setBudget(item)}
                      label={item}
                    />
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Travel pace" icon={Sparkles}>
              <div className="grid grid-cols-3 gap-2">
                {paces.map((item) => (
                  <Toggle
                    key={item}
                    active={pace === item}
                    onClick={() => setPace(item)}
                    label={item}
                  />
                ))}
              </div>
            </Field>
          </div>

          <div className="space-y-5">
            <Field label="Interests" icon={Sparkles}>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map((item) => (
                  <Toggle
                    key={item}
                    active={interests.includes(item)}
                    onClick={() => toggleInterest(item)}
                    label={item}
                  />
                ))}
              </div>
            </Field>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Extra notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-2 min-h-32 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Prefer metro routes, vegetarian food, family-friendly stops..."
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate real itinerary
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-blue-600" />
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
