'use client';

import { Search, Bell, Settings, User, Loader2, ChevronRight, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAddonStore } from '@/store/useAddonStore';
import { StremioAddon } from '@/lib/stremio/client';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const enabledAddons = useAddonStore((state) => state.getEnabledAddons());
  const nsfwEnabled = useAddonStore((state) => state.nsfwEnabled);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, enabledAddons],
    queryFn: () => StremioAddon.searchAddons(enabledAddons, debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const filteredResults = data?.filter(item => {
    if (nsfwEnabled) return true;
    const lowerDescription = (item.description || '').toLowerCase();
    const lowerName = item.name.toLowerCase();
    const nsfwKeywords = ['nsfw', 'adult', 'xxx', 'porn', 'hentai', 'sexy', 'erotic'];
    return !nsfwKeywords.some(keyword => lowerName.includes(keyword) || lowerDescription.includes(keyword));
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-20 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between selection:bg-primary/30">
      <div className="flex-1 max-w-2xl relative" ref={containerRef}>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search movies, series, or addons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full h-12 bg-muted/50 rounded-2xl pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 transition-all text-sm font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isFocused && debouncedQuery.length > 2 && (
          <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest italic animate-pulse">Scanning addons...</p>
              </div>
            ) : filteredResults && filteredResults.length > 0 ? (
              <div className="p-2 divide-y divide-border/50">
                {filteredResults.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(`/${item.type}/${item.id}`);
                      setSearchQuery('');
                      setIsFocused(false);
                    }}
                    className="w-full p-3 hover:bg-muted rounded-xl transition-all flex items-center gap-4 text-left group"
                  >
                    <div className="h-14 w-10 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative border border-white/5">
                      {item.poster && (
                        <Image src={item.poster} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate">{item.name}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-black">{item.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 truncate pr-4">
                        {item.description || 'No description available'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm font-bold uppercase italic tracking-tighter">No results found across addons</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-border">
          <Bell className="h-5 w-5" />
        </button>
        <Link href="/settings" className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-border">
          <Settings className="h-5 w-5" />
        </Link>
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer">
          <User className="h-6 w-6" />
        </div>
      </div>
    </nav>
  );
}
