'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Filter, History, Trash2, ArrowRight } from 'lucide-react';
import { useAddonStore } from '@/store/useAddonStore';
import { StremioAddon } from '@/lib/stremio/client';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { MediaCard } from '@/components/MediaCard';
import { MediaCardSkeleton } from '@/components/MediaCardSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'movie' | 'series'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  
  const enabledAddons = useAddonStore((state) => state.getEnabledAddons());
  const nsfwEnabled = useAddonStore((state) => state.nsfwEnabled);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['full-search', debouncedQuery, enabledAddons],
    queryFn: async ({ signal }) => {
      if (!debouncedQuery) return [];
      const results = await StremioAddon.searchAddons(enabledAddons, debouncedQuery);
      
      // Save to recent if we have results
      if (results.length > 0 && !recentSearches.includes(debouncedQuery)) {
        const newRecent = [debouncedQuery, ...recentSearches].slice(0, 10);
        setRecentSearches(newRecent);
        localStorage.setItem('recent-searches', JSON.stringify(newRecent));
      }
      return results;
    },
    enabled: debouncedQuery.length > 2,
  });

  const filteredResults = data?.filter(item => {
    const isTypeMatch = type === 'all' || item.type === type;
    if (!isTypeMatch) return false;
    
    if (nsfwEnabled) return true;
    const lowerDescription = (item.description || '').toLowerCase();
    const lowerName = item.name.toLowerCase();
    const nsfwKeywords = ['nsfw', 'adult', 'xxx', 'porn', 'hentai', 'sexy', 'erotic'];
    return !nsfwKeywords.some(keyword => lowerName.includes(keyword) || lowerDescription.includes(keyword));
  });

  const removeRecent = (s: string) => {
    const newRecent = recentSearches.filter(i => i !== s);
    setRecentSearches(newRecent);
    localStorage.setItem('recent-searches', JSON.stringify(newRecent));
  };

  return (
    <div className="min-h-screen pt-24 px-8 pb-12 bg-background selection:bg-primary/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Search Header */}
        <div className="flex flex-col gap-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground group-focus-within:text-primary transition-all scale-90 group-focus-within:scale-100" />
            <input
              autoFocus
              type="text"
              placeholder="What are we watching today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-24 bg-card border-2 border-border focus:border-primary/50 rounded-[2.5rem] pl-20 pr-32 outline-none text-3xl font-black transition-all shadow-2xl shadow-primary/5 focus:shadow-primary/10"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 h-12 w-12 bg-muted hover:bg-muted/80 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {(['all', 'movie', 'series'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all",
                    type === t 
                      ? "bg-primary text-white shadow-xl shadow-primary/30" 
                      : "bg-card border border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results / Suggestions */}
        <ErrorBoundary>
          {!debouncedQuery ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {recentSearches.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                       <History className="h-5 w-5 text-primary" />
                       Recent Searches
                    </h2>
                    <button 
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('recent-searches');
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {recentSearches.map((s) => (
                      <div key={s} className="group flex items-center bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-lg">
                        <button 
                          onClick={() => setQuery(s)}
                          className="px-5 py-3 text-sm font-bold truncate max-w-[200px]"
                        >
                          {s}
                        </button>
                        <button 
                          onClick={() => removeRecent(s)}
                          className="h-full px-3 border-l border-border hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-card border border-border rounded-[2rem] space-y-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Filter className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Smart Filtering</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Narrow down your results by movies or series to find exactly what you want.</p>
                </div>
                {/* More suggestions cards can go here */}
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredResults && filteredResults.length > 0 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground italic">Found {filteredResults.length} Results</p>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredResults.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-32 text-center space-y-6">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter">No results found across your addons</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Try a different keyword or install more addons to expand your library.</p>
              <button 
                onClick={() => window.location.href = '/addons'}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"
              >
                Go to Addon Manager
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
