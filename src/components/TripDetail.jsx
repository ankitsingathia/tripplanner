import {
  ArrowLeft, Calendar, Clock3, MapPin, Plus, Share2, Sparkles,
  Wallet, FileText, ClipboardList, LayoutDashboard,
  DollarSign, PieChart, StickyNote, CheckCircle2, Circle,
  Utensils, Hotel, Ticket, Bus, PlusCircle, Trash2, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackImages } from "../data/fallbackImages";
import { formatDate, totalStops } from "../lib/utils";
import TripMap from "./TripMap";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "itinerary", label: "Itinerary", icon: ClipboardList },
  { id: "bookings", label: "Bookings", icon: Ticket },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "notes", label: "Notes", icon: StickyNote },
];

export default function TripDetail({ trip, onBack, onNewTrip }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeDay, setActiveDay] = useState(0);
  const [notes, setNotes] = useState(trip?.notes || "");
  const [shareMessage, setShareMessage] = useState("");
  const day = trip?.days?.[activeDay] || trip?.days?.[0];

  useEffect(() => {
    setActiveTab("overview");
    setActiveDay(0);
    setNotes(trip?.notes || "");
  }, [trip?.id, trip?.notes]);

  async function handleShare() {
    const shareText = `${trip?.title || "Wanderly trip"} - ${trip?.destination || ""}`;

    try {
      if (window.navigator?.clipboard) {
        await window.navigator.clipboard.writeText(shareText);
        setShareMessage("Trip summary copied");
      } else {
        setShareMessage("Trip ready to share");
      }
    } catch {
      setShareMessage("Trip ready to share");
    }

    window.setTimeout(() => setShareMessage(""), 1800);
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-400">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="mt-1 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 transition hover:bg-slate-50 active:scale-95"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{trip?.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(trip?.startDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {trip?.durationDays} days
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {trip?.destination}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {shareMessage ? (
            <span className="self-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              {shareMessage}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleShare}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 active:scale-95"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNewTrip}
            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                activeTab === tab.id ? "text-white" : "text-slate-400"
              }`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={activeTab}>
        {activeTab === "overview" && <OverviewTab trip={trip} />}
        {activeTab === "itinerary" && (
          <ItineraryTab trip={trip} day={day} activeDay={activeDay} setActiveDay={setActiveDay} />
        )}
        {activeTab === "bookings" && <BookingsTab trip={trip} />}
        {activeTab === "budget" && <BudgetTab trip={trip} />}
        {activeTab === "notes" && <NotesTab trip={trip} notes={notes} setNotes={setNotes} />}
      </div>
    </div>
  );
}

/* ─── Overview Tab ──────────────────────────────────── */
function OverviewTab({ trip }) {
  const stops = totalStops(trip);
  const budgetTotal = trip?.budgetBreakdown?.reduce((sum, item) => {
    const num = parseFloat(item.amount?.replace(/[^0-9.]/g, "") || 0);
    return sum + num;
  }, 0) || 0;
  const currency = trip?.budgetBreakdown?.[0]?.amount?.match(/^[A-Z]+/)?.[0] || "USD";

  return (
    <div className="space-y-6">
      {/* Hero + Summary */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* The photo is absolutely positioned so it fills whatever height the
            summary column beside it sets, without adding height of its own.
            At a fixed h-72 it left a white gap under the photo; sized by the
            image itself, a tall photo stretched the whole row instead. */}
        <div className="relative min-h-72 overflow-hidden rounded-2xl border border-slate-200">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={trip?.heroImage || fallbackImages.default}
            alt={trip?.destination}
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="font-bold text-slate-950">AI Route Strategy</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{trip?.routeStrategy}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm leading-7 text-slate-600">{trip?.summary}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Duration", value: `${trip?.durationDays || 0} days`, icon: Clock3, color: "bg-blue-50 text-blue-600" },
          { label: "Total Stops", value: stops, icon: MapPin, color: "bg-emerald-50 text-emerald-600" },
          { label: "Budget", value: `${currency} ${budgetTotal.toLocaleString()}`, icon: Wallet, color: "bg-amber-50 text-amber-600" },
          { label: "Travelers", value: trip?.travelers || "Not set", icon: ClipboardList, color: "bg-rose-50 text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xl font-bold text-slate-950">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      {trip?.center && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="font-bold text-slate-950">Trip Map</h3>
          </div>
          <TripMap trip={trip} day={trip?.days?.[0]} />
        </div>
      )}

      {/* Nearby Places */}
      {trip?.nearby?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-950">Nearby OpenStreetMap Picks</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trip.nearby.slice(0, 6).map((place) => (
              <div key={place.id || place.name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 transition hover:bg-slate-100">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-slate-400 shadow-sm">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{place.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{place.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Itinerary Tab ─────────────────────────────────── */
function ItineraryTab({ trip, day, activeDay, setActiveDay }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="grid gap-5 lg:grid-cols-[112px_1fr]">
        {/* Day sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-2">
          {trip?.days?.map((item, index) => (
            <button
              type="button"
              key={`${item.day}-${item.theme}`}
              onClick={() => setActiveDay(index)}
              className={`w-full rounded-xl px-3 py-4 text-left text-sm transition ${
                activeDay === index
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="block font-bold">Day {item.day}</span>
              <span className="mt-1 block text-xs font-medium">{item.area}</span>
            </button>
          ))}
        </aside>

        {/* Day detail */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <p className="text-sm font-bold text-blue-600">Day {day?.day}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{day?.theme}</h2>
            <p className="mt-2 text-slate-500 leading-relaxed">{day?.routeSummary}</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl">
            <img
              className="h-64 w-full object-cover"
              src={trip?.heroImage || fallbackImages.default}
              alt={trip?.destination}
            />
          </div>

          <div className="mt-5">
            <TripMap trip={trip} day={day} />
          </div>

          {/* Timeline */}
          <div className="mt-7 space-y-0">
            {day?.stops?.map((stop, index) => (
              <div key={`${stop.order}-${stop.name}`} className="grid grid-cols-[82px_1fr] gap-4">
                <div className="pt-1 text-sm font-bold text-slate-500">{stop.time}</div>
                <div className="relative border-l-2 border-slate-200 pb-7 pl-6">
                  <span className="absolute -left-[8px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-blue-600 ring-4 ring-blue-50" />
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">{stop.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{stop.address}</p>
                      </div>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 shadow-sm">
                        {stop.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{stop.why}</p>
                    <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {stop.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {index === 0 ? "Start here" : stop.travelFromPrevious}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        {stop.estimatedCost}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Right sidebar — Route Strategy */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-950">Route Strategy</h2>
              <p className="text-sm text-slate-500">{totalStops(trip)} stops planned</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{trip?.routeStrategy}</p>
        </div>
      </aside>
    </section>
  );
}

/* ─── Bookings Tab ──────────────────────────────────── */
function BookingsTab({ trip }) {
  const [bookings, setBookings] = useState(() => {
    const items = [];
    if (trip?.destination) {
      items.push({
        id: "b1",
        type: "hotel",
        name: `Hotel in ${trip.destination}`,
        status: "confirmed",
        date: trip.startDate || "Flexible",
        price: trip?.budgetBreakdown?.find((b) => b.label === "Stay")?.amount || "TBD",
        icon: Hotel,
        notes: "Generated from the itinerary stay estimate."
      });
      items.push({
        id: "b2",
        type: "transport",
        name: `Transport to ${trip.destination}`,
        status: "pending",
        date: trip.startDate || "Flexible",
        price: trip?.budgetBreakdown?.find((b) => b.label === "Transport")?.amount || "TBD",
        icon: Bus,
        notes: "Keep transfer timing aligned with the first day plan."
      });
      items.push({
        id: "b3",
        type: "activity",
        name: "Activities & Tours",
        status: "pending",
        date: "During trip",
        price: trip?.budgetBreakdown?.find((b) => b.label === "Activities")?.amount || "TBD",
        icon: Ticket,
        notes: "Use this bucket for guided tours, tickets, and local experiences."
      });
    }
    return items;
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [newBooking, setNewBooking] = useState({
    type: "activity",
    name: "",
    date: trip?.startDate || "",
    price: "",
    notes: ""
  });

  const statusColor = {
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  function handleImport() {
    const imported = {
      id: `import-${Date.now()}`,
      type: "activity",
      name: `${trip?.destination || "Trip"} confirmation import`,
      status: "confirmed",
      date: trip?.startDate || "Flexible",
      price: "TBD",
      icon: Ticket,
      notes: "Demo import added. Connect Gmail later for automatic booking sync."
    };

    setBookings((current) => [imported, ...current]);
    setSelectedBooking(imported);
    setImportMessage("Imported one itinerary confirmation");
    window.setTimeout(() => setImportMessage(""), 2000);
  }

  function handleAddBooking(event) {
    event.preventDefault();
    if (!newBooking.name.trim()) return;

    const iconByType = {
      hotel: Hotel,
      transport: Bus,
      activity: Ticket
    };
    const booking = {
      id: `custom-${Date.now()}`,
      type: newBooking.type,
      name: newBooking.name.trim(),
      status: "pending",
      date: newBooking.date || "Flexible",
      price: newBooking.price || "TBD",
      icon: iconByType[newBooking.type] || Ticket,
      notes: newBooking.notes || "Added manually."
    };

    setBookings((current) => [booking, ...current]);
    setSelectedBooking(booking);
    setShowAddBooking(false);
    setNewBooking({
      type: "activity",
      name: "",
      date: trip?.startDate || "",
      price: "",
      notes: ""
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Trip Bookings</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your reservations for this trip</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {importMessage ? (
            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              {importMessage}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleImport}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            Import itinerary
          </button>
          <button
            type="button"
            onClick={() => setShowAddBooking(true)}
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
          >
            Add Booking
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Ticket className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-sm font-bold text-slate-500">No bookings yet</p>
            <p className="mt-1 text-xs text-slate-400">Bookings for this trip will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`flex flex-wrap items-center gap-5 rounded-2xl border bg-white p-5 transition hover:shadow-md ${
                  selectedBooking?.id === booking.id ? "border-blue-200 shadow-md" : "border-slate-200"
                }`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500">
                  <booking.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-slate-900">{booking.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{formatDate(booking.date)}</p>
                </div>
                <span className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ring-1 ${statusColor[booking.status]}`}>
                  {booking.status}
                </span>
                <span className="whitespace-nowrap text-sm font-bold text-slate-900">{booking.price}</span>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(booking)}
                  className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        )}

        <aside className="rounded-2xl border border-slate-200 bg-white p-6">
          {selectedBooking ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Booking Details
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-950">{selectedBooking.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
                  title="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="Type" value={selectedBooking.type} />
                <DetailRow label="Date" value={formatDate(selectedBooking.date)} />
                <DetailRow label="Status" value={selectedBooking.status} />
                <DetailRow label="Price" value={selectedBooking.price} />
              </div>
              <div className="mt-6 rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Notes</p>
                <p className="mt-2 text-sm leading-6 text-blue-950">{selectedBooking.notes}</p>
              </div>
            </>
          ) : (
            <div className="grid min-h-[240px] place-items-center text-center">
              <div>
                <Ticket className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-600">Select a booking</p>
                <p className="mt-1 text-xs text-slate-400">Details will appear here.</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {showAddBooking ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <form onSubmit={handleAddBooking} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Add Booking</h3>
                <p className="mt-1 text-sm text-slate-500">Add a flight, stay, transfer, or activity.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBooking(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Type</span>
                <select
                  value={newBooking.type}
                  onChange={(event) => setNewBooking((current) => ({ ...current, type: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="activity">Activity</option>
                  <option value="hotel">Hotel</option>
                  <option value="transport">Transport</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Name</span>
                <input
                  value={newBooking.name}
                  onChange={(event) => setNewBooking((current) => ({ ...current, name: event.target.value }))}
                  className="input mt-2"
                  placeholder="Hotel, flight, tour, transfer..."
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Date</span>
                  <input
                    value={newBooking.date}
                    onChange={(event) => setNewBooking((current) => ({ ...current, date: event.target.value }))}
                    className="input mt-2"
                    type="date"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Price</span>
                  <input
                    value={newBooking.price}
                    onChange={(event) => setNewBooking((current) => ({ ...current, price: event.target.value }))}
                    className="input mt-2"
                    placeholder="EUR 120"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Notes</span>
                <textarea
                  value={newBooking.notes}
                  onChange={(event) => setNewBooking((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="Confirmation number, address, special instructions..."
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Save Booking
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-bold capitalize text-slate-950">{value}</span>
    </div>
  );
}

/* ─── Budget Tab ────────────────────────────────────── */
function BudgetTab({ trip }) {
  const breakdown = trip?.budgetBreakdown || [];
  const parsed = breakdown.map((item) => {
    const num = parseFloat(item.amount?.replace(/[^0-9.]/g, "") || 0);
    return { ...item, number: num };
  });
  const total = parsed.reduce((sum, i) => sum + i.number, 0);
  const currency = breakdown[0]?.amount?.match(/^[A-Z]+/)?.[0] || "USD";

  const categoryIcons = {
    Stay: Hotel,
    Food: Utensils,
    Transport: Bus,
    Activities: Ticket,
  };

  const categoryColors = [
    { bar: "bg-blue-500", chip: "bg-blue-50 text-blue-600" },
    { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
    { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-600" },
    { bar: "bg-rose-500", chip: "bg-rose-50 text-rose-600" },
    { bar: "bg-purple-500", chip: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-950">Budget Breakdown</h2>
        <p className="mt-1 text-sm text-slate-500">Estimated expenses for your trip</p>
      </div>

      {/* Total card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Estimated Budget</p>
        <p className="mt-2 text-5xl font-bold tracking-tight">
          {currency} {total.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {trip?.durationDays} days | {trip?.travelers || "Not set"}
        </p>

        {/* Progress bar */}
        <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-white/10">
          {parsed.map((item, i) => (
            <div
              key={item.label}
              className={`${categoryColors[i % categoryColors.length].bar} transition-all duration-500`}
              style={{ width: total ? `${(item.number / total) * 100}%` : "0%" }}
              title={`${item.label}: ${item.amount}`}
            />
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {parsed.map((item, i) => {
          const Icon = categoryIcons[item.label] || Wallet;
          const pct = total ? Math.round((item.number / total) * 100) : 0;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${categoryColors[i % categoryColors.length].chip}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400">{pct}% of total</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-900">{item.amount}</p>
              </div>
              {/* Mini progress */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${categoryColors[i % categoryColors.length].bar} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {breakdown.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <PieChart className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-bold text-slate-500">No budget data</p>
          <p className="mt-1 text-xs text-slate-400">Budget breakdown will appear after AI generates your trip</p>
        </div>
      )}
    </div>
  );
}

/* ─── Notes Tab ─────────────────────────────────────── */
function NotesTab({ trip, notes, setNotes }) {
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Book flights", done: false },
    { id: 2, text: "Reserve accommodation", done: false },
    { id: 3, text: "Travel insurance", done: false },
    { id: 4, text: "Pack essentials", done: false },
  ]);
  const [newItem, setNewItem] = useState("");

  function toggleItem(id) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  function addItem() {
    if (!newItem.trim()) return;
    setChecklist((prev) => [...prev, { id: Date.now(), text: newItem.trim(), done: false }]);
    setNewItem("");
  }

  function removeItem(id) {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Notes area */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Trip Notes</h2>
          <p className="mt-1 text-sm text-slate-500">Jot down ideas, tips, and reminders</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-1">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={trip?.summary || "Write your notes here..."}
            className="min-h-[300px] w-full resize-none rounded-xl border-0 bg-transparent p-5 text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* AI Summary */}
        {trip?.summary && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">AI Summary</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{trip.summary}</p>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Packing & To-Do</h2>
          <p className="mt-1 text-sm text-slate-500">
            {checklist.filter((i) => i.done).length}/{checklist.length} completed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {/* Progress */}
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: checklist.length
                  ? `${(checklist.filter((i) => i.done).length / checklist.length) * 100}%`
                  : "0%",
              }}
            />
          </div>

          <div className="space-y-1">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="shrink-0 transition hover:scale-110"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm font-medium transition ${
                    item.done ? "text-slate-400 line-through" : "text-slate-700"
                  }`}
                >
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Add item..."
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={addItem}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 active:scale-95"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
