import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppCard } from '../components/AppCard';

export function Library(): React.ReactElement {
  const installedApps = useAppStore((s) => s.installedApps);
  const runningAppIds = useAppStore((s) => s.runningAppIds);
  const setAppRunning = useAppStore((s) => s.setAppRunning);
  const setInstalledApps = useAppStore((s) => s.setInstalledApps);
  const registryEntries = useAppStore((s) => s.registryEntries);

  // Build a map of registry versions for update detection
  const registryVersions = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of registryEntries) {
      map.set(entry.id, entry.version);
    }
    return map;
  }, [registryEntries]);

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Library</h2>
      {installedApps.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No apps installed yet. Browse the Store to find apps.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {installedApps.map((app) => {
            const registryVersion = registryVersions.get(app.id);
            const hasUpdate =
              registryVersion !== undefined && registryVersion !== app.version;

            return (
              <AppCard
                key={app.id}
                app={app}
                isRunning={runningAppIds.has(app.id)}
                hasUpdate={hasUpdate}
                registryVersion={registryVersion}
                onLaunch={() => handleLaunch(app.id)}
                onClose={() => handleClose(app.id)}
                onUninstall={() => handleUninstall(app.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
