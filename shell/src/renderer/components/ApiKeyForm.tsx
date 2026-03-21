import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface ApiKeyFormProps {
  provider: string;
  displayName: string;
}

export function ApiKeyForm({
  provider,
  displayName,
}: ApiKeyFormProps): React.ReactElement {
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const providerStatus = useSettingsStore((s) => s.providers[provider]);
  const setProviderStatus = useSettingsStore((s) => s.setProviderStatus);

  useEffect(() => {
    window.shellAPI.keys
      .get(provider)
      .then((result) => {
        setProviderStatus(provider, {
          hasKey: result.exists,
          masked: result.masked,
        });
      })
      .catch(console.error);
  }, [provider, setProviderStatus]);

  const handleSave = async (): Promise<void> => {
    if (!key.trim()) return;
    setSaving(true);
    try {
      await window.shellAPI.keys.set(provider, key.trim());
      const result = await window.shellAPI.keys.get(provider);
      setProviderStatus(provider, {
        hasKey: result.exists,
        masked: result.masked,
      });
      setKey('');
    } catch (err) {
      console.error('Failed to save key:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await window.shellAPI.keys.delete(provider);
      setProviderStatus(provider, { hasKey: false, masked: null });
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <h3 className="font-medium text-base mb-3">{displayName}</h3>
      {providerStatus?.hasKey ? (
        <div className="flex items-center justify-between">
          <code className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {providerStatus.masked}
          </code>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={`Enter ${displayName} API key`}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving || !key.trim()}
            className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-md transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}
