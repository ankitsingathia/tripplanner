import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Car,
  Hotel,
  Import,
  MapPin,
  Plane,
  Plus,
  Ticket,
  X
} from "lucide-react";
import { formatDate } from "../lib/utils";

const initialBookings = [
  {
    id: "b1",
    type: "flights",
    title: "Naples International (NAP)",
    subtitle: "Lufthansa LH1892",
    date: "2026-06-12",
    status: "Confirmed",
    location: "Naples, Italy",
    price: "EUR 420",
    confirmation: "LH-1892-WDY",
    notes: "Arrive early and keep a buffer for the Amalfi transfer.",
    icon: Plane,
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "b2",
    type: "stays",
    title: "Hotel Marina Riviera",
    subtitle: "Superior Sea View Room",
    date: "2026-06-12",
    status: "Pending",
    location: "Amalfi, Italy",
    price: "EUR 1,050",
    confirmation: "MRV-SEA-772",
    notes: "Ask for sea-view confirmation and late check-in support.",
    icon: Hotel,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    id: "b3",
    type: "transfers",
    title: "Private Car Transfer",
    subtitle: "Mercedes E-Class",
    date: "2026-06-12",
    status: "Confirmed",
    location: "NAP to Amalfi",
    price: "EUR 120",
    confirmation: "CAR-AMA-120",
    notes: "Driver meets at arrivals with name board.",
    icon: Car,
    color: "bg-amber-50 text-amber-600"
  }
];

const filters = [
  { id: "all", label: "All" },
  { id: "flights", label: "Flights" },
  { id: "stays", label: "Stays" },
  { id: "activities", label: "Activities" },
  { id: "transfers", label: "Transfers" }
];

