'use client';

import { CatalogAggregator } from '@/lib/stremio/aggregator';
import { useAddonStore } from '@/store/useAddonStore';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { MediaCard } from '@/components/MediaCard';
import { MediaCardSkeleton } from '@/components/MediaCardSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, History, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CatalogItem } from '@/lib/stremio/types';
import { isNSFWItem } from '@/lib/contentFilter';

export default function Home() {
  const enabledAddons = useAddonStore((state) => state.getEnabledAddons());
  const nsfwEnabled = useAddonStore((state) => state.nsfwEnabled);
  const watchlist = useWatchlistStore((state) => state.items);
  const history = useHistoryStore((state) => state.history);

  const filterContent = (items: CatalogItem[] | undefined) => {
    if (!items) return [];
    if (nsfwEnabled) return items;
    return items.filter(item => !isNSFWItem(item));
  };

  const { data: rawMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ['catalog-movies', enabledAddons],
    queryFn: () => CatalogAggregator.getUnifiedCatalog(enabledAddons, 'movie', 'top'),
    enabled: enabledAddons.length > 0,
  });

  const { data: rawSeries, isLoading: seriesLoading } = useQuery({
    queryKey: ['catalog-series', enabledAddons],
    queryFn: () => CatalogAggregator.getUnifiedCatalog(enabledAddons, 'series', 'top'),
    enabled: enabledAddons.length > 0,
  });

  const movies = filterContent(rawMovies);
  const series = filterContent(rawSeries);

  return (
    <main className="min-h-screen bg-background pb-20 selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center px-12 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
         
         {/* Animated Background Placeholder */}
         <div className="absolute inset-0 z-0 bg-muted/20 animate-pulse" />

         <div className="relative z-20 max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/20 backdrop-blur-xl border border-primary/20 rounded-full">
             <Sparkles className="h-4 w-4 text-primary" />
             <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Discover the Infinite</span>
           </div>
           <h1 className="text-8xl font-black italic tracking-tighter leading-[0.9]">
             UNLIMITED <br /> 
             <span className="text-primary drop-shadow-[0_0_30px_rgba(255,0,0,0.3)]">CONTENT</span>.
           </h1>
           <p className="text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">
             Aggregated from the world&apos;s best Stremio addons. High quality streams, zero limits.
           </p>
           <div className="flex items-center gap-4">
             <Link href="/search" className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40">
               Start Exploring
             </Link>
             <Link href="/addons" className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all">
               Manage Addons
             </Link>
           </div>
         </div>
      </section>

      <div className="px-12 -mt-32 relative z-30 space-y-16">
        {/* Continue Watching Section */}
        {history.length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                <History className="h-8 w-8 text-primary" />
                Continue Watching
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {history.slice(0, 6).map((item: any) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* My List Section */}
        {watchlist.length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                My List
              </h2>
              <Link href="/my-list" className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {watchlist.slice(0, 6).map((item: CatalogItem) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Movies Catalog */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black italic tracking-tighter">Recommended Movies</h2>
          <ErrorBoundary>
            {moviesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => <MediaCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {(movies || []).slice(0, 12).map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </ErrorBoundary>
        </section>

        {/* Series Catalog */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black italic tracking-tighter">Popular Series</h2>
          <ErrorBoundary>
            {seriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => <MediaCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {(series || []).slice(0, 12).map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </ErrorBoundary>
        </section>
      </div>
    </main>
  );
}
