import { create } from 'zustand';
import type { AppManifest } from '@vibedepot/shared';

type Page = 'store' | 'library' | 'settings';

interface AppStoreState {
  activePage: Page;
  setActivePage: (page: Page) => void;
  installedApps: AppManifest[];
  setInstalledApps: (apps: AppManifest[]) => void;
  runningAppIds: Set<string>;
  setAppRunning: (appId: string, running: boolean) => void;
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
}));
