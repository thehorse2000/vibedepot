import React, { useEffect, useState } from 'react';

interface ValidationResult {
  check: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

interface ValidateStepProps {
  folderPath: string;
  manifest: Record<string, unknown>;
  onNext: () => void;
  onBack: () => void;
}

export function ValidateStep({
  folderPath,
  manifest,
  onNext,
  onBack,
}: ValidateStepProps): React.ReactElement {
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.shellAPI.publish
      .validate(folderPath, manifest)
      .then((res) => setResults(res.results))
      .catch((err) =>
        setResults([
          { check: 'Validation', status: 'fail', message: err.message },
        ])
      )
      .finally(() => setLoading(false));
  }, [folderPath, manifest]);

  const hasFailures = results?.some((r) => r.status === 'fail') ?? false;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Validation</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Running the same checks the registry CI will run.
      </p>

      {loading ? (
        <div className="text-sm text-blue-500 italic">Running checks...</div>
      ) : (
        <div className="space-y-2">
          {results?.map((result, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                result.status === 'pass'
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : result.status === 'warn'
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                    : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              }`}
            >
              <span className="text-lg mt-[-2px]">
                {result.status === 'pass'
                  ? '✅'
                  : result.status === 'warn'
                    ? '⚠️'
                    : '❌'}
              </span>
              <div>
                <div className="text-sm font-medium">{result.check}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {result.message}
                </div>
              </div>
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
          disabled={loading || hasFailures}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {hasFailures ? 'Fix issues to continue' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
