import { Manifest, CatalogItem } from './stremio/types';

export const NSFW_DOMAINS = [
  'dirty-pink.ers.pw',
  'baby-beamup.club',
  'xclub-stremio.vercel.app',
  'hentaistream-addon',
  'hanime-stremio',
  'streamio-hianime',
];

const NSFW_KEYWORDS = [
  'adult',
  'hentai',
  'xxx',
  'nsfw',
  'porn',
  'sex',
  'erotic',
  '18+',
  'jav',
  'brazzers',
  'pornstar',
];

const NSFW_GENRES = [
  'Adult',
  'Hentai',
  'XXX',
  'Erotica',
  'Sex',
];

export function isNSFWAddon(manifest: Manifest): boolean {
  if (!manifest) return false;

  // Check explicit flag or prefix
  if (manifest.idPrefixes?.some(p => p.toLowerCase().includes('xxx') || p.toLowerCase().includes('adult'))) return true;
  
  const content = [
    manifest.name,
    manifest.description,
    ...(manifest.catalogs?.flatMap(c => [c.name, c.type]) || []),
  ].map(s => s?.toLowerCase()).filter((s): s is string => !!s);

  return content.some(text => NSFW_KEYWORDS.some(kw => text.includes(kw)));
}

export function isNSFWItem(item: CatalogItem): boolean {
  if (!item) return false;

  const content = [
    item.name,
    item.description,
    ...(item.genres || []),
  ].map(s => s?.toLowerCase()).filter((s): s is string => !!s);

  return content.some(text => NSFW_KEYWORDS.some(kw => text.includes(kw))) || 
         (item.genres || []).some(g => NSFW_GENRES.includes(g));
}
