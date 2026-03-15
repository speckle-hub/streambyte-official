import { Manifest, AddonResponse, MetaPreview, MetaDetail, Stream, Subtitle } from './types';
import { sleep, detectQuality } from './stremio-utils';

const REQUEST_DEDUPLICATION_MAP = new Map<string, Promise<any>>();

export class StremioAddon {
  private baseUrl: string;
  public manifest: Manifest | null = null;

  constructor(url: string) {
    this.baseUrl = url.replace('stremio://', 'https://');
    if (this.baseUrl.endsWith('/manifest.json')) {
      this.baseUrl = this.baseUrl.replace('/manifest.json', '');
    }
  }

  private async fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
    // Check for deduplication
    if (REQUEST_DEDUPLICATION_MAP.has(url)) {
      return REQUEST_DEDUPLICATION_MAP.get(url);
    }

    const fetchPromise = (async () => {
      let delay = 1000;
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            return data as T;
          }
          if (res.status === 404) return null;
        } catch (error) {
          if (i === retries - 1) throw error;
        }
        await sleep(delay);
        delay *= 2; // 1s, 2s, 4s
      }
      return null;
    })().finally(() => {
      REQUEST_DEDUPLICATION_MAP.delete(url);
    });

    REQUEST_DEDUPLICATION_MAP.set(url, fetchPromise);
    return fetchPromise;
  }

  async fetchManifest(): Promise<Manifest | null> {
    try {
      const data = await this.fetchWithRetry<Manifest>(`${this.baseUrl}/manifest.json`);
      this.manifest = data;
      return data;
    } catch (e) {
      console.error(`Failed to fetch manifest: ${this.baseUrl}`, e);
      return null;
    }
  }

  async getCatalog(type: string, id: string, extra: Record<string, string> = {}): Promise<MetaPreview[]> {
    const extraPath = Object.entries(extra)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const url = `${this.baseUrl}/catalog/${type}/${id}${extraPath ? `/${extraPath}` : ''}.json`;
    
    try {
      const data = await this.fetchWithRetry<AddonResponse<MetaPreview[]>>(url);
      return data?.metas || [];
    } catch (e) {
      return [];
    }
  }

  async getMeta(type: string, id: string): Promise<MetaDetail | null> {
    const url = `${this.baseUrl}/meta/${type}/${id}.json`;
    try {
      const data = await this.fetchWithRetry<AddonResponse<MetaDetail>>(url);
      return data?.meta || null;
    } catch (e) {
      return null;
    }
  }

  async getStreams(type: string, id: string): Promise<Stream[]> {
    const url = `${this.baseUrl}/stream/${type}/${id}.json`;
    try {
      const data = await this.fetchWithRetry<AddonResponse<Stream[]>>(url);
      return data?.streams || [];
    } catch (e) {
      return [];
    }
  }

  async getSubtitles(type: string, id: string): Promise<Subtitle[]> {
    const url = `${this.baseUrl}/subtitles/${type}/${id}.json`;
    try {
      const data = await this.fetchWithRetry<AddonResponse<Subtitle[]>>(url);
      return data?.subtitles || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Static helpers for multi-addon operations
   */
  static async searchAddons(urls: string[], query: string, type: 'movie' | 'series' = 'movie'): Promise<MetaPreview[]> {
    const results = await Promise.allSettled(
      urls.map(url => new StremioAddon(url).getCatalog(type, 'search', { search: query }))
    );
    
    return results
      .filter((r): r is PromiseFulfilledResult<MetaPreview[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }

  static async getStreamsFromAllAddons(urls: string[], type: string, id: string): Promise<Stream[]> {
    const results = await Promise.allSettled(
      urls.map(url => new StremioAddon(url).getStreams(type, id))
    );
    
    const streams = results
      .filter((r): r is PromiseFulfilledResult<Stream[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Sort by quality
    const qualityWeight = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1, 'SD': 0 };
    
    return streams.sort((a, b) => {
      const qa = detectQuality(a.title || a.name || '');
      const qb = detectQuality(b.title || b.name || '');
      return qualityWeight[qb] - qualityWeight[qa];
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/manifest.json`, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  static async getMetaFromAllAddons(urls: string[], type: string, id: string): Promise<MetaDetail | null> {
    // Separate Cinemata and others to prioritize official/common metadata
    const cinemataUrl = 'https://v3-cinemeta.strem.io/manifest.json';
    const mainUrls = urls.includes(cinemataUrl) ? [cinemataUrl] : [];
    const otherUrls = urls.filter(u => u !== cinemataUrl);

    // Try Cinemata first if it's in the list
    if (mainUrls.length > 0) {
      try {
        const meta = await new StremioAddon(mainUrls[0]).getMeta(type, id);
        if (meta) return meta;
      } catch (e) {
        // Fallback to others
      }
    }

    // Try others in parallel (limit to first success)
    const results = await Promise.allSettled(
      otherUrls.map(url => new StremioAddon(url).getMeta(type, id))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    return null;
  }
}

export const DEFAULT_ADDONS = [
  'https://v3-cinemeta.strem.io/manifest.json', // Meta data
  'https://mediafusion.elfhosted.com/manifest.json',
  'https://stremify.elfhosted.com/manifest.json',
];

export const PRESET_ADDONS = {
  movies: [
    'https://v3-cinemeta.strem.io/manifest.json',
    'https://mediafusion.elfhosted.com/manifest.json',
    'https://stremify.elfhosted.com/manifest.json',
    'https://tstrm.org/manifest.json',
    'https://streamvix.hayd.uk/%7B%22tmdbApiKey%22%3A%22%22%2C%22mediaFlowProxyUrl%22%3A%22%22%2C%22mediaFlowProxyPassword%22%3A%22%22%2C%22animeunityEnabled%22%3A%22on%22%2C%22animesaturnEnabled%22%3A%22on%22%2C%22animeworldEnabled%22%3A%22on%22%7D/manifest.json',
    'https://webstreamr.hayd.uk/manifest.json',
    'https://autostreamtest.onrender.com/manifest.json',
    'https://addon-osvh.onrender.com/manifest.json',
    'https://nodebrid.fly.dev/manifest.json',
  ],
  anime: [
    'https://animestream-addon.keypop3750.workers.dev/manifest.json',
  ],
  adult: [
    'https://dirty-pink.ers.pw/manifest.json',
    'https://07b88951aaab-jaxxx-v2.baby-beamup.club/manifest.json',
    'https://xclub-stremio.vercel.app/manifest.json',
  ],
  hentai: [
    'https://streamio-hianime.onrender.com/manifest.json',
    'https://hentaistream-addon.keypop3750.workers.dev/manifest.json',
    'https://hanime-stremio.fly.dev/manifest.json',
  ]
};

export async function createAddonClient(url: string): Promise<StremioAddon> {
  const client = new StremioAddon(url);
  await client.fetchManifest();
  return client;
}
