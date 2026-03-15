'use client';

import { useAddonStore } from '@/store/useAddonStore';
import { 
  Monitor, 
  Shield, 
  Trash2, 
  History, 
  Cpu, 
  Zap, 
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme, nsfwEnabled, setNsfwEnabled, watchHistory, addons } = useAddonStore();

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-background selection:bg-primary/30 scroll-smooth">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Settings</h1>
          <p className="text-muted-foreground">Configure your preference, security, and application behavior.</p>
        </div>

        {/* Content & Privacy */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Shield className="h-6 w-6 text-primary" />
             <h2 className="text-xl font-black italic uppercase tracking-tight">Privacy & Safety</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
               <div className="space-y-1">
                 <h3 className="font-bold uppercase tracking-tight">Adult Content (NSFW)</h3>
                 <p className="text-xs text-muted-foreground">Enable adult-rated addons and filter out adult content results.</p>
               </div>
               <button 
                 onClick={() => setNsfwEnabled(!nsfwEnabled)}
                 className={cn(
                   "w-16 h-8 rounded-full transition-all relative p-1",
                   nsfwEnabled ? "bg-primary shadow-lg shadow-primary/20" : "bg-zinc-800"
                 )}
               >
                 <div className={cn(
                   "h-6 w-6 bg-white rounded-full transition-all shadow-md",
                   nsfwEnabled ? "translate-x-8" : "translate-x-0"
                 )} />
               </button>
            </div>

            {!nsfwEnabled && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-500/80 font-medium">
                  NSFW content is currently hidden. Enabling this will show adult-rated metadata and addons.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Monitor className="h-6 w-6 text-primary" />
             <h2 className="text-xl font-black italic uppercase tracking-tight">Appearance</h2>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setTheme('dark')}
              className={cn(
                "flex-1 p-6 rounded-2xl border transition-all text-left space-y-2",
                theme === 'dark' ? "bg-primary/10 border-primary" : "bg-zinc-900 border-white/5 opacity-50"
              )}
            >
              <div className="h-4 w-4 rounded-full bg-primary" />
              <h3 className="font-bold uppercase">Dark Mode</h3>
              <p className="text-[10px] text-muted-foreground">Premium cinema experience</p>
            </button>
            <button 
              onClick={() => setTheme('light')}
              disabled
              className="flex-1 p-6 rounded-2xl border border-white/5 bg-zinc-900 opacity-20 cursor-not-allowed text-left space-y-2"
            >
              <div className="h-4 w-4 rounded-full bg-zinc-400" />
              <h3 className="font-bold uppercase">Light Mode</h3>
              <p className="text-[10px] text-muted-foreground">Coming soon</p>
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 space-y-2">
             <History className="h-5 w-5 text-primary" />
             <h4 className="text-2xl font-black italic tracking-tighter">{watchHistory.length}</h4>
             <p className="text-[10px] uppercase font-bold text-muted-foreground">Movies Watched</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 space-y-2">
             <Layers className="h-5 w-5 text-primary" />
             <h4 className="text-2xl font-black italic tracking-tighter">{addons.length}</h4>
             <p className="text-[10px] uppercase font-bold text-muted-foreground">Active Addons</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 space-y-2">
             <Zap className="h-5 w-5 text-primary" />
             <h4 className="text-2xl font-black italic tracking-tighter">
               {addons.filter(a => a.enabled).length}
             </h4>
             <p className="text-[10px] uppercase font-bold text-muted-foreground">Enabled Sources</p>
          </div>
        </section>

        {/* System Info */}
        <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 divide-y divide-white/5">
          <div className="flex items-center justify-between py-4">
             <div className="flex items-center gap-3">
               <Cpu className="h-5 w-5 text-muted-foreground" />
               <span className="text-sm font-medium">Application Version</span>
             </div>
             <span className="text-xs font-mono text-muted-foreground">v3.0.0-gold</span>
          </div>
          <div className="flex items-center justify-between py-4">
             <div className="flex items-center gap-3">
               <CheckCircle2 className="h-5 w-5 text-emerald-500" />
               <span className="text-sm font-medium">Addon Engine</span>
             </div>
             <span className="text-xs font-bold text-emerald-500 uppercase italic">Core Protocol v3</span>
          </div>
        </section>

        <div className="pt-10 flex justify-center">
           <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600">
             ProjectMovie &bull; Advanced Agentic Coding &bull; 2024
           </p>
        </div>
      </div>
    </main>
  );
}
