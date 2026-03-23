import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';

type Page = 'store' | 'library' | 'settings' | 'publish';

const allNavItems: { id: Page; label: string; icon: string; publisherOnly?: boolean }[] = [
  { id: 'store', label: 'Store', icon: '🏪' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'publish', label: 'Publish', icon: '🚀', publisherOnly: true },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar(): React.ReactElement {
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const publisherMode = useSettingsStore((s) => s.publisherMode);

  const navItems = useMemo(
    () => allNavItems.filter((item) => !item.publisherOnly || publisherMode),
    [publisherMode]
  );

  return (
    <aside className="w-60 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold">VibeDepot</h1>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full text-left px-3 py-2 rounded-md mb-1 flex items-center gap-2 transition-colors ${
              activePage === item.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
        VibeDepot v0.1.0
      </div>
    </aside>
  );
}
