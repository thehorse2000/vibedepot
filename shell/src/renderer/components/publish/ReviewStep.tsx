import React from 'react';

const CATEGORIES = [
  'productivity', 'writing', 'coding', 'files', 'research',
  'data', 'media', 'integrations', 'utilities', 'fun',
];

interface ReviewStepProps {
  manifest: Record<string, unknown>;
  onUpdate: (manifest: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ReviewStep({
  manifest,
  onUpdate,
  onNext,
  onBack,
}: ReviewStepProps): React.ReactElement {
  const [showKeywords, setShowKeywords] = React.useState(
    Array.isArray(manifest.keywords) && (manifest.keywords as string[]).length > 0
  );

  const update = (field: string, value: unknown): void => {
    onUpdate({ ...manifest, [field]: value });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Review detected details</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        We pre-filled everything we could. Correct anything that's off.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">App Name</label>
          <input
            type="text"
            value={(manifest.name as string) || ''}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Short Description</label>
          <input
            type="text"
            value={(manifest.description as string) || ''}
            onChange={(e) => update('description', e.target.value)}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            {((manifest.description as string) || '').length}/200
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <input
            type="text"
            value={(manifest.author as string) || ''}
            onChange={(e) => update('author', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => update('category', cat)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  manifest.category === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {!showKeywords ? (
          <button
            onClick={() => setShowKeywords(true)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            + Add keywords
          </button>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">
              Keywords <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={Array.isArray(manifest.keywords) ? (manifest.keywords as string[]).join(', ') : ''}
              onChange={(e) =>
                update(
                  'keywords',
                  e.target.value
                    .split(',')
                    .map((k) => k.trim())
                    .filter(Boolean)
                )
              }
              placeholder="comma-separated keywords"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!manifest.name || !manifest.description || !manifest.author}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
