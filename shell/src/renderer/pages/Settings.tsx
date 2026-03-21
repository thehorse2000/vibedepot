import React from 'react';
import { ApiKeyForm } from '../components/ApiKeyForm';

const providers = [
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'openai', name: 'OpenAI (GPT)' },
  { id: 'gemini', name: 'Google (Gemini)' },
];

export function Settings(): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <section>
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
    </div>
  );
}
