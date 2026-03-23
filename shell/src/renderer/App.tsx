import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { useSettingsStore } from './store/useSettingsStore';
import { Sidebar } from './components/Sidebar';
import { Store } from './pages/Store';
import { Library } from './pages/Library';
import { Settings } from './pages/Settings';
import { Publish } from './pages/Publish';

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
        onAppClosed: (callback: (appId: string) => void) => () => void;
      };
      store: {
        fetchRegistry: () => Promise<Array<import('@vibedepot/shared').RegistryEntry>>;
        installApp: (
          appId: string,
          bundleUrl: string,
          expectedChecksum: string,
          version: string
        ) => Promise<import('@vibedepot/shared').AppManifest>;
        uninstallApp: (appId: string, deleteData?: boolean) => Promise<void>;
      };
      shell: {
        getVersion: () => Promise<string>;
        theme: () => Promise<'light' | 'dark'>;
      };
      sideload: {
        selectFolder: () => Promise<string | null>;
        loadApp: (folderPath: string) => Promise<import('@vibedepot/shared').AppManifest>;
        unloadApp: (appId: string) => Promise<void>;
        onChanged: (callback: (appId: string) => void) => () => void;
      };
      publish: {
        selectFolder: () => Promise<string | null>;
        readFolder: (folderPath: string) => Promise<{
          files: string[];
          manifest: Record<string, unknown>;
          manifestExists: boolean;
        }>;
        validate: (
          folderPath: string,
          manifest: Record<string, unknown>
        ) => Promise<{
          results: Array<{
            check: string;
            status: 'pass' | 'warn' | 'fail';
            message: string;
          }>;
        }>;
        createBundle: (
          folderPath: string,
          manifest: Record<string, unknown>
        ) => Promise<{ zipPath: string; checksum: string }>;
        openPR: (
          manifest: Record<string, unknown>,
          checksum: string
        ) => Promise<{ prUrl: string }>;
      };
    };
  }
}

export function App(): React.ReactElement {
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const setInstalledApps = useAppStore((s) => s.setInstalledApps);
  const setAppRunning = useAppStore((s) => s.setAppRunning);
  const publisherMode = useSettingsStore((s) => s.publisherMode);

  // Redirect away from publish page if publisher mode is disabled
  useEffect(() => {
    if (activePage === 'publish' && !publisherMode) {
      setActivePage('store');
    }
  }, [activePage, publisherMode, setActivePage]);

  useEffect(() => {
    window.shellAPI.apps.list().then(setInstalledApps).catch(console.error);
  }, [setInstalledApps]);

  // Listen for app windows being closed externally
  useEffect(() => {
    return window.shellAPI.apps.onAppClosed((appId) => {
      setAppRunning(appId, false);
    });
  }, [setAppRunning]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {activePage === 'store' && <Store />}
        {activePage === 'library' && <Library />}
        {activePage === 'settings' && <Settings />}
        {activePage === 'publish' && <Publish />}
      </main>
    </div>
  );
}
