import { MetaDetail, CatalogItem, MetaPreview } from './types';
import { useAddonStore } from '@/store/useAddonStore';
import { StremioAddon } from './client';

export class CatalogAggregator {
  /**
   * Merges and deduplicates catalogs from multiple addons
   */
  static async getUnifiedCatalog(
    addonUrls: string[],
    type: string,
    id: string,
    extra: Record<string, string> = {}
  ): Promise<MetaPreview[]> {
    const results = await Promise.allSettled(
      addonUrls.map((url) => new StremioAddon(url).getCatalog(type, id, extra))
    );

    const allMetas = results
      .filter((r): r is PromiseFulfilledResult<MetaPreview[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Deduplicate by ID
    const seen = new Map<string, MetaPreview>();
    for (const meta of allMetas) {
      if (!seen.has(meta.id)) {
        seen.set(meta.id, meta);
      } else {
        // Keep the one with more metadata (simple heuristic: longer description or has genres)
        const existing = seen.get(meta.id)!;
        const currentScore = (meta.description?.length || 0) + (meta.genres?.length || 0) * 10;
        const existingScore = (existing.description?.length || 0) + (existing.genres?.length || 0) * 10;
        if (currentScore > existingScore) {
          seen.set(meta.id, meta);
        }
      }
    }

    const unified = Array.from(seen.values());

    // Filter NSFW if disabled
    const isNsfwEnabled = useAddonStore.getState().nsfwEnabled;
    const finalItems = isNsfwEnabled 
      ? unified 
      : unified.filter(item => {
          const lowerDescription = (item.description || '').toLowerCase();
          const lowerName = item.name.toLowerCase();
          const nsfwKeywords = ['nsfw', 'adult', 'xxx', 'porn', 'hentai', 'sexy', 'erotic'];
          return !nsfwKeywords.some(keyword => lowerName.includes(keyword) || lowerDescription.includes(keyword));
        });

    // Sorting support
    if (extra.sort) {
       if (extra.sort === 'rating') {
         finalItems.sort((a, b) => parseFloat(b.imdbRating || '0') - parseFloat(a.imdbRating || '0'));
       } else if (extra.sort === 'name') {
         finalItems.sort((a, b) => a.name.localeCompare(b.name));
       }
    }

    return finalItems;
  }

  /**
   * Simple pagination helper
   */
  static paginate(items: MetaPreview[], page: number, pageSize: number = 20): MetaPreview[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }
}
