import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppCard } from '../components/AppCard';

export function Library(): React.ReactElement {
  const installedApps = useAppStore((s) => s.installedApps);
  const runningAppIds = useAppStore((s) => s.runningAppIds);
  const setAppRunning = useAppStore((s) => s.setAppRunning);

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Library</h2>
      {installedApps.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No apps installed yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {installedApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isRunning={runningAppIds.has(app.id)}
              onLaunch={() => handleLaunch(app.id)}
              onClose={() => handleClose(app.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
