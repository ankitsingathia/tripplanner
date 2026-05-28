import { useState } from "react";
import { Settings, Key, Shield, Bell, Moon, Sun, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SettingsView() {
  const [keys, setKeys] = useState({
    gemini: "",
    firebase: ""
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Settings</h1>
        <p className="mt-2 text-lg text-slate-500">Manage your account preferences and system configuration.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-slate-950">API Configuration</h2>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect your own API keys to enable persistence and real-time AI generation. 
                Keys are stored securely in your browser's local storage.
              </p>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-slate-700">Gemini API Key</label>
                  <input 
                    type="password"
                    placeholder="AIzaSy..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition"
                    value={keys.gemini}
                    onChange={(e) => setKeys({...keys, gemini: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-slate-700">Firebase API Key</label>
                  <input 
                    type="password"
                    placeholder="AIzaSy..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition"
                    value={keys.firebase}
                    onChange={(e) => setKeys({...keys, firebase: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  {saved && (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Changes saved successfully
                    </>
                  )}
                </div>
                <button type="submit" className="flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-slate-950">App Preferences</h2>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <ToggleRow 
                icon={Bell} 
                title="Notifications" 
                desc="Get alerts about upcoming flights and bookings." 
                enabled 
              />
              <ToggleRow 
                icon={Moon} 
                title="Dark Mode" 
                desc="Adjust the theme to your preference." 
              />
              <ToggleRow 
                icon={Shield} 
                title="Privacy Mode" 
                desc="Hide your trip locations from featured lists." 
                enabled 
              />
            </div>
          </section>
        </div>

        <nav className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-600 ring-1 ring-blue-100">
            <Settings className="h-4 w-4" />
            General
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-sm font-bold text-slate-500 transition hover:bg-slate-50">
            <Shield className="h-4 w-4" />
            Account
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-sm font-bold text-slate-500 transition hover:bg-slate-50">
            <Bell className="h-4 w-4" />
            Notifications
          </button>
        </nav>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, desc, enabled }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <button className={`relative h-6 w-11 shrink-0 rounded-full transition duration-200 ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition duration-200 ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
