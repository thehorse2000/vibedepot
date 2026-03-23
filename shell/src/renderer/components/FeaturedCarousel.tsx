import React, { useRef } from 'react';
import type { RegistryEntry } from '@vibedepot/shared';

interface FeaturedCarouselProps {
  entries: RegistryEntry[];
  installedIds: Set<string>;
  installingAppIds: Set<string>;
  onInstall: (entry: RegistryEntry) => void;
  onAppClick: (entry: RegistryEntry) => void;
}

export function FeaturedCarousel({
  entries,
  installedIds,
  installingAppIds,
  onInstall,
  onAppClick,
}: FeaturedCarouselProps): React.ReactElement | null {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (entries.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Featured Apps</h3>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            aria-label="Scroll left"
          >
            &larr;
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            aria-label="Scroll right"
          >
            &rarr;
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {entries.map((entry) => {
          const isInstalled = installedIds.has(entry.id);
          const isInstalling = installingAppIds.has(entry.id);

          return (
            <div
              key={entry.id}
              onClick={() => onAppClick(entry)}
              className="flex-shrink-0 w-72 border border-blue-200 dark:border-blue-800 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              {entry.thumbnail ? (
                <div className="h-32 bg-gray-100 dark:bg-gray-700 overflow-hidden">
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
                <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800/40 dark:to-indigo-800/40 flex items-center justify-center">
                  <span className="text-4xl opacity-50">
                    {entry.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm truncate">
                      {entry.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.author}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isInstalled && !isInstalling) onInstall(entry);
                    }}
                    disabled={isInstalled || isInstalling}
                    className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isInstalled
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-default'
                        : isInstalling
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 cursor-wait'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isInstalled
                      ? 'Installed'
                      : isInstalling
                        ? 'Installing...'
                        : 'Install'}
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 line-clamp-2">
                  {entry.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
