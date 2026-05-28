import {
  ArrowRight,
  Calendar,
  Clock3,
  Hotel,
  MapPinned,
  Plus,
  Sparkles,
  Star,
  Utensils,
  WalletCards
} from "lucide-react";
import { fallbackImages } from "../data/fallbackImages";
import { formatDate, totalStops } from "../lib/utils";

const discover = [
  ["Places to stay", Hotel, "bg-blue-50 text-blue-600"],
  ["Things to do", Sparkles, "bg-emerald-50 text-emerald-600"],
  ["Food & Drink", Utensils, "bg-rose-50 text-rose-600"],
  ["Budget ideas", WalletCards, "bg-amber-50 text-amber-600"]
];

const popular = [
  ["Bali", "Indonesia", fallbackImages.bali],
  ["Paris", "France", fallbackImages.paris],
  ["Santorini", "Greece", fallbackImages.santorini],
  ["Dubai", "UAE", fallbackImages.dubai]
];

export default function Dashboard({ user, trips, selectedTrip, onNewTrip, onOpenTrip, onViewChange }) {
  const name = user?.displayName?.split(" ")?.[0] || "Traveler";
  const trip = selectedTrip;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 text-wrap">Good morning, {name}!</h1>
          <p className="mt-2 text-lg text-slate-500">Where do you want to explore today?</p>
        </div>
        <button
          type="button"
          onClick={onNewTrip}
          className="flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Plan New Trip
        </button>
      </section>

      <section className="group relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
        <img
          className="h-[400px] w-full object-cover opacity-60 transition duration-700 group-hover:scale-105"
          src={trip?.heroImage || fallbackImages.default}
          alt={trip?.destination}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-8 p-8 lg:flex-row lg:items-end lg:justify-between lg:p-12">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20">
              Active Trip
            </span>
            <h2 className="mt-6 text-5xl font-bold tracking-tight leading-tight">{trip?.title}</h2>
            <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium text-slate-200">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-blue-400" />
                {formatDate(trip?.startDate)}
              </span>
              <span className="inline-flex items-center gap-2 text-wrap">
                <Clock3 className="h-4.5 w-4.5 text-blue-400" />
                {trip?.durationDays} Planning Days
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinned className="h-4.5 w-4.5 text-blue-400" />
                {trip?.destination}
              </span>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-white/10 p-6 text-white backdrop-blur-xl ring-1 ring-white/20 lg:max-w-sm">
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg tracking-tight">Quick Summary</p>
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="mt-6 space-y-4">
              <OverviewRow label="Days planned" value={`${trip?.durationDays || 0} days`} dark />
              <OverviewRow label="Activities" value={`${totalStops(trip)} planned`} dark />
              <OverviewRow label="Budget Style" value={trip?.budget || "Flexible"} dark />
            </div>
            <button
              type="button"
              onClick={() => onOpenTrip(trip.id)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              Check Details
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[1fr_400px]">
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Upcoming Trips</h2>
            <button
              type="button"
              onClick={() => onViewChange("trips")}
              className="group flex items-center gap-1 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {trips.slice(0, 2).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onOpenTrip(item.id)}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="overflow-hidden rounded-xl">
                  <img
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-110"
                    src={item.heroImage || fallbackImages.default}
                    alt={item.destination}
                  />
                </div>
                <div className="min-w-0 px-2 pb-2">
                  <h3 className="text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">{formatDate(item.startDate)}</p>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Planned
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-950">Discover</h2>
          <div className="grid grid-cols-2 gap-4">
            {discover.map(([label, Icon, tone]) => (
              <button
                type="button"
                key={label}
                onClick={() => onViewChange("explore")}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl transition-transform group-hover:scale-110 ${tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-4 block text-sm font-bold text-slate-900 tracking-tight">{label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 text-wrap">Popular Destinations</h2>
          <button 
            onClick={() => onViewChange("explore")}
            type="button" 
            className="group flex items-center gap-1 text-sm font-bold text-blue-600 transition hover:text-blue-700"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {popular.map(([city, country, image]) => (
            <button key={city} onClick={() => onViewChange("explore")} className="group relative overflow-hidden rounded-2xl text-left">
              <img className="h-64 w-full object-cover transition duration-700 group-hover:scale-110" src={image} alt={city} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold">{city}</h3>
                <p className="mt-1 text-sm font-medium text-slate-200">{country}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function OverviewRow({ label, value, dark }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={dark ? "font-medium text-slate-300" : "font-medium text-slate-500"}>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
