'use client';

import { useAddonStore, InstalledAddon } from '@/store/useAddonStore';
import { StremioAddon, PRESET_ADDONS } from '@/lib/stremio/client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, ShieldCheck, AlertCircle, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AddonsPage() {
  const { addons, installAddon, removeAddon, toggleAddon, setAddonPriority, installPresetPack, nsfwEnabled } = useAddonStore();
  const [newAddonUrl, setNewAddonUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'failed'>>({});

  const handleInstall = async () => {
    try {
      const url = newAddonUrl.trim().replace('stremio://', 'https://');
      if (!url) return;
      
      const client = new StremioAddon(url);
      const manifest = await client.fetchManifest();
      if (!manifest) throw new Error('Invalid manifest');
      
      installAddon(url);
      setNewAddonUrl('');
      setError(null);
    } catch (e) {
      setError('Invalid manifest URL or addon unavailable.');
    }
  };

  const handleTestConnection = async (url: string) => {
    setTestResults(prev => ({ ...prev, [url]: 'testing' }));
    const addon = new StremioAddon(url);
    const success = await addon.testConnection();
    setTestResults(prev => ({ ...prev, [url]: success ? 'success' : 'failed' }));
    setTimeout(() => {
      setTestResults(prev => {
        const next = { ...prev };
        delete next[url];
        return next;
      });
    }, 3000);
  };

  const sortedAddons = [...addons].sort((a, b) => a.priority - b.priority);

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-background selection:bg-primary/30 scroll-smooth">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Addon Manager</h1>
          <p className="text-muted-foreground">Manage your content sources and addon priority.</p>
        </div>

        {/* Presets Section */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <Plus className="h-6 w-6 text-primary" />
              Quick Install Packs
            </h2>
            <p className="text-sm text-muted-foreground">Bulk install curated addon collections for the best experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['movies', 'anime', 'adult'] as const).map((pack) => (
              <button
                key={pack}
                onClick={() => installPresetPack(pack)}
                disabled={!nsfwEnabled && pack === 'adult'}
                className={cn(
                  "p-6 rounded-2xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-primary/50 transition-all text-left flex flex-col gap-4 group relative overflow-hidden",
                  !nsfwEnabled && pack === 'adult' && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight capitalize">{pack} Pack</h3>
                <p className="text-xs text-muted-foreground">
                  Includes {PRESET_ADDONS[pack].length} essential addons for {pack}.
                </p>
                {pack === 'adult' && !nsfwEnabled && (
                  <p className="text-[10px] text-red-500 font-bold uppercase italic mt-1">Enable NSFW in Settings to install</p>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-primary/5 p-8 border border-primary/10 flex flex-col gap-6">
          <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase">
            <Plus className="h-5 w-5 text-primary" /> Install New Addon
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newAddonUrl}
              onChange={(e) => setNewAddonUrl(e.target.value)}
              placeholder="Paste manifest.json URL"
              className="flex-1 h-14 rounded-2xl bg-background border border-border px-6 focus:ring-2 focus:ring-primary outline-none text-lg transition-all"
            />
            <button
              onClick={handleInstall}
              className="px-10 h-14 rounded-2xl bg-primary text-primary-foreground font-black hover:bg-primary/90 transition-all flex items-center gap-2 uppercase italic tracking-wider"
            >
              Install
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4">
          <h2 className="text-xl font-bold italic uppercase tracking-tight mb-2">Installed Addons ({addons.length})</h2>
          {sortedAddons.map((addon) => (
            <AddonItem 
              key={addon.url} 
              addon={addon} 
              onRemove={removeAddon} 
              onToggle={toggleAddon}
              onPriorityChange={setAddonPriority}
              onTestConnection={handleTestConnection}
              testStatus={testResults[addon.url]}
            />
          ))}
        </section>
      </div>
    </main>
  );
}

function AddonItem({ 
  addon, 
  onRemove, 
  onToggle, 
  onPriorityChange,
  onTestConnection,
  testStatus
}: { 
  addon: InstalledAddon; 
  onRemove: (url: string) => void;
  onToggle: (url: string) => void;
  onPriorityChange: (url: string, priority: number) => void;
  onTestConnection: (url: string) => void;
  testStatus?: 'testing' | 'success' | 'failed';
}) {
  const [manifest, setManifest] = useState<any>(null);
  const { url, enabled, priority, category } = addon;

  useEffect(() => {
    const client = new StremioAddon(url);
    client.fetchManifest().then(setManifest).catch(() => {});
  }, [url]);

  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all flex items-center justify-between gap-4 group",
      enabled ? "bg-card border-border hover:border-primary/30" : "bg-muted/30 border-dashed border-border opacity-60"
    )}>
      <div className="flex items-center gap-6 flex-1">
        {/* Priority Controls */}
        <div className="flex flex-col gap-1">
           <button onClick={() => onPriorityChange(url, priority - 1)} className="p-1 hover:text-primary transition-colors">
              <ArrowUp className="h-4 w-4" />
           </button>
           <span className="text-[10px] font-black text-center text-zinc-500">{priority}</span>
           <button onClick={() => onPriorityChange(url, priority + 1)} className="p-1 hover:text-primary transition-colors">
              <ArrowDown className="h-4 w-4" />
           </button>
        </div>

        <div className="h-16 w-16 rounded-xl bg-zinc-900 overflow-hidden relative border border-border flex-shrink-0">
          {manifest?.logo ? (
            <Image src={manifest.logo} alt={manifest.name} fill className="object-cover" />
          ) : (
            <ShieldCheck className="h-full w-full p-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold flex items-center gap-2">
            {manifest?.name || 'Loading Addon...'}
            {Object.values(PRESET_ADDONS).flat().includes(url) && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Official</span>
            )}
            {category && (
              <span className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {category}
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[400px]">
            {manifest?.description || url}
          </p>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[10px] font-mono text-zinc-500">{manifest?.version}</span>
             {manifest?.types && (
               <div className="flex gap-1">
                  {manifest.types.slice(0, 3).map((t: string) => (
                    <span key={t} className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 uppercase font-bold">{t}</span>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button
          onClick={() => onTestConnection(url)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center gap-2 uppercase tracking-tighter",
            testStatus === 'success' ? "bg-green-500/10 text-green-500 border-green-500/20" :
            testStatus === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" :
            "bg-white/5 hover:bg-white/10 text-muted-foreground"
          )}
        >
          {testStatus === 'testing' ? "Testing..." : 
           testStatus === 'success' ? "Online" :
           testStatus === 'failed' ? "Offline" : "Check Status"}
        </button>

        <button 
          onClick={() => onToggle(url)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-tighter",
            enabled ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          )}
        >
          {enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {enabled ? 'Enabled' : 'Disabled'}
        </button>

        <div className="flex gap-1 border-l border-border pl-4">
          <button 
            onClick={() => onRemove(url)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            title="Remove Addon"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="External Link"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
