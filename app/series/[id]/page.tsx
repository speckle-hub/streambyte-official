'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { StremioAddon } from '@/lib/stremio/client';
import { formatDuration } from '@/lib/stremio/stremio-utils';
import Image from 'next/image';
import { Play, Star, Calendar, Clock, ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Skeleton } from '@/components/Skeleton';
import { SourceSelector } from '@/components/SourceSelector';
import { cn } from '@/lib/utils';
import { useAddonStore } from '@/store/useAddonStore';

export default function SeriesPage() {
  const { id } = useParams();
  const seriesId = id as string;
  const { getEnabledAddons } = useAddonStore();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);

  const { data: series, isLoading } = useQuery({
    queryKey: ['meta', 'series', seriesId],
    queryFn: async () => {
      const allAddons = [
        ...getEnabledAddons('regular'),
        ...getEnabledAddons('adult'),
        ...getEnabledAddons('hentai')
      ];
      return await StremioAddon.getMetaFromAllAddons(allAddons, 'series', seriesId);
    },
  });

  const seasons = Array.from(new Set(series?.videos?.map((v) => v.season).filter(Boolean))) as number[];
  const episodes = series?.videos?.filter((v) => v.season === selectedSeason).sort((a, b) => (a.episode || 0) - (b.episode || 0)) || [];

  if (isLoading) return <div className="p-10">Loading series details...</div>;
  if (!series) return <div className="p-10 text-center">Series not found.</div>;

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative -mx-6 -mt-6 h-[60vh] overflow-hidden">
        <Image
          src={series.background || series.poster || ''}
          alt={series.name}
          fill
          className="object-cover opacity-20 blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute inset-0 flex items-end p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end w-full max-w-7xl mx-auto">
            <div className="relative aspect-[2/3] w-56 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/5 shadow-2xl">
              <Image src={series.poster || ''} alt={series.name} fill className="object-cover" />
            </div>
            
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-wrap gap-2">
                {series.genres?.map((g) => (
                  <span key={g} className="rounded-full bg-zinc-800/80 px-3 py-1 text-[10px] font-black uppercase text-zinc-300 border border-white/5">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">{series.name}</h1>
              <div className="flex items-center gap-6 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  {series.imdbRating}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {series.releaseInfo}
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  {seasons.length} Seasons
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Left Column: Info & Seasons */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Seasons</h3>
            <div className="flex flex-col gap-2">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all font-bold ${
                    selectedSeason === s 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  Season {s}
                  <ChevronRight className={`h-4 w-4 ${selectedSeason === s ? 'opacity-100' : 'opacity-30'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Episodes */}
        <div className="lg:col-span-3 flex flex-col gap-8">
           <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black">Season {selectedSeason}</h2>
              <p className="text-zinc-500 font-medium">{episodes.length} Episodes available</p>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {episodes.map((ep) => (
                 <div key={ep.id} className="flex flex-col gap-4">
                  <button
                    onClick={() => setActiveEpisodeId(activeEpisodeId === ep.id ? null : ep.id)}
                    className={cn(
                      "flex items-center gap-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-all group w-full text-left",
                      activeEpisodeId === ep.id ? "border-primary/50 bg-zinc-900" : "hover:border-primary/50"
                    )}
                  >
                    <div className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {ep.thumbnail ? (
                        <Image src={ep.thumbnail} alt={ep.title || ''} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-600 font-bold uppercase text-[10px]">No Preview</div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play className="h-8 w-8 fill-primary text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-xs font-black text-primary uppercase">Episode {ep.episode}</span>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{ep.title || `Episode ${ep.episode}`}</h3>
                      {ep.overview && <p className="text-sm text-zinc-500 line-clamp-1 mt-1 leading-relaxed font-medium">{ep.overview}</p>}
                    </div>
                    
                    <ChevronRight className={cn(
                      "h-5 w-5 text-zinc-600 transition-transform duration-300",
                      activeEpisodeId === ep.id ? "rotate-90 text-primary" : ""
                    )} />
                  </button>

                  {activeEpisodeId === ep.id && (
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-primary/20 animate-in slide-in-from-top-2 duration-300 ml-4">
                       <SourceSelector 
                         id={ep.id} 
                         type="series" 
                         name={`${series.name} - S${ep.season}E${ep.episode}`} 
                         poster={series.poster} 
                       />
                    </div>
                  )}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
