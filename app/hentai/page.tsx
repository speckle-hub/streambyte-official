'use client';

import { useState } from 'react';
import { useAddonStore } from '@/store/useAddonStore';
import { CatalogAggregator } from '@/lib/stremio/aggregator';
import { MediaCard } from '@/components/MediaCard';
import { MediaCardSkeleton } from '@/components/MediaCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Ghost, AlertTriangle } from 'lucide-react';

export default function HentaiPage() {
  const [verified, setVerified] = useState(false);
  const addons = useAddonStore((state) => state.addons);
  const setNsfwEnabled = useAddonStore((state) => state.setNsfwEnabled);
  
  const hentaiAddons = addons
    .filter(a => a.category === 'hentai' || a.url.includes('hentaistream') || a.url.includes('hanime') || a.url.includes('hianime'))
    .map(a => a.url);

  const { data, isLoading } = useQuery({
    queryKey: ['catalog-hentai', hentaiAddons],
    queryFn: () => CatalogAggregator.getUnifiedCatalog(hentaiAddons, 'series', 'top'),
    enabled: verified && hentaiAddons.length > 0,
  });

  if (!verified) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6 bg-gradient-to-br from-background to-purple-900/10">
        <div className="max-w-md w-full p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] space-y-8 text-center animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(168,85,247,0.1)]">
          <div className="h-24 w-24 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto ring-8 ring-purple-500/10">
            <ShieldAlert className="h-12 w-12 text-purple-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black italic tracking-tighter">HENTAI VAULT</h1>
            <p className="text-muted-foreground font-medium">
              You must be 18+ to view the anime collection in this vault.
            </p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setVerified(true);
                setNsfwEnabled(true);
              }}
              className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-purple-500/20"
            >
              Enter Vault
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-5 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-12 space-y-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-500/20 border border-purple-500/20 rounded-full">
          <Ghost className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-black uppercase tracking-widest text-purple-500">Uncensored Anime Vault</span>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter">HENTAI SERIES</h1>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => <MediaCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {(data || []).map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-6 text-center">
           <AlertTriangle className="h-12 w-12 text-muted-foreground opacity-20" />
           <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">Vault is currently empty</p>
        </div>
      )}
    </main>
  );
}
