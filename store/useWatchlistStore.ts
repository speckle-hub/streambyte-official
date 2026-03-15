import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '@/lib/stremio/types';

interface WatchlistState {
  items: CatalogItem[];
  addItem: (item: CatalogItem) => void;
  removeItem: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        if (!items.find((i) => i.id === item.id)) {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      isInWatchlist: (id) => {
        return get().items.some((i) => i.id === id);
      },
    }),
    {
      name: 'watchlist-storage',
    }
  )
);
