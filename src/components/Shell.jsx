import {
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  Compass,
  Home,
  Hotel,
  LogOut,
  Plane,
  Plus,
  Search,
  Settings,
  User,
  WalletCards
} from "lucide-react";
import { cn, initials } from "../lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "trips", label: "Trips", icon: Hotel },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "bookings", label: "Bookings", icon: WalletCards },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings }
];

export default function Shell({
  activeView,
  onViewChange,
  onNewTrip,
  onLogout,
  user,
  children
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 selection:bg-blue-500/30">
      <div className="mx-auto flex min-h-screen max-w-[1800px] border-x border-slate-200 bg-white">
        <aside className="hidden w-[280px] shrink-0 border-r border-slate-200 bg-white px-4 py-8 lg:block">
          <button
            type="button"
            onClick={() => onViewChange("home")}
            className="mb-12 flex items-center gap-3 px-4 text-2xl font-bold tracking-tight text-slate-900 transition hover:opacity-80 active:scale-95"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Plane className="h-5.5 w-5.5" />
            </span>
            Wanderly
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "group flex h-12 w-full items-center gap-4 rounded-xl px-5 text-left text-sm font-bold transition-all",
                  activeView === item.id
                    ? "bg-slate-950 text-white shadow-xl shadow-slate-900/10 active:scale-95"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  activeView === item.id ? "text-blue-400" : "text-slate-400"
                )} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-20 relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-100 opacity-20" />
            <p className="relative z-10 text-sm font-bold text-blue-700">Need inspiration?</p>
            <p className="relative z-10 mt-2 text-xs leading-5 text-slate-500 font-medium">
              Let Gemini AI craft your perfect itinerary in seconds.
            </p>
            <button
              type="button"
              onClick={onNewTrip}
              className="relative z-10 mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Adventure
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[86px] items-center gap-6 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl lg:px-12">
            <div className="relative hidden w-full max-w-xl sm:block group">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Search destinations, stays, routes..."
              />
            </div>
            
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 active:scale-95"
                title="Notifications"
              >
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                </div>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-3 pl-1">
                <button
                  type="button"
                  onClick={() => onViewChange("profile")}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-1.5 pr-4 transition hover:border-slate-200 hover:shadow-sm active:scale-95"
                >
                  {user.photoURL ? (
                    <img
                      className="h-9 w-9 rounded-lg object-cover shadow-sm"
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                      {initials(user.displayName)}
                    </span>
                  )}
                  <div className="hidden text-left md:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user.displayName || "Traveler"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pro Pilot
                    </p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 active:scale-95"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="px-6 py-10 lg:px-12 animate-in fade-in duration-500">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
