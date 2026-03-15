import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Manifest } from '@/lib/stremio/types';
import { PRESET_ADDONS } from '@/lib/stremio/client';
import { isNSFWAddon } from '@/lib/contentFilter';

export type InstalledAddon = {
  url: string;
  priority: number;
  enabled: boolean;
  config?: Record<string, any>;
  lastSynced?: number;
  category?: string;
};

type AddonState = {
  addons: InstalledAddon[];
  addonManifests: Record<string, Manifest>;
  nsfwEnabled: boolean;
  
  // Actions
  installAddon: (url: string, category?: string) => void;
  installPresetPack: (packName: keyof typeof PRESET_ADDONS) => void;
  removeAddon: (url: string) => void;
  toggleAddon: (url: string) => void;
  setAddonPriority: (url: string, priority: number) => void;
  setAddonConfig: (url: string, config: Record<string, any>) => void;
  setManifest: (url: string, manifest: Manifest) => void;
  setNsfwEnabled: (enabled: boolean) => void;
  
  // Getters
  getEnabledAddons: () => string[];
  
  // User Preferences
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  watchHistory: { id: string; type: string; timestamp: number }[];
  addToHistory: (id: string, type: string) => void;
};

export const useAddonStore = create<AddonState>()(
  persist(
    (set, get) => ({
      addons: [
        { 
          url: 'https://v3-cinemeta.strem.io/manifest.json', 
          priority: 0, 
          enabled: true, 
          category: 'movies',
          lastSynced: Date.now() 
        },
        ...PRESET_ADDONS.movies.filter(url => url !== 'https://v3-cinemeta.strem.io/manifest.json').map((url, i) => ({ 
          url, 
          priority: i + 1, 
          enabled: true, 
          category: 'movies',
          lastSynced: Date.now() 
        }))
      ],
      addonManifests: {},
      nsfwEnabled: false,

      installAddon: (url, category) =>
        set((state) => ({
          addons: state.addons.find((a) => a.url === url)
            ? state.addons
            : [
                ...state.addons, 
                { 
                  url, 
                  priority: state.addons.length, 
                  enabled: true, 
                  category,
                  lastSynced: Date.now()
                }
              ],
        })),

      installPresetPack: (packName) => {
        const urls = PRESET_ADDONS[packName];
        set((state) => {
          const newAddons = [...state.addons];
          urls.forEach((url) => {
            // Special rule: Skip NSFW addons when installing Anime pack
            if (packName === 'anime' && (url.includes('hentai') || url.includes('hanime'))) {
              return;
            }
            
            if (!newAddons.find((a) => a.url === url)) {
              newAddons.push({
                url,
                priority: newAddons.length,
                enabled: true,
                category: packName,
                lastSynced: Date.now(),
              });
            }
          });
          return { addons: newAddons };
        });
      },

      removeAddon: (url) =>
        set((state) => ({
          addons: state.addons.filter((a) => a.url !== url),
          addonManifests: (() => {
            const next = { ...state.addonManifests };
            delete next[url];
            return next;
          })(),
        })),

      toggleAddon: (url) =>
        set((state) => ({
          addons: state.addons.map((a) =>
            a.url === url ? { ...a, enabled: !a.enabled } : a
          ),
        })),

      setAddonPriority: (url, priority) =>
        set((state) => ({
          addons: state.addons.map((a) =>
            a.url === url ? { ...a, priority } : a
          ),
        })),

      setAddonConfig: (url, config) =>
        set((state) => ({
          addons: state.addons.map((a) =>
            a.url === url ? { ...a, config: { ...a.config, ...config }, lastSynced: Date.now() } : a
          ),
        })),

      setManifest: (url, manifest) =>
        set((state) => ({
          addonManifests: { ...state.addonManifests, [url]: manifest },
        })),

      setNsfwEnabled: (enabled) => set({ nsfwEnabled: enabled }),

      getEnabledAddons: () => {
        const { addons, nsfwEnabled, addonManifests } = get();
        return addons
          .filter((a) => a.enabled)
          .filter((a) => {
            if (nsfwEnabled) return true;
            // Strict filter: exclude if category is adult OR if manifest classifies as NSFW
            if (a.category === 'adult') return false;
            const manifest = addonManifests[a.url];
            if (manifest && isNSFWAddon(manifest)) return false;
            return true;
          })
          .sort((a, b) => a.priority - b.priority)
          .map((a) => a.url);
      },

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      watchHistory: [],
      addToHistory: (id, type) =>
        set((state) => ({
          watchHistory: [
            { id, type, timestamp: Date.now() },
            ...state.watchHistory.filter((h) => h.id !== id),
          ].slice(0, 50),
        })),
    }),
    {
      name: 'stremio-addon-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
