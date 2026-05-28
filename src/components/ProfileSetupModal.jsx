import { useState, useRef, useCallback } from "react";
import { Camera, User, ArrowRight, Sparkles, X, Upload, Check } from "lucide-react";
import { initials } from "../lib/utils";

const DUMMY_AVATAR = null; // Will use initials-based avatar

function compressImage(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down to maxSize x maxSize
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Draw circular crop background
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with decent quality (keeps size small for Firestore)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileSetupModal({ user, onComplete, onSkip }) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoPreview, setPhotoPreview] = useState(user?.photoURL || "");
  const [photoBase64, setPhotoBase64] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  async function handleSubmit() {
    setSaving(true);
    try {
      await onComplete({
        displayName: displayName.trim() || user?.displayName || "Traveler",
        photoURL: photoBase64 || user?.photoURL || "",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Header gradient */}
        <div className="relative overflow-hidden bg-slate-950 px-8 pb-20 pt-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-transparent to-purple-600/20" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Welcome aboard</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Set up your profile</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Add a photo and name so your trips feel personal. You can always change these later.
            </p>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
            title="Skip for now"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar upload area - overlapping header */}
        <div className="relative -mt-14 px-8">
          <div
            className={`group relative mx-auto h-28 w-28 cursor-pointer transition-transform hover:scale-105 ${dragOver ? "scale-110" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="h-28 w-28 rounded-3xl object-cover shadow-2xl ring-4 ring-white"
              />
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 text-3xl font-bold text-white shadow-2xl ring-4 ring-white">
                {initials(displayName || user?.displayName)}
              </div>
            )}

            {/* Upload overlay */}
            <div className="absolute inset-0 grid place-items-center rounded-3xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="text-center">
                <Camera className="mx-auto h-6 w-6 text-white" />
                <span className="mt-1 block text-[10px] font-bold text-white/80 uppercase tracking-wider">Upload</span>
              </div>
            </div>

            {/* Drag indicator ring */}
            {dragOver && (
              <div className="absolute -inset-2 rounded-[28px] border-2 border-dashed border-blue-400 animate-pulse" />
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {/* Small upload hint */}
          <p className="mt-3 text-center text-xs text-slate-400 font-medium">
            Click or drag & drop to upload
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8 pt-6">
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
                className="h-13 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                style={{ height: "52px" }}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              Skip for now
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
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
