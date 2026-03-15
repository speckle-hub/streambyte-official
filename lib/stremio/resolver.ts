import { Stream } from './types';
import { detectQuality } from './stremio-utils';

export type ResolvedStream = {
  url: string;
  type: 'hls' | 'mp4' | 'magnet' | 'youtube' | 'external';
  quality: '4K' | '1080p' | '720p' | '480p' | 'SD';
  name: string;
  provider?: string;
  size?: string;
  isDebrid?: boolean;
  headers?: Record<string, string>;
};

export class StreamResolver {
  /**
   * Resolves a Stremio stream object into a player-ready format
   */
  static resolve(stream: Stream): ResolvedStream {
    const quality = detectQuality(stream.title || stream.name || '');
    const name = stream.name || stream.title?.split('\n')[0] || 'Unknown Stream';
    
    // Check type
    if (stream.ytId) {
      return {
        url: `https://www.youtube.com/embed/${stream.ytId}`,
        type: 'youtube',
        quality,
        name,
      };
    }

    if (stream.infoHash) {
      // For infoHash, we technically need a magnet link or a debrid service
      return {
        url: `magnet:?xt=urn:btih:${stream.infoHash}`,
        type: 'magnet',
        quality,
        name,
        provider: 'Torrent',
      };
    }

    if (stream.url) {
      const type = stream.url.includes('.m3u8') ? 'hls' : 'mp4';
      return {
        url: stream.url,
        type,
        quality,
        name,
        provider: stream.name || 'Direct',
        headers: stream.behaviorHints?.proxyHeaders
      };
    }

    return {
      url: stream.externalUrl || '',
      type: 'external',
      quality,
      name: name || 'External Link',
    };
  }

  /**
   * Placeholder for Debrid Services
   */
  static async resolveDebrid(infoHash: string, service: 'realdebrid' | 'alldebrid' | 'premiumize'): Promise<string | null> {
    console.log(`Resolving ${infoHash} via ${service}...`);
    // Placeholder logic
    return null;
  }
}
