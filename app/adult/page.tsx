'use client';

import { useState, useEffect } from 'react';
import { useAddonStore } from '@/store/useAddonStore';
import { CatalogAggregator } from '@/lib/stremio/aggregator';
import { MediaCard } from '@/components/MediaCard';
import { MediaCardSkeleton } from '@/components/MediaCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

export default function AdultPage() {
  const [verified, setVerified] = useState(false);
  const addons = useAddonStore((state) => state.addons);
  const nsfwEnabled = useAddonStore((state) => state.nsfwEnabled);
  const setNsfwEnabled = useAddonStore((state) => state.setNsfwEnabled);
  
  // Get all addons that are categorized as adult or classified as NSFW
  const adultAddons = addons
    .filter(a => a.category === 'adult' || a.category === 'hentai')
    .map(a => a.url);

  const { data, isLoading } = useQuery({
    queryKey: ['catalog-adult', adultAddons],
    queryFn: () => CatalogAggregator.getUnifiedCatalog(adultAddons, 'movie', 'top'),
    enabled: verified && adultAddons.length > 0,
  });

  if (!verified) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] space-y-8 text-center animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto ring-8 ring-red-500/10">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black italic tracking-tighter">RESTRICTED AREA</h1>
            <p className="text-muted-foreground font-medium leading-relaxed">
              This section contains adult content intended for users 18 years of age or older.
            </p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setVerified(true);
                setNsfwEnabled(true);
              }}
              className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-red-500/20"
            >
              I am 18 or older
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-5 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
            >
              Exit to Home
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-50">
            Secure & Private Access Only
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-12 space-y-12 animate-in fade-in duration-1000">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/20 border border-red-500/20 rounded-full">
          <Lock className="h-4 w-4 text-red-500" />
          <span className="text-xs font-black uppercase tracking-widest text-red-500">Secured Adult Content</span>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter">ADULT COLLECTION</h1>
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
           <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">No items found in this section</p>
        </div>
      )}
    </main>
  );
}
