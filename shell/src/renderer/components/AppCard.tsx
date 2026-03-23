import React from 'react';
import type { AppManifest } from '@vibedepot/shared';

interface AppCardProps {
  app: AppManifest;
  isRunning: boolean;
  hasUpdate?: boolean;
  registryVersion?: string;
  sideloaded?: boolean;
  onLaunch: () => void;
  onClose: () => void;
  onUninstall?: () => void;
  onRemove?: () => void;
}

export function AppCard({
  app,
  isRunning,
  hasUpdate,
  registryVersion,
  sideloaded,
  onLaunch,
  onClose,
  onUninstall,
  onRemove,
}: AppCardProps): React.ReactElement {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{app.name}</h3>
            {sideloaded && (
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-medium">
                DEV
              </span>
            )}
            {hasUpdate && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">
                Update: v{registryVersion}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {app.description}
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              v{app.version}
            </span>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {app.author}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          {isRunning ? (
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Close
            </button>
          ) : (
            <button
              onClick={onLaunch}
              className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Launch
            </button>
          )}
          {sideloaded && onRemove && !isRunning && (
            <button
              onClick={onRemove}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-md transition-colors"
            >
              Remove
            </button>
          )}
          {!sideloaded && onUninstall && !isRunning && (
            <button
              onClick={onUninstall}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-md transition-colors"
            >
              Uninstall
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
