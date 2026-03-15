'use client';

import { useAddonStore } from '@/store/useAddonStore';
import { CatalogAggregator } from '@/lib/stremio/aggregator';
import { MediaCard } from '@/components/MediaCard';
import { MediaCardSkeleton } from '@/components/MediaCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { Tv } from 'lucide-react';
import { isNSFWItem } from '@/lib/contentFilter';

export default function SeriesPage() {
  const enabledAddons = useAddonStore((state) => state.getEnabledAddons());
  const nsfwEnabled = useAddonStore((state) => state.nsfwEnabled);

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['catalog-series-page', enabledAddons],
    queryFn: () => CatalogAggregator.getUnifiedCatalog(enabledAddons, 'series', 'top'),
    enabled: enabledAddons.length > 0,
  });

  const data = (rawData || []).filter(item => nsfwEnabled || !isNSFWItem(item));

  return (
    <main className="min-h-screen bg-background p-12 space-y-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/20 border border-primary/20 rounded-full">
          <Tv className="h-4 w-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-primary">TV Collection</span>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter">SERIES</h1>
        <p className="text-muted-foreground font-medium max-w-2xl">
          Binge-worthy series and trending TV shows across all your streaming sources.
        </p>
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
        <div className="h-[50vh] flex flex-col items-center justify-center space-y-6 text-center">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
             <Tv className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black italic tracking-tighter">No Series Found</h2>
            <p className="text-muted-foreground text-sm">Try installing more addons in the Addon Manager.</p>
          </div>
        </div>
      )}
    </main>
  );
}
