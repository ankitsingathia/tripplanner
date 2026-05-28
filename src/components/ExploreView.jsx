import { useMemo, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  Filter,
  Heart,
  MapPin,
  SlidersHorizontal,
  Star,
  Utensils
} from "lucide-react";
import { fallbackImages } from "../data/fallbackImages";

const tabs = [
  { id: "all", label: "All" },
  { id: "destinations", label: "Destinations" },
  { id: "things", label: "Things to do" },
  { id: "hotels", label: "Hotels" },
  { id: "restaurants", label: "Restaurants" }
];

const destinations = [
  { city: "Paris", country: "France", image: fallbackImages.paris },
  { city: "Santorini", country: "Greece", image: fallbackImages.santorini },
  { city: "Bali", country: "Indonesia", image: fallbackImages.bali },
  { city: "Dubai", country: "UAE", image: fallbackImages.dubai }
];

const experiences = [
  { name: "Skydive Dubai", place: "Dubai, UAE", price: "from $299", image: fallbackImages.dubai },
  { name: "Santorini Catamaran Cruise", place: "Santorini, Greece", price: "from $89", image: fallbackImages.santorini },
  { name: "Ubud Rice Terrace Walk", place: "Bali, Indonesia", price: "from $45", image: fallbackImages.bali },
  { name: "Louvre Museum Tour", place: "Paris, France", price: "from $65", image: fallbackImages.paris }
];

const hotels = [
  { name: "Marina Riviera Stay", place: "Amalfi, Italy", price: "from $210/night", image: fallbackImages.amalfi, rating: "4.8" },
  { name: "Desert View Suites", place: "Dubai, UAE", price: "from $180/night", image: fallbackImages.dubai, rating: "4.7" },
  { name: "Ubud Garden Villa", place: "Bali, Indonesia", price: "from $95/night", image: fallbackImages.bali, rating: "4.9" },
  { name: "Left Bank Boutique", place: "Paris, France", price: "from $160/night", image: fallbackImages.paris, rating: "4.6" }
];

const restaurants = [
  { name: "Blue Dome Taverna", place: "Santorini, Greece", price: "$$ seafood", image: fallbackImages.santorini, rating: "4.8" },
  { name: "Canal Side Bistro", place: "Paris, France", price: "$$$ french", image: fallbackImages.paris, rating: "4.7" },
  { name: "Palm Grove Warung", place: "Bali, Indonesia", price: "$ local", image: fallbackImages.bali, rating: "4.9" },
  { name: "Marina Night Grill", place: "Dubai, UAE", price: "$$$ grill", image: fallbackImages.dubai, rating: "4.5" }
];

export default function ExploreView({ onPlanDestination }) {
  const [activeTab, setActiveTab] = useState("all");
  const [sortMessage, setSortMessage] = useState("");
  const [filterMessage, setFilterMessage] = useState("");

  const visibleSections = useMemo(
    () => ({
      destinations: activeTab === "all" || activeTab === "destinations",
      things: activeTab === "all" || activeTab === "things",
      hotels: activeTab === "all" || activeTab === "hotels",
      restaurants: activeTab === "all" || activeTab === "restaurants"
    }),
    [activeTab]
  );

  function temporaryMessage(setter, message) {
    setter(message);
    window.setTimeout(() => setter(""), 1600);
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-8 text-sm font-bold text-slate-400">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 transition ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {filterMessage || sortMessage ? (
            <span className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              {filterMessage || sortMessage}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => temporaryMessage(setFilterMessage, "Showing highly rated picks")}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            type="button"
            onClick={() => temporaryMessage(setSortMessage, "Sorted by traveler rating")}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Sort
          </button>
        </div>
      </div>

      {visibleSections.destinations ? (
        <Section title="Popular Destinations">
          {destinations.map((item) => (
            <button
              type="button"
              key={item.city}
              onClick={() => onPlanDestination(`${item.city}, ${item.country}`)}
              className="group relative h-64 overflow-hidden rounded-3xl text-left shadow-lg transition hover:shadow-2xl hover:shadow-blue-900/10"
            >
              <img className="h-full w-full object-cover transition duration-700 group-hover:scale-110" src={item.image} alt={item.city} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-xl font-bold tracking-tight text-white">{item.city}</h3>
                <p className="mt-1 text-sm font-medium text-slate-200">{item.country}</p>
                <div className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                  Plan this trip
                </div>
              </div>
            </button>
          ))}
        </Section>
      ) : null}

      {visibleSections.things ? (
        <Section title="Things to do">
          {experiences.map((item) => (
            <ExperienceCard key={item.name} item={item} onPlanDestination={onPlanDestination} />
          ))}
        </Section>
      ) : null}

      {visibleSections.hotels ? (
        <Section title="Hotels">
          {hotels.map((item) => (
            <PlaceCard key={item.name} item={item} icon={BedDouble} onPlanDestination={onPlanDestination} />
          ))}
        </Section>
      ) : null}

      {visibleSections.restaurants ? (
        <Section title="Restaurants">
          {restaurants.map((item) => (
            <PlaceCard key={item.name} item={item} icon={Utensils} onPlanDestination={onPlanDestination} />
          ))}
        </Section>
      ) : null}
    </div>
  );
}

function ExperienceCard({ item, onPlanDestination }) {
  return (
    <article className="group relative h-80 overflow-hidden rounded-3xl shadow-lg transition hover:shadow-2xl hover:shadow-blue-900/10">
      <img className="h-full w-full object-cover transition duration-700 group-hover:scale-110" src={item.image} alt={item.name} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
      <button
        type="button"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur transition hover:bg-rose-500"
        title="Save to favorites"
      >
        <Heart className="h-5 w-5" />
      </button>
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <h3 className="text-lg font-bold tracking-tight">{item.name}</h3>
        <p className="mt-1 text-sm font-medium text-slate-300">{item.place}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold">{item.price}</p>
          <button
            type="button"
            onClick={() => onPlanDestination(item.place)}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold transition hover:bg-blue-700"
          >
            Plan nearby
          </button>
        </div>
      </div>
    </article>
  );
}

function PlaceCard({ item, icon: Icon, onPlanDestination }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
      <img className="h-44 w-full object-cover" src={item.image} alt={item.name} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {item.rating}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-950">{item.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <MapPin className="h-4 w-4" />
          {item.place}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-900">{item.price}</p>
          <button
            type="button"
            onClick={() => onPlanDestination(item.place)}
            className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Plan
          </button>
        </div>
      </div>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
        <button type="button" className="group flex items-center gap-1 text-sm font-bold text-blue-600 transition hover:text-blue-700">
          Explore all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
