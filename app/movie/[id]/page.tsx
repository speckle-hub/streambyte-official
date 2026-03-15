'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { StremioAddon } from '@/lib/stremio/client';
import { formatDuration } from '@/lib/stremio/stremio-utils';
import Image from 'next/image';
import { Play, Star, Calendar, Clock, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAddonStore } from '@/store/useAddonStore';

export default function MoviePage() {
  const { id } = useParams();
  const movieId = id as string;
  const { getEnabledAddons } = useAddonStore();

  const { data: movie, isLoading } = useQuery({
    queryKey: ['meta', 'movie', movieId],
    queryFn: async () => {
      // Try fetching from Cinemeta first as primary metadata provider
      const client = new StremioAddon('https://v3-cinemeta.strem.io');
      return await client.getMeta('movie', movieId);
    },
  });

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground animate-pulse">Fetching movie metadata...</p>
      </div>
    </div>
  );

  if (!movie) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Movie not found</h2>
      <Link href="/" className="text-primary hover:underline">Return Home</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Section */}
      <section className="relative -mx-6 -mt-6 h-[75vh] min-h-[600px] overflow-hidden">
        <Image
          src={movie.background || movie.poster || ''}
          alt={movie.name}
          fill
          className="object-cover opacity-30 blur-sm scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden lg:block" />
        
        <div className="absolute inset-0 flex items-end p-8 md:p-12 lg:p-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end w-full max-w-7xl mx-auto">
            <div className="relative aspect-[2/3] w-48 md:w-64 lg:w-72 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-500">
              <Image src={movie.poster || ''} alt={movie.name} fill className="object-cover" />
              {movie.imdbRating && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1">
                   <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                   <span className="text-xs font-bold">{movie.imdbRating}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-6 flex-1">
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((g) => (
                  <span key={g} className="rounded-md bg-zinc-800/80 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300 border border-zinc-700">
                    {g}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight drop-shadow-2xl leading-tight">
                  {movie.name}
                </h1>
                <div className="flex items-center gap-6 text-sm font-medium text-white/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {movie.releaseInfo}
                  </div>
                  {movie.runtime && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatDuration(movie.runtime)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <ShieldCheck className="h-4 w-4" />
                    Verified Addon
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  href={`/player?id=${movieId}&type=movie`}
                  className="flex items-center gap-3 rounded-xl bg-primary px-10 py-4 text-lg font-black text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  <Play className="h-6 w-6 fill-current" />
                  Watch Now
                </Link>
                <button className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-md px-10 py-4 text-lg font-black hover:bg-white/20 transition-all border border-white/10 group">
                  <Info className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 gap-16 lg:grid-cols-3 pb-20">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <span className="h-8 w-1 bg-primary rounded-full" />
              Synopsis
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground font-medium">
              {movie.description || "No description available for this title."}
            </p>
          </div>
          
          {/* Casting / Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800">
             <div className="flex flex-col gap-3">
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Starring</span>
                <p className="text-sm font-medium text-zinc-300 leading-loose">{movie.cast?.join(', ') || 'N/A'}</p>
             </div>
             <div className="flex flex-col gap-3">
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Direction</span>
                <p className="text-sm font-medium text-zinc-300 leading-loose">{movie.director?.join(', ') || 'N/A'}</p>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-8">
           <h2 className="text-2xl font-bold font-display">Meta Info</h2>
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-sm font-bold">Stremio ID</span>
                <span className="text-sm font-mono text-zinc-300">{movie.id}</span>
             </div>
             <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-sm font-bold">Format</span>
                <span className="text-sm font-bold text-emerald-500">V3 Addon API</span>
             </div>
             <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-sm font-bold">Installed Addons</span>
                <span className="text-sm font-bold">{getEnabledAddons().length}</span>
             </div>
           </div>
           
           <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
              <p className="text-xs text-zinc-400 leading-relaxed italic">
                Metadata provided by Cinematic (Cinemeta). Stremio addons are third-party services. Please use responsibly.
              </p>
           </div>
        </div>
      </section>
    </div>
  );
}
