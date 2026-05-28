import { useState, useEffect } from "react";
import { ArrowRight, Compass, Loader2, MapPinned, Plane, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginWithGoogle, isFirebaseConfigured } from "../services/firebase";

export default function LoginPage({ onDemoLogin }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    firebase: isFirebaseConfigured,
    gemini: false // Will check on mount
  });

  useEffect(() => {
    // Quick health check to see if API is ready
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        setStatus(prev => ({ ...prev, gemini: data.geminiConfigured }));
      })
      .catch(() => {});
  }, []);

  async function handleGoogleLogin() {
    setError("");

    if (!isFirebaseConfigured) {
      setError("Firebase keys are missing in your .env file. Use Demo Mode for now.");
      return;
    }

    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (loginError) {
      setError(getFriendlyLoginError(loginError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex items-center overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-40 scale-105 animate-pulse-slow"
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=85"
            alt="Scenic travel destination"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-blue-900/30" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="mb-12 inline-flex items-center gap-3 text-2xl font-bold tracking-tight">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <Plane className="h-6 w-6 text-white" />
              </span>
              Wanderly.ai
            </div>
            
            <h1 className="max-w-xl text-6xl font-bold leading-[1.1] sm:text-7xl">
              Plan <span className="text-blue-400">smarter</span>,<br />travel deeper.
            </h1>
            
            <p className="mt-8 max-w-lg text-xl leading-relaxed text-slate-300">
              The next generation of travel planning. Powered by Gemini AI and 
              real-time open map data to build routes that actually make sense.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                ["AI Routing", Compass, "Gemini Pro"],
                ["Open Maps", MapPinned, "Nominatim"],
                ["Cloud Sync", ShieldCheck, "Firebase"]
              ].map(([label, Icon, tech]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition hover:bg-white/10">
                  <Icon className="h-6 w-6 text-blue-400" />
                  <p className="mt-4 text-sm font-semibold text-white">{label}</p>
                  <p className="mt-1 text-xs text-slate-400">{tech}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center bg-white px-8 py-12 text-slate-950 sm:px-16 lg:px-24">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-4xl font-bold tracking-tight">Welcome</h2>
              <p className="mt-4 text-lg text-slate-500 leading-relaxed">
                Experience the world's most intelligent trip planner. Sign in to save your adventures.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-slate-200 bg-white px-4 font-semibold text-slate-800 transition-all hover:border-blue-600 hover:bg-blue-50/30 hover:text-blue-600 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : <GoogleMark />}
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={onDemoLogin}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 font-semibold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                <span>Try Demo Mode</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {error ? (
              <div className="mt-6 flex gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            ) : null}

            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <div className="h-px flex-1 bg-slate-100" />
                <span>System Configuration</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatusItem 
                  label="Firebase Auth" 
                  ready={status.firebase} 
                  desc={status.firebase ? "Ready" : "Not Linked"} 
                />
                <StatusItem 
                  label="AI Intelligence" 
                  ready={status.gemini} 
                  desc={status.gemini ? "Online" : "Check .env"} 
                />
              </div>

              {!status.firebase && (
                <p className="text-center text-xs text-slate-400 leading-relaxed italic">
                  Note: Google Login requires Firebase keys. Use Demo Mode to explore all features instantly.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusItem({ label, ready, desc }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 transition ${ready ? 'border-emerald-100 bg-emerald-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
      {ready ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-amber-600" />
      )}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`text-xs font-semibold ${ready ? 'text-emerald-700' : 'text-amber-700'}`}>{desc}</p>
      </div>
    </div>
  );
}

function getFriendlyLoginError(error) {
  const code = error?.code || "";
  if (code === "auth/unauthorized-domain") return "Domain blocked. Add localhost in Firebase Console.";
  if (code === "auth/operation-not-allowed") return "Google Login not enabled in Firebase.";
  if (code === "auth/invalid-api-key") return "Invalid Firebase API key in .env.";
  if (code === "auth/popup-closed-by-user") return "Login window closed.";
  return error?.message || "Login failed.";
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
