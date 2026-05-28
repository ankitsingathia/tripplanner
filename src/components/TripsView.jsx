import { useMemo, useState } from "react";
import { Calendar, Clock3, Loader2, MapPin, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { fallbackImages } from "../data/fallbackImages";
import { formatDate } from "../lib/utils";

const filters = [
  { id: "all", label: "All Trips" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" }
];

function tripStatus(trip) {
  if (trip.status === "cancelled") return "cancelled";
  if (!trip.startDate) return "upcoming";

  const start = new Date(trip.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return start < today ? "completed" : "upcoming";
}

export default function TripsView({
  trips,
  selectedTripId,
  loading,
  onNewTrip,
  onOpenTrip,
  onDeleteTrip
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const visibleTrips = useMemo(
    () =>
      activeFilter === "all"
        ? trips
        : trips.filter((trip) => tripStatus(trip) === activeFilter),
    [activeFilter, trips]
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Trips</h1>
          <div className="mt-5 flex flex-wrap gap-6 text-sm font-medium text-slate-500">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`pb-2 transition ${
                  activeFilter === filter.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "hover:text-slate-900"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onNewTrip}
          className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {loading ? (
            <div className="grid h-52 place-items-center rounded-lg border border-slate-200">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : null}

          {!loading && visibleTrips.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
              <p className="font-semibold text-slate-700">No {activeFilter} trips yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Create a trip or switch filters to see your plans.
              </p>
            </div>
          ) : null}

          {visibleTrips.map((trip) => (
            <article
              key={trip.id}
              className={`rounded-lg border bg-white p-3 transition hover:shadow-soft ${
                selectedTripId === trip.id ? "border-blue-200" : "border-slate-200"
              }`}
            >
              <div className="grid gap-4 md:grid-cols-[230px_1fr_auto]">
                <button type="button" onClick={() => onOpenTrip(trip.id)}>
                  <img
                    className="h-36 w-full rounded-lg object-cover"
                    src={trip.heroImage || fallbackImages.default}
                    alt={trip.destination}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTrip(trip.id)}
                  className="min-w-0 py-2 text-left"
                >
                  <h2 className="text-lg font-semibold text-slate-950">{trip.title}</h2>
                  <div className="mt-4 grid gap-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(trip.startDate)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      {trip.durationDays} Days
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {trip.destination}
                    </span>
                  </div>
                </button>
                <div className="flex items-start gap-2 p-2">
                  <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {tripStatus(trip)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteTrip(trip.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Delete trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrip(trip.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-50"
                    title="Open details"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Trip Stats</h2>
            <div className="mt-5 grid gap-4 text-sm">
              <Stat label="Trips Taken" value={trips.length} />
              <Stat
                label="Cities Planned"
                value={trips.reduce((sum, trip) => sum + (trip.days?.length || 0), 0)}
              />
              <Stat
                label="Days Planned"
                value={trips.reduce((sum, trip) => sum + Number(trip.durationDays || 0), 0)}
              />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Recently Viewed</h2>
            <div className="mt-5 space-y-3">
              {trips.slice(0, 4).map((trip) => (
                <button
                  type="button"
                  key={trip.id}
                  onClick={() => onOpenTrip(trip.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-1 text-left transition hover:bg-slate-50"
                >
                  <img
                    className="h-10 w-12 rounded-md object-cover"
                    src={trip.heroImage || fallbackImages.default}
                    alt={trip.destination}
                  />
                  <span className="text-sm text-slate-600">{trip.destination}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}
