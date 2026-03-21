import React from 'react';
import type { RegistryEntry } from '@vibedepot/shared';

interface StoreAppCardProps {
  entry: RegistryEntry;
  isInstalled: boolean;
  isInstalling: boolean;
  onInstall: () => void;
  onClick: () => void;
}

export function StoreAppCard({
  entry,
  isInstalled,
  isInstalling,
  onInstall,
  onClick,
}: StoreAppCardProps): React.ReactElement {
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Thumbnail */}
      {entry.thumbnail ? (
        <div className="h-36 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img
            src={entry.thumbnail}
            alt={entry.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
          <span className="text-4xl opacity-50">
            {entry.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{entry.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {entry.author}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isInstalled && !isInstalling) onInstall();
            }}
            disabled={isInstalled || isInstalling}
            className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              isInstalled
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
                : isInstalling
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 cursor-wait'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isInstalled ? 'Installed' : isInstalling ? 'Installing...' : 'Install'}
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {entry.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.category && (
            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
              {entry.category}
            </span>
          )}
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
            v{entry.version}
          </span>
          {entry.providers?.map((p) => (
            <span
              key={p}
              className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
