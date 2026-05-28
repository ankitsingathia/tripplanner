import { useState, useRef, useCallback } from "react";
import { Camera, User, X, Check, Trash2, MapPin, Heart, Users, Wallet } from "lucide-react";
import { initials } from "../lib/utils";

function compressImage(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const budgetOptions = ["Budget", "Moderate", "Premium", "Luxury"];
const paceOptions = ["Relaxed", "Balanced", "Fast-paced"];
const groupOptions = ["Solo", "Pair", "Family", "Group"];
const interestOptions = ["Food", "Culture", "Adventure", "Nature", "Shopping", "Nightlife", "History", "Wellness"];

export default function ProfileEditModal({ user, profile, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || "");
  const [photoPreview, setPhotoPreview] = useState(profile?.photoURL || user?.photoURL || "");
  const [photoBase64, setPhotoBase64] = useState("");
  const [budget, setBudget] = useState(profile?.travelPrefs?.budget || "Moderate");
  const [pace, setPace] = useState(profile?.travelPrefs?.pace || "Relaxed");
  const [group, setGroup] = useState(profile?.travelPrefs?.group || "Solo");
  const [interests, setInterests] = useState(profile?.travelPrefs?.interests || ["Food", "Culture"]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file, 256);
      setPhotoPreview(compressed);
      setPhotoBase64(compressed);
    } catch {
      // Silently fail
    }
  }, []);

  function toggleInterest(interest) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  function removePhoto() {
    setPhotoPreview("");
    setPhotoBase64("__removed__");
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const updatedProfile = {
        displayName: displayName.trim() || user?.displayName || "Traveler",
        travelPrefs: { budget, pace, group, interests },
      };

      // Only include photo if it was changed
      if (photoBase64 === "__removed__") {
        updatedProfile.photoURL = "";
      } else if (photoBase64) {
        updatedProfile.photoURL = photoBase64;
      }

      await onSave(updatedProfile);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Travel Style", icon: Heart },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative mx-4 w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 px-8 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-slate-950 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-8 py-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Photo section */}
              <div className="flex items-center gap-6">
                <div
                  className="group relative h-24 w-24 shrink-0 cursor-pointer transition-transform hover:scale-105"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg ring-2 ring-slate-100">
                      {initials(displayName || user?.displayName)}
                    </div>
                  )}
                  <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Change Photo
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                  Display Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="h-[52px] w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                  Email
                </label>
                <div className="flex h-[52px] items-center rounded-xl border-2 border-slate-100 bg-slate-50 px-4 text-sm text-slate-500">
                  {user?.email || "demo@wanderly.app"}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">Email is managed by your Google account</p>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Budget */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Wallet className="h-3.5 w-3.5" />
                  Budget Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {budgetOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBudget(opt)}
                      className={`rounded-xl border-2 py-3 text-xs font-bold transition ${
                        budget === opt
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Travel Pace
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paceOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPace(opt)}
                      className={`rounded-xl border-2 py-3 text-xs font-bold transition ${
                        pace === opt
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  Group Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {groupOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setGroup(opt)}
                      className={`rounded-xl border-2 py-3 text-xs font-bold transition ${
                        group === opt
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Heart className="h-3.5 w-3.5" />
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterest(opt)}
                      className={`rounded-full border-2 px-4 py-2 text-xs font-bold transition ${
                        interests.includes(opt)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {interests.includes(opt) && <Check className="mr-1 inline h-3 w-3" />}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
