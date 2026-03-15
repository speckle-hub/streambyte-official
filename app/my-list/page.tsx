'use client';

import { useWatchlistStore } from '@/store/useWatchlistStore';
import { MediaCard } from '@/components/MediaCard';
import { Heart, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MyListPage() {
  const { items } = useWatchlistStore();

  return (
    <div className="min-h-screen pt-24 px-8 pb-12 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-4">
              <Heart className="h-10 w-10 text-red-500 fill-red-500" />
              My List
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
              Your curated collection of {items.length} titles
            </p>
          </div>
        </header>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="h-32 w-32 bg-card border border-border rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform">
              <Heart className="h-16 w-16 text-muted-foreground/20" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic tracking-tighter">Your list is feeling lonely</h2>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Add movies and series to your list to keep track of what you want to watch next.
              </p>
            </div>
            <Link 
              href="/search"
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Explore Catalog
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
