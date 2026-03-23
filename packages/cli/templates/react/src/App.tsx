import { useState, useEffect } from 'react';

const vd = window.vibeDepot;

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  useEffect(() => {
    vd.shell.theme().then(setTheme);
    vd.ai.getProvider().then(setProvider);
    vd.shell.setTitle('My App');
  }, []);

  async function handleAsk() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const result = await vd.ai.callAI({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 512,
      });
      setResponse(result.content);
      await vd.storage.set('lastPrompt', prompt);
    } catch (err) {
      setResponse(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My App</h1>
        {provider && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            AI Provider: {provider}
          </p>
        )}

        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the AI something..."
            rows={3}
            className={`w-full rounded-lg border p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !prompt.trim()}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {response && (
          <div
            className={`rounded-lg border p-4 whitespace-pre-wrap ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
