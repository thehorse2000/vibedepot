import { create } from 'zustand';
import type { AppManifest, RegistryEntry } from '@vibedepot/shared';

type Page = 'store' | 'library' | 'settings' | 'publish';

interface AppStoreState {
  activePage: Page;
  setActivePage: (page: Page) => void;

  // Installed apps
  installedApps: AppManifest[];
  setInstalledApps: (apps: AppManifest[]) => void;

  // Running apps
  runningAppIds: Set<string>;
  setAppRunning: (appId: string, running: boolean) => void;

  // Store / registry
  registryEntries: RegistryEntry[];
  setRegistryEntries: (entries: RegistryEntry[]) => void;
  registryLoading: boolean;
  setRegistryLoading: (loading: boolean) => void;
  registryError: string | null;
  setRegistryError: (error: string | null) => void;

  // Installing apps (tracks in-progress installs)
  installingAppIds: Set<string>;
  setAppInstalling: (appId: string, installing: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  activePage: 'library',
  setActivePage: (page) => set({ activePage: page }),

  installedApps: [],
  setInstalledApps: (apps) => set({ installedApps: apps }),

  runningAppIds: new Set(),
  setAppRunning: (appId, running) =>
    set((state) => {
      const next = new Set(state.runningAppIds);
      if (running) {
        next.add(appId);
      } else {
        next.delete(appId);
      }
      return { runningAppIds: next };
    }),

  registryEntries: [],
  setRegistryEntries: (entries) => set({ registryEntries: entries }),
  registryLoading: false,
  setRegistryLoading: (loading) => set({ registryLoading: loading }),
  registryError: null,
  setRegistryError: (error) => set({ registryError: error }),

  installingAppIds: new Set(),
  setAppInstalling: (appId, installing) =>
    set((state) => {
      const next = new Set(state.installingAppIds);
      if (installing) {
        next.add(appId);
      } else {
        next.delete(appId);
      }
      return { installingAppIds: next };
    }),
}));
