'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAddonStore } from '@/store/useAddonStore';
import { CatalogAggregator } from '@/lib/stremio/aggregator';
import { StreamResolver, ResolvedStream } from '@/lib/stremio/resolver';
import { 
  Play, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  Zap, 
  HardDrive,
  Cpu,
  Tv
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SourceSelectorProps {
  id: string;
  type: string;
  name: string;
  poster?: string;
}

export function SourceSelector({ id, type, name, poster }: SourceSelectorProps) {
  const { getEnabledAddons } = useAddonStore();
  const enabledAddons = getEnabledAddons('regular'); // Filter regular content for streams

  const { data: streams, isLoading, error } = useQuery({
    queryKey: ['streams', type, id],
    queryFn: async () => {
      const rawStreams = await CatalogAggregator.getUnifiedStreams(enabledAddons, type, id);
      return rawStreams.map(s => StreamResolver.resolve(s));
    },
    enabled: !!id && enabledAddons.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <div className="flex items-center gap-3 px-1">
          <Search className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-xl font-bold uppercase italic tracking-tighter">Searching for Sources...</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full bg-zinc-900/50 border border-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !streams || streams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl bg-zinc-900/30 border border-white/5 border-dashed gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold uppercase italic tracking-tighter">No Sources Found</h3>
          <p className="text-xs text-muted-foreground max-w-[250px]">
            Try installing more video addons or checking your connection.
          </p>
        </div>
        <Link href="/addons" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
          Manage Addons
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary fill-primary" />
          <h3 className="text-xl font-bold uppercase italic tracking-tighter">Available Sources</h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
          {streams.length} Streams Found
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {streams.map((stream, idx) => (
          <Link
            key={idx}
            href={`/player?url=${encodeURIComponent(stream.url)}&id=${id}&type=${type}&name=${encodeURIComponent(name)}&poster=${encodeURIComponent(poster || '')}`}
            className="group flex items-center justify-between p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {stream.type === 'hls' ? <Tv className="h-6 w-6 text-zinc-400 group-hover:text-primary" /> : <HardDrive className="h-6 w-6 text-zinc-400 group-hover:text-primary" />}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                    {stream.name || 'Unknown Source'}
                  </span>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                    stream.quality === '4K' ? "bg-primary text-white" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {stream.quality}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                   <span>{stream.provider || 'P2P/Direct'}</span>
                   {stream.size && <span>&bull; {stream.size}</span>}
                </div>
              </div>
            </div>
            
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
        <Cpu className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-loose">
          StreamByte uses advanced aggregation to find the best quality sources from your installed addons.
        </p>
      </div>
    </div>
  );
}