export default function BookingsView() {
  const [bookings, setBookings] = useState(initialBookings);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(initialBookings[0]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [notice, setNotice] = useState("");
  const [newBooking, setNewBooking] = useState({
    type: "activities",
    title: "",
    subtitle: "",
    date: "",
    location: "",
    price: "",
    notes: ""
  });

  const visibleBookings = useMemo(
    () =>
      activeFilter === "all"
        ? bookings
        : bookings.filter((booking) => booking.type === activeFilter),
    [activeFilter, bookings]
  );

  const totalValue = bookings.reduce((sum, booking) => {
    const number = Number(String(booking.price).replace(/[^0-9.]/g, ""));
    return sum + (Number.isFinite(number) ? number : 0);
  }, 0);

  function handleImport() {
    const booking = {
      id: `import-${Date.now()}`,
      type: "activities",
      title: "Imported Amalfi Boat Tour",
      subtitle: "Shared coastal cruise",
      date: "2026-06-14",
      status: "Confirmed",
      location: "Amalfi, Italy",
      price: "EUR 89",
      confirmation: "IMP-BOAT-89",
      notes: "Demo import added from itinerary. Gmail sync can be connected later.",
      icon: Ticket,
      color: "bg-rose-50 text-rose-600"
    };

    setBookings((current) => [booking, ...current]);
    setSelectedBooking(booking);
    setNotice("Imported one itinerary booking");
    window.setTimeout(() => setNotice(""), 1800);
  }

  function handleAddBooking(event) {
    event.preventDefault();
    if (!newBooking.title.trim()) return;

    const meta = {
      flights: { icon: Plane, color: "bg-blue-50 text-blue-600" },
      stays: { icon: Hotel, color: "bg-emerald-50 text-emerald-600" },
      activities: { icon: Ticket, color: "bg-rose-50 text-rose-600" },
      transfers: { icon: Car, color: "bg-amber-50 text-amber-600" }
    }[newBooking.type];

    const booking = {
      id: `custom-${Date.now()}`,
      type: newBooking.type,
      title: newBooking.title.trim(),
      subtitle: newBooking.subtitle || "Manual booking",
      date: newBooking.date || "",
      status: "Pending",
      location: newBooking.location || "Not set",
      price: newBooking.price || "TBD",
      confirmation: "Manual entry",
      notes: newBooking.notes || "Added manually.",
      icon: meta.icon,
      color: meta.color
    };

    setBookings((current) => [booking, ...current]);
    setSelectedBooking(booking);
    setShowAddBooking(false);
    setNewBooking({
      type: "activities",
      title: "",
      subtitle: "",
      date: "",
      location: "",
      price: "",
      notes: ""
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Bookings</h1>
          <p className="mt-2 text-lg text-slate-500">Manage your flights, stays, and transfers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {notice ? (
            <span className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              {notice}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleImport}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <Import className="h-4 w-4" />
            Import itinerary
          </button>
          <button
            type="button"
            onClick={() => setShowAddBooking(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Booking
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeFilter === filter.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {visibleBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <Ticket className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">No bookings in this category</p>
              <p className="mt-1 text-xs text-slate-400">Add or import one to see it here.</p>
            </div>
          ) : null}

          {visibleBookings.map((booking) => (
            <article
              key={booking.id}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 transition hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 ${
                selectedBooking?.id === booking.id ? "border-blue-200 shadow-lg shadow-blue-900/5" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap gap-6 sm:flex-nowrap">
                <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl shadow-sm ${booking.color}`}>
                  <booking.icon className="h-7 w-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">{booking.title}</h3>
                      <p className="text-sm font-medium text-slate-500">{booking.subtitle}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        booking.status === "Confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2 font-medium text-slate-600">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-2 font-medium text-slate-600">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {booking.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(booking)}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-900 transition hover:bg-slate-100 sm:w-auto"
                  >
                    Details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Booking Details</h2>
            {selectedBooking ? (
              <div className="mt-5 space-y-4 text-sm">
                <DetailRow label="Name" value={selectedBooking.title} />
                <DetailRow label="Type" value={selectedBooking.type} />
                <DetailRow label="Date" value={formatDate(selectedBooking.date)} />
                <DetailRow label="Location" value={selectedBooking.location} />
                <DetailRow label="Confirmation" value={selectedBooking.confirmation} />
                <DetailRow label="Price" value={selectedBooking.price} />
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Notes</p>
                  <p className="mt-2 leading-6 text-blue-950">{selectedBooking.notes}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Click Details on a booking to inspect it here.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Analytics</h2>
            <div className="mt-6 space-y-4">
              <StatRow label="Total Value" value={`EUR ${totalValue.toLocaleString()}`} />
              <StatRow label="Upcoming" value={`${bookings.length} Bookings`} />
              <StatRow label="Confirmed" value={`${bookings.filter((booking) => booking.status === "Confirmed").length} Ready`} />
            </div>
            <div className="mt-8 rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Pro Tip</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-blue-900">
                Link your Gmail to automatically sync new travel bookings.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {showAddBooking ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <form onSubmit={handleAddBooking} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Add Booking</h2>
                <p className="mt-1 text-sm text-slate-500">Create a manual travel reservation.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBooking(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
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
                  <option value="flights">Flight</option>
                  <option value="stays">Stay</option>
                  <option value="activities">Activity</option>
                  <option value="transfers">Transfer</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Title</span>
                <input
                  value={newBooking.title}
                  onChange={(event) => setNewBooking((current) => ({ ...current, title: event.target.value }))}
                  className="input mt-2"
                  placeholder="Booking name"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Subtitle</span>
                <input
                  value={newBooking.subtitle}
                  onChange={(event) => setNewBooking((current) => ({ ...current, subtitle: event.target.value }))}
                  className="input mt-2"
                  placeholder="Airline, room, vehicle, guide..."
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
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
                  <span className="text-sm font-bold text-slate-700">Location</span>
                  <input
                    value={newBooking.location}
                    onChange={(event) => setNewBooking((current) => ({ ...current, location: event.target.value }))}
                    className="input mt-2"
                    placeholder="City"
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
                  placeholder="Confirmation number, pickup details, meal preference..."
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
    <div className="flex items-start justify-between gap-4">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="max-w-[190px] text-right font-bold capitalize text-slate-950">{value}</span>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-950">{value}</span>
    </div>
  );
}
