'use client';

import { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  ArrowLeft, Settings, SkipForward, SkipBack, 
  Loader2, AlertCircle, Monitor, ChevronRight, Tv
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/stremio/stremio-utils';
import { useHistoryStore } from '@/store/useHistoryStore';
import dynamic from 'next/dynamic';

// Dynamic import for the player to reduce initial bundle size
const ReactPlayer = dynamic(() => import('react-player/lazy'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
    </div>
  )
});

function Player() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const streamUrl = searchParams.get('url') || '';
  const type = searchParams.get('type') || 'movie';
  const id = searchParams.get('id') || '';
  const name = searchParams.get('name') || 'Unknown Title';
  const poster = searchParams.get('poster') || '';
  const headersParam = searchParams.get('headers');
  
  const headers = headersParam ? JSON.parse(headersParam) : null;
  const isMagnet = streamUrl.startsWith('magnet:');
  const notWebReady = searchParams.get('notWebReady') === 'true';

  const externalUrls = {
    vlc: streamUrl.startsWith('http') ? `vlc://${streamUrl}` : null,
    stremio: `stremio:///detail/${type}/${id}`,
    // PotPlayer for Windows
    potplayer: streamUrl.startsWith('http') ? `potplayer://${streamUrl}` : null,
  };

  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveTimeRef = useRef<number>(0);

  const { updateProgress, getHistoryItem } = useHistoryStore();
  const historyItem = getHistoryItem(id);

  // Resume from last position
  useEffect(() => {
    if (historyItem && playerRef.current) {
      playerRef.current.seekTo(historyItem.currentTime, 'seconds');
    }
  }, [historyItem]);

  const handleProgress = (state: any) => {
    if (!seeking) {
      setPlayed(state.played);
      
      // Save progress every 10 seconds
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 10000) {
        updateProgress({
          id,
          type,
          name,
          poster,
          progress: state.played,
          currentTime: state.playedSeconds,
          duration: duration,
        });
        lastSaveTimeRef.current = now;
      }
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const togglePlay = () => setPlaying(!playing);
  const toggleMute = () => setMuted(!muted);
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e: any) => {
    setSeeking(false);
    playerRef.current.seekTo(parseFloat(e.target.value));
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePip = async () => {
    try {
      const video = document.querySelector('video');
      if (video && document.pictureInPictureEnabled) {
        if (!document.pictureInPictureElement) {
          await video.requestPictureInPicture();
        } else {
          await document.exitPictureInPicture();
        }
      }
    } catch (err) {
      console.error('PiP failed', err);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'KeyF': e.preventDefault(); toggleFullScreen(); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'KeyP': e.preventDefault(); togglePip(); break;
        case 'ArrowRight': e.preventDefault(); playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 10); break;
        case 'ArrowLeft': e.preventDefault(); playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 10); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, muted]);


  if (!streamUrl || isMagnet || (notWebReady && !playing)) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 text-center gap-10">
        <div className="space-y-6">
          <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">
              {isMagnet ? 'P2P Link Detected' : notWebReady ? 'External Format' : 'Playback Error'}
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
              {isMagnet 
                ? 'Magnet links require a Debrid service or an external app like Stremio to play.' 
                : notWebReady 
                  ? 'This stream is not compatible with web browsers. Please use an external player.'
                  : 'The stream failed to load or is blocked by browser security (CORS).'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          {externalUrls.vlc && (
            <a 
              href={externalUrls.vlc}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
            >
              <Monitor className="h-4 w-4" />
              Open in VLC
            </a>
          )}
          <a 
            href={externalUrls.stremio}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
          >
            <Tv className="h-4 w-4" />
            Open in Stremio
          </a>
          <button 
            onClick={() => router.back()} 
            className="sm:col-span-2 flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Technical Details</p>
            <code className="text-[8px] text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-white/5 max-w-[300px] truncate">
                {streamUrl}
            </code>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen bg-black overflow-hidden relative group cursor-none selection:bg-none"
      onMouseMove={handleMouseMove}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <ReactPlayer
        ref={playerRef}
        url={streamUrl}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onBuffer={() => setBuffering(true)}
        onBufferEnd={() => setBuffering(false)}
        onError={(e: any) => setError('Failed to load video stream')}
        config={{
          file: {
            forceHLS: streamUrl.includes('.m3u8'),
            attributes: {
              crossOrigin: headers ? undefined : 'anonymous', // Don't use anonymous if we have custom headers as it might trigger CORS preflights we can't control
            },
            hlsOptions: {
              xhrSetup: (xhr: any, url: any) => {
                if (headers) {
                  Object.entries(headers).forEach(([key, value]) => {
                    xhr.setRequestHeader(key, value);
                  });
                }
              }
            }
          }
        }}
      />

      {/* Buffering Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <Loader2 className="h-20 w-20 text-primary animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 p-8 text-center gap-6">
          <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter">Playback Error</h2>
            <p className="text-muted-foreground max-w-sm">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-primary text-white rounded-[2rem] font-bold shadow-2xl shadow-primary/20">Try Again</button>
        </div>
      )}

      {/* CUSTOM HUD CONTROLS */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-500 flex flex-col justify-between p-8",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Top Header */}
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black italic tracking-tighter drop-shadow-2xl">{name}</h1>
            <p className="text-xs font-black uppercase tracking-widest text-primary/80">{type}</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="space-y-8 max-w-7xl mx-auto w-full">
          {/* Progress Bar */}
          <div className="space-y-3 group/progress">
            <div className="flex items-center justify-between px-1 text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
              <span>{formatDuration(played * duration)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
               <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(255,0,0,0.8)] transition-all ease-out"
                style={{ width: `${played * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="h-20 w-20 rounded-[2rem] bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-2xl">
                {playing ? <Pause className="h-8 w-8 fill-black" /> : <Play className="h-8 w-8 fill-black ml-1" />}
              </button>
              
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/5 p-2 rounded-[2rem]">
                <button onClick={toggleMute} className="h-12 w-12 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
                  {muted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
               <button onClick={togglePip} className="h-14 w-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" title="Picture-in-Picture (P)">
                 <Monitor className="h-6 w-6" />
               </button>
               <button className="h-14 w-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                 <Settings className="h-6 w-6" />
               </button>
               <button onClick={toggleFullScreen} className="h-14 w-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                 <Maximize className="h-6 w-6" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    }>
      <Player />
    </Suspense>
  );
}
