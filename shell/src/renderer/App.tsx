import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { Store } from './pages/Store';
import { Library } from './pages/Library';
import { Settings } from './pages/Settings';

declare global {
  interface Window {
    shellAPI: {
      keys: {
        set: (provider: string, key: string) => Promise<{ success: boolean }>;
        get: (provider: string) => Promise<{ exists: boolean; masked: string | null }>;
        delete: (provider: string) => Promise<{ deleted: boolean }>;
        list: () => Promise<{ providers: string[] }>;
        has: (provider: string) => Promise<{ exists: boolean }>;
      };
      apps: {
        list: () => Promise<Array<import('@vibedepot/shared').AppManifest>>;
        launch: (appId: string) => Promise<void>;
        close: (appId: string) => Promise<void>;
      };
      shell: {
        getVersion: () => Promise<string>;
        theme: () => Promise<'light' | 'dark'>;
      };
    };
  }
}

export function App(): React.ReactElement {
  const activePage = useAppStore((s) => s.activePage);
  const setInstalledApps = useAppStore((s) => s.setInstalledApps);

  useEffect(() => {
    window.shellAPI.apps.list().then(setInstalledApps).catch(console.error);
  }, [setInstalledApps]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {activePage === 'store' && <Store />}
        {activePage === 'library' && <Library />}
        {activePage === 'settings' && <Settings />}
      </main>
    </div>
  );
}
