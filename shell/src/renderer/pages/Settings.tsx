import React from 'react';
import { ApiKeyForm } from '../components/ApiKeyForm';
import { useSettingsStore } from '../store/useSettingsStore';

const providers = [
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'openai', name: 'OpenAI (GPT)' },
  { id: 'gemini', name: 'Google (Gemini)' },
];

export function Settings(): React.ReactElement {
  const publisherMode = useSettingsStore((s) => s.publisherMode);
  const setPublisherMode = useSettingsStore((s) => s.setPublisherMode);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3">API Keys</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Your API keys are stored securely in your operating system's keychain.
          They are never sent to apps or third parties.
        </p>
        <div className="grid gap-3">
          {providers.map((p) => (
            <ApiKeyForm key={p.id} provider={p.id} displayName={p.name} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Developer</h3>
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div>
            <p className="font-medium">Publisher Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable app sideloading and the publish wizard for developing and submitting apps.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={publisherMode}
            onClick={() => setPublisherMode(!publisherMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              publisherMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                publisherMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
