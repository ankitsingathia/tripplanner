import { useState } from "react";
import { User, Map, Globe, Camera, Compass, Award, Settings, Edit3 } from "lucide-react";
import { initials } from "../lib/utils";
import ProfileEditModal from "./ProfileEditModal";

export default function ProfileView({ user, profile, onUpdateProfile }) {
  const [editOpen, setEditOpen] = useState(false);

  const displayName = profile?.displayName || user?.displayName || "Traveler";
  const photoURL = profile?.photoURL || user?.photoURL || "";
  const prefs = profile?.travelPrefs || {};

  const stats = [
    { label: "Trips", value: "12", icon: Map, color: "bg-blue-50 text-blue-600" },
    { label: "Countries", value: "4", icon: Globe, color: "bg-emerald-50 text-emerald-600" },
    { label: "Photos", value: "342", icon: Camera, color: "bg-rose-50 text-rose-600" },
    { label: "Check-ins", value: "81", icon: Compass, color: "bg-amber-50 text-amber-600" }
  ];

  async function handleSaveProfile(data) {
    await onUpdateProfile(data);
    setEditOpen(false);
  }

  return (
    <>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-transparent opacity-50" />
          <div className="relative flex flex-col items-center gap-8 lg:flex-row">
            <div className="group relative">
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt={displayName} 
                  className="h-32 w-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white/10"
                />
              ) : (
                <div className="grid h-32 w-32 place-items-center rounded-3xl bg-blue-600 text-3xl font-bold text-white shadow-2xl ring-4 ring-white/10">
                  {initials(displayName)}
                </div>
              )}
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950 shadow-lg transition hover:scale-110"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight">{displayName}</h1>
              <p className="mt-2 text-lg text-slate-400 font-medium">{user?.email}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold backdrop-blur">
                  <Award className="h-4 w-4 text-amber-400" />
                  Expert Traveler
                </span>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-sm font-bold transition hover:bg-white/10"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-950">{stat.value}</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-950">Travel Style</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <PreferenceItem label="Budget" value={prefs.budget || "Moderate"} />
              <PreferenceItem label="Pace" value={prefs.pace || "Relaxed"} />
              <PreferenceItem label="Interests" value={prefs.interests?.join(", ") || "Food, Culture"} />
              <PreferenceItem label="Group" value={prefs.group || "Solo / Pair"} />
            </div>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Customize Preferences
              <Settings className="h-4 w-4" />
            </button>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-950">Achievements</h2>
            <div className="mt-6 space-y-4">
              <AchievementItem title="First Flight" desc="Booked your first air travel via Wanderly" completed />
              <AchievementItem title="World Citizen" desc="Visit 5 different countries" progress="4/5" />
              <AchievementItem title="Planner Pro" desc="Create 10 successful itineraries" progress="7/10" />
            </div>
          </section>
        </div>
      </div>

      {editOpen && (
        <ProfileEditModal
          user={user}
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

function PreferenceItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function AchievementItem({ title, desc, completed, progress }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
        <Award className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${completed ? 'text-slate-900' : 'text-slate-600'}`}>{title}</p>
        <p className="text-xs text-slate-500 truncate">{desc}</p>
      </div>
      {progress && (
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{progress}</span>
      )}
    </div>
  );
}
