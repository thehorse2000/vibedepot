import React from 'react';

const PERMISSION_LABELS: Record<string, string> = {
  ai: 'Uses AI models to generate content',
  'storage.kv': 'Stores app settings and data (auto-granted)',
  'storage.files': 'Reads and writes files on your computer',
  'storage.db': 'Uses a local database',
  network: 'Connects to external websites and APIs',
  clipboard: 'Reads or writes your clipboard',
  notifications: 'Shows system notifications',
};

interface PermsStepProps {
  manifest: Record<string, unknown>;
  onNext: () => void;
  onBack: () => void;
}

export function PermsStep({
  manifest,
  onNext,
  onBack,
}: PermsStepProps): React.ReactElement {
  const permissions = (manifest.permissions as string[]) || [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Permissions</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        We scanned your code and detected these permissions. They're shown to users before install.
      </p>

      {permissions.length === 0 ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-700 dark:text-green-300">
          This app has minimal permissions.
        </div>
      ) : (
        <div className="space-y-2">
          {permissions.map((perm) => (
            <div
              key={perm}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm">
                {perm === 'ai' ? '🤖' :
                 perm.startsWith('storage') ? '💾' :
                 perm === 'network' ? '🌐' :
                 perm === 'clipboard' ? '📋' :
                 perm === 'notifications' ? '🔔' : '🔒'}
              </div>
              <div>
                <div className="text-sm font-medium font-mono">{perm}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {PERMISSION_LABELS[perm] || 'Unknown permission'}
                </div>
              </div>
              {perm === 'storage.kv' && (
                <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
                  auto
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
