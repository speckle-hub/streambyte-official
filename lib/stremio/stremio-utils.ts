/**
 * Parses a Stremio ID like "tt1234567" or "imdb:tt1234567"
 */
export function parseStremioId(id: string): { prefix: string; value: string } {
  if (id.includes(':')) {
    const [prefix, ...rest] = id.split(':');
    return { prefix, value: rest.join(':') };
  }
  
  if (id.startsWith('tt')) {
    return { prefix: 'imdb', value: id };
  }
  
  return { prefix: 'other', value: id };
}

/**
 * Converts minutes (e.g. 90) to "1h 30m"
 */
export function formatDuration(minutes: number | string): string {
  const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
  if (isNaN(mins)) return 'N/A';
  
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * Detects quality from a stream title/name
 */
export function detectQuality(name: string): '4K' | '1080p' | '720p' | '480p' | 'SD' {
  const n = name.toLowerCase();
  
  if (/\b(4k|2160p|uhd)\b/.test(n)) return '4K';
  if (/\b(1080p|fhd)\b/.test(n)) return '1080p';
  if (/\b(720p|hd)\b/.test(n)) return '720p';
  if (/\b(480p)\b/.test(n)) return '480p';
  if (/\b(360p|sd|dvd|brrip|bdrip|cam|ts)\b/.test(n)) return 'SD';
  
  return '1080p'; // Default fallback
}

/**
 * Sleep helper for exponential backoff
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
