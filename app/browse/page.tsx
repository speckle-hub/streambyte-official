'use client';

import { useAddonStore } from '@/store/useAddonStore';
import { CatalogAggregator } from '@/lib/stremio/aggregator';
import { MediaCard } from '@/components/MediaCard';
import { MediaCardSkeleton } from '@/components/MediaCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { Compass, Film, Tv } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { isNSFWItem } from '@/lib/contentFilter';

export default function BrowsePage() {
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const enabledAddons = useAddonStore((state) => state.getEnabledAddons());
  const nsfwEnabled = useAddonStore((state) => state.nsfwEnabled);

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['catalog-browse', type, enabledAddons],
    queryFn: () => CatalogAggregator.getUnifiedCatalog(enabledAddons, type, 'top'),
    enabled: enabledAddons.length > 0,
  });

  const data = (rawData || []).filter(item => nsfwEnabled || !isNSFWItem(item));

  return (
    <main className="min-h-screen bg-background p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/20 border border-primary/20 rounded-full">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Infinite Catalog</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">Browse {type}s</h1>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10">
          <button 
            onClick={() => setType('movie')}
            className={cn(
              "px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-black tracking-widest transition-all",
              type === 'movie' ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:text-white"
            )}
          >
            <Film className="h-4 w-4" /> MOVIES
          </button>
          <button 
            onClick={() => setType('series')}
            className={cn(
              "px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-black tracking-widest transition-all",
              type === 'series' ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:text-white"
            )}
          >
            <Tv className="h-4 w-4" /> SERIES
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(18)].map((_, i) => <MediaCardSkeleton key={i} />)}
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
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
             <Compass className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter">No results found in {type}s</h2>
        </div>
      )}
    </main>
  );
}
