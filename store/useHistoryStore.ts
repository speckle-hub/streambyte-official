import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchHistoryItem {
  id: string;
  type: string;
  name: string;
  poster?: string;
  background?: string;
  logo?: string;
  description?: string;
  progress: number; // 0 to 1
  currentTime: number;
  duration: number;
  lastWatched: number; // timestamp
}

interface HistoryState {
  history: WatchHistoryItem[];
  updateProgress: (item: Omit<WatchHistoryItem, 'lastWatched'>) => void;
  removeFromHistory: (id: string) => void;
  getHistoryItem: (id: string) => WatchHistoryItem | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      updateProgress: (item) => {
        const { history } = get();
        const existingIndex = history.findIndex((h) => h.id === item.id);
        
        // Auto-remove if 95%+ watched
        if (item.progress >= 0.95) {
          if (existingIndex !== -1) {
            set({ history: history.filter((h) => h.id !== item.id) });
          }
          return;
        }

        const newItem: WatchHistoryItem = {
          ...item,
          lastWatched: Date.now(),
        };

        if (existingIndex !== -1) {
          const updatedHistory = [...history];
          updatedHistory[existingIndex] = newItem;
          // Move to front
          updatedHistory.sort((a, b) => b.lastWatched - a.lastWatched);
          set({ history: updatedHistory });
        } else {
          set({ history: [newItem, ...history].slice(0, 50) }); // Limit to 50 items
        }
      },
      removeFromHistory: (id) => {
        set({ history: get().history.filter((h) => h.id !== id) });
      },
      getHistoryItem: (id) => {
        return get().history.find((h) => h.id === id);
      },
    }),
    {
      name: 'watch-history-storage',
    }
  )
);
