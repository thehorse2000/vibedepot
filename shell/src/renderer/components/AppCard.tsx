import React from 'react';
import type { AppManifest } from '@vibedepot/shared';

interface AppCardProps {
  app: AppManifest;
  isRunning: boolean;
  onLaunch: () => void;
  onClose: () => void;
}

export function AppCard({
  app,
  isRunning,
  onLaunch,
  onClose,
}: AppCardProps): React.ReactElement {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{app.name}</h3>
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
        <div>
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
        </div>
      </div>
    </div>
  );
}
