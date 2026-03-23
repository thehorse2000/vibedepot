import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { AppCard } from '../components/AppCard';

interface AppWithSideloaded {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  _sideloaded?: boolean;
  [key: string]: unknown;
}

export function Library(): React.ReactElement {
  const installedApps = useAppStore((s) => s.installedApps);
  const runningAppIds = useAppStore((s) => s.runningAppIds);
  const setAppRunning = useAppStore((s) => s.setAppRunning);
  const setInstalledApps = useAppStore((s) => s.setInstalledApps);
  const registryEntries = useAppStore((s) => s.registryEntries);
  const publisherMode = useSettingsStore((s) => s.publisherMode);

  // Build a map of registry versions for update detection
  const registryVersions = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of registryEntries) {
      map.set(entry.id, entry.version);
    }
    return map;
  }, [registryEntries]);

  // Listen for sideload file changes to refresh the list
  useEffect(() => {
    return window.shellAPI.sideload.onChanged(() => {
      window.shellAPI.apps.list().then(setInstalledApps).catch(console.error);
    });
  }, [setInstalledApps]);

  const handleLaunch = async (appId: string): Promise<void> => {
    try {
      await window.shellAPI.apps.launch(appId);
      setAppRunning(appId, true);
    } catch (err) {
      console.error('Failed to launch app:', err);
    }
  };

  const handleClose = async (appId: string): Promise<void> => {
    try {
      await window.shellAPI.apps.close(appId);
      setAppRunning(appId, false);
    } catch (err) {
      console.error('Failed to close app:', err);
    }
  };

  const handleUninstall = async (appId: string): Promise<void> => {
    const confirmed = confirm(
      'Are you sure you want to uninstall this app? Your app data will be preserved.'
    );
    if (!confirmed) return;

    try {
      // Close if running
      if (runningAppIds.has(appId)) {
        await window.shellAPI.apps.close(appId);
        setAppRunning(appId, false);
      }
      await window.shellAPI.store.uninstallApp(appId, false);
      const apps = await window.shellAPI.apps.list();
      setInstalledApps(apps);
    } catch (err) {
      console.error('Failed to uninstall app:', err);
    }
  };

  const handleRemoveSideloaded = async (appId: string): Promise<void> => {
    try {
      if (runningAppIds.has(appId)) {
        await window.shellAPI.apps.close(appId);
        setAppRunning(appId, false);
      }
      await window.shellAPI.sideload.unloadApp(appId);
      const apps = await window.shellAPI.apps.list();
      setInstalledApps(apps);
    } catch (err) {
      console.error('Failed to remove sideloaded app:', err);
    }
  };

  const handleSideload = async (): Promise<void> => {
    const folderPath = await window.shellAPI.sideload.selectFolder();
    if (!folderPath) return;
    try {
      await window.shellAPI.sideload.loadApp(folderPath);
      const apps = await window.shellAPI.apps.list();
      setInstalledApps(apps);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to sideload app');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Library</h2>
        {publisherMode && (
          <button
            onClick={handleSideload}
            className="px-3 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors flex items-center gap-1.5"
          >
            <span>📂</span>
            <span>Sideload App</span>
          </button>
        )}
      </div>
      {installedApps.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No apps installed yet. Browse the Store to find apps, or sideload a local app folder.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {installedApps.map((app) => {
            const appData = app as unknown as AppWithSideloaded;
            const isSideloaded = appData._sideloaded === true;
            const registryVersion = registryVersions.get(app.id);
            const hasUpdate =
              !isSideloaded &&
              registryVersion !== undefined &&
              registryVersion !== app.version;

            return (
              <AppCard
                key={app.id}
                app={app}
                isRunning={runningAppIds.has(app.id)}
                hasUpdate={hasUpdate}
                registryVersion={registryVersion}
                sideloaded={isSideloaded}
                onLaunch={() => handleLaunch(app.id)}
                onClose={() => handleClose(app.id)}
                onUninstall={() => handleUninstall(app.id)}
                onRemove={() => handleRemoveSideloaded(app.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
