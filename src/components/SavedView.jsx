import { Bookmark, MapPin, Star, Heart, ArrowUpRight } from "lucide-react";
import { fallbackImages } from "../data/fallbackImages";

const savedItems = [
  {
    id: "s1",
    title: "Kyoto Tea Houses",
    location: "Kyoto, Japan",
    image: fallbackImages.bali, // Placeholder
    category: "Experience",
    rating: 4.9
  },
  {
    id: "s2",
    title: "Eiffel Tower Dinner",
    location: "Paris, France",
    image: fallbackImages.paris,
    category: "Restaurant",
    rating: 4.8
  },
  {
    id: "s3",
    title: "Oia Sunset Spot",
    location: "Santorini, Greece",
    image: fallbackImages.santorini,
    category: "Sights",
    rating: 5.0
  }
];

export default function SavedView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Saved</h1>
        <p className="mt-2 text-lg text-slate-500">Your curated collection of favorite spots and trips.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button className="border-b-2 border-blue-600 pb-3 text-sm font-bold text-blue-600">All Items</button>
        <button className="pb-3 text-sm font-bold text-slate-400 transition hover:text-slate-600">Trips</button>
        <button className="pb-3 text-sm font-bold text-slate-400 transition hover:text-slate-600">Hotels</button>
        <button className="pb-3 text-sm font-bold text-slate-400 transition hover:text-slate-600">Dining</button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {savedItems.map((item) => (
          <article key={item.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title} 
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-rose-500 shadow-lg transition hover:scale-110">
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>
            
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                {item.category}
              </div>
              <h3 className="mt-2 text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" />
                {item.location}
              </div>
              
              <div className="mt-auto pt-5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-900">{item.rating}</span>
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-950 transition hover:bg-blue-600 hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
