import React, { useEffect, useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useAppStore } from '../store/useAppStore';
import { APP_CATEGORIES } from '@vibedepot/shared';
import type { RegistryEntry } from '@vibedepot/shared';
import { StoreAppCard } from '../components/StoreAppCard';
import { AppDetailModal } from '../components/AppDetailModal';
import { FeaturedCarousel } from '../components/FeaturedCarousel';

const ALL_CATEGORIES = 'all';
const ALL_PROVIDERS = 'all';
const PROVIDER_OPTIONS = [
  { value: 'all', label: 'All Providers' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
];

export function Store(): React.ReactElement {
  const registryEntries = useAppStore((s) => s.registryEntries);
  const registryLoading = useAppStore((s) => s.registryLoading);
  const registryError = useAppStore((s) => s.registryError);
  const setRegistryEntries = useAppStore((s) => s.setRegistryEntries);
  const setRegistryLoading = useAppStore((s) => s.setRegistryLoading);
  const setRegistryError = useAppStore((s) => s.setRegistryError);
  const installedApps = useAppStore((s) => s.installedApps);
  const setInstalledApps = useAppStore((s) => s.setInstalledApps);
  const installingAppIds = useAppStore((s) => s.installingAppIds);
  const setAppInstalling = useAppStore((s) => s.setAppInstalling);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [provider, setProvider] = useState(ALL_PROVIDERS);
  const [selectedApp, setSelectedApp] = useState<RegistryEntry | null>(null);

  const installedIds = useMemo(
    () => new Set(installedApps.map((a) => a.id)),
    [installedApps]
  );

  // Fetch registry on mount
  useEffect(() => {
    if (registryEntries.length > 0) return; // already loaded
    setRegistryLoading(true);
    setRegistryError(null);
    window.shellAPI.store
      .fetchRegistry()
      .then((entries) => {
        setRegistryEntries(entries);
      })
      .catch((err) => {
        setRegistryError(err?.message || 'Failed to load registry');
      })
      .finally(() => {
        setRegistryLoading(false);
      });
  }, []);

  // Fuse.js instance for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(registryEntries, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'keywords', weight: 2 },
          { name: 'description', weight: 1.5 },
          { name: 'author', weight: 1 },
          { name: 'longDescription', weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [registryEntries]
  );

  // Filter entries
  const filtered = useMemo(() => {
    let entries = search
      ? fuse.search(search).map((result) => result.item)
      : registryEntries;

    if (category !== ALL_CATEGORIES) {
      entries = entries.filter((e) => e.category === category);
    }

    if (provider !== ALL_PROVIDERS) {
      entries = entries.filter((e) => e.providers?.includes(provider as any));
    }

    return entries;
  }, [registryEntries, search, category, provider, fuse]);

  const featuredApps = useMemo(
    () => registryEntries.filter((e) => e.featured),
    [registryEntries]
  );

  const handleInstall = async (entry: RegistryEntry): Promise<void> => {
    setAppInstalling(entry.id, true);
    try {
      const manifest = await window.shellAPI.store.installApp(
        entry.id,
        entry.bundle,
        entry.checksum,
        entry.version
      );
      // Refresh installed apps list
      const apps = await window.shellAPI.apps.list();
      setInstalledApps(apps);
    } catch (err) {
      console.error('Install failed:', err);
      alert(`Failed to install ${entry.name}: ${(err as Error).message}`);
    } finally {
      setAppInstalling(entry.id, false);
    }
  };

  const handleRefresh = (): void => {
    setRegistryLoading(true);
    setRegistryError(null);
    window.shellAPI.store
      .fetchRegistry()
      .then(setRegistryEntries)
      .catch((err) => setRegistryError(err?.message || 'Failed to refresh'))
      .finally(() => setRegistryLoading(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Store</h2>
        <button
          onClick={handleRefresh}
          disabled={registryLoading}
          className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
        >
          {registryLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Featured carousel (visible when not searching) */}
      {!search && featuredApps.length > 0 && (
        <FeaturedCarousel
          entries={featuredApps}
          installedIds={installedIds}
          installingAppIds={installingAppIds}
          onInstall={handleInstall}
          onAppClick={setSelectedApp}
        />
      )}

      {/* Search and filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={ALL_CATEGORIES}>All Categories</option>
          {APP_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PROVIDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error state */}
      {registryError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-600 dark:text-red-400 text-sm">
            {registryError}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {registryLoading && registryEntries.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Loading registry...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!registryLoading && !registryError && filtered.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {registryEntries.length === 0
              ? 'No apps available in the registry yet.'
              : 'No apps match your search.'}
          </p>
        </div>
      )}

      {/* App grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <StoreAppCard
              key={entry.id}
              entry={entry}
              isInstalled={installedIds.has(entry.id)}
              isInstalling={installingAppIds.has(entry.id)}
              onInstall={() => handleInstall(entry)}
              onClick={() => setSelectedApp(entry)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedApp && (
        <AppDetailModal
          entry={selectedApp}
          isInstalled={installedIds.has(selectedApp.id)}
          isInstalling={installingAppIds.has(selectedApp.id)}
          onInstall={() => handleInstall(selectedApp)}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
