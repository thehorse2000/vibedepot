import React from 'react';
import type { RegistryEntry } from '@vibedepot/shared';

interface AppDetailModalProps {
  entry: RegistryEntry;
  isInstalled: boolean;
  isInstalling: boolean;
  onInstall: () => void;
  onClose: () => void;
}

export function AppDetailModal({
  entry,
  isInstalled,
  isInstalling,
  onInstall,
  onClose,
}: AppDetailModalProps): React.ReactElement {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold truncate">{entry.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                by {entry.author}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none flex-shrink-0"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Description */}
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {entry.longDescription || entry.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Version</span>
              <p className="font-medium">{entry.version}</p>
            </div>
            {entry.category && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Category
                </span>
                <p className="font-medium capitalize">{entry.category}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Installs
              </span>
              <p className="font-medium">
                {entry.installs.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Updated</span>
              <p className="font-medium">
                {new Date(entry.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Providers */}
          {entry.providers && entry.providers.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                AI Providers
              </span>
              <div className="flex gap-2 mt-1">
                {entry.providers.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded capitalize"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          {entry.permissions.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Permissions
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {entry.permissions.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {entry.keywords && entry.keywords.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Keywords
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {entry.keywords.map((k) => (
                  <span
                    key={k}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (!isInstalled && !isInstalling) onInstall();
            }}
            disabled={isInstalled || isInstalling}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isInstalled
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-default'
                : isInstalling
                  ? 'bg-blue-300 dark:bg-blue-800 text-white cursor-wait'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isInstalled
              ? 'Installed'
              : isInstalling
                ? 'Installing...'
                : 'Install App'}
          </button>
        </div>
      </div>
    </div>
  );
}
