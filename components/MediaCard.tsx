'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Play, Plus, Heart, X, Check } from 'lucide-react';
import { CatalogItem } from '@/lib/stremio/types';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  item: CatalogItem;
  priority?: boolean;
}

export const MediaCard = memo(function MediaCard({ item, priority = false }: MediaCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const historyItem = useHistoryStore((state) => state.getHistoryItem(item.id));
  const isFavourite = isInWatchlist(item.id);

  // Native Intersection Observer for Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavourite) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  return (
    <div 
      ref={cardRef}
      className="group relative flex flex-col gap-2 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] focus-within:ring-2 focus-within:ring-primary rounded-2xl"
    >
      <Link href={`/${item.type}/${item.id}`} className="block relative aspect-[2/3] w-full bg-muted rounded-2xl overflow-hidden shadow-lg border border-white/5">
        {isVisible && item.poster && (
          <Image
            src={item.poster}
            alt={item.name}
            fill
            priority={priority}
            className={cn(
              "object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
            )}
            onLoad={() => setIsLoaded(true)}
          />
        )}

        {/* HUD Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
          <div className="h-14 w-14 bg-primary rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 shadow-2xl shadow-primary/40">
            <Play className="h-7 w-7 fill-white ml-1" />
          </div>
          <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
            <button
              onClick={handleWatchlist}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all border",
                isFavourite ? "bg-red-500 border-red-500 text-white" : "bg-white/10 border-white/10 text-white hover:bg-white/20"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavourite && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Progress Bar (Continue Watching) */}
        {historyItem && historyItem.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 backdrop-blur-md">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-all duration-1000"
              style={{ width: `${historyItem.progress * 100}%` }}
            />
          </div>
        )}

        {/* Rating/Badge */}
        {item.imdbRating && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black text-white">{item.imdbRating}</span>
          </div>
        )}
      </Link>

      <div className="px-1 py-1">
        <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{item.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-1.5 rounded-sm">{item.type}</span>
          {item.releaseInfo && (
            <span className="text-[10px] font-bold text-muted-foreground">{item.releaseInfo}</span>
          )}
        </div>
      </div>
    </div>
  );
});
