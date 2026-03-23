import React, { useEffect, useState } from 'react';

interface SubmitStepProps {
  folderPath: string;
  manifest: Record<string, unknown>;
  onBack: () => void;
  onReset: () => void;
}

export function SubmitStep({
  folderPath,
  manifest,
  onBack,
  onReset,
}: SubmitStepProps): React.ReactElement {
  const [status, setStatus] = useState<'bundling' | 'opening' | 'done' | 'error'>('bundling');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('bundling');
        const { checksum } = await window.shellAPI.publish.createBundle(
          folderPath,
          manifest
        );

        if (cancelled) return;
        setStatus('opening');
        await window.shellAPI.publish.openPR(manifest, checksum);

        if (cancelled) return;
        setStatus('done');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [folderPath, manifest]);

  if (status === 'error') {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back
        </button>
      </div>
    );
  }

  if (status === 'bundling' || status === 'opening') {
    return (
      <div className="text-center py-12">
        <div className="text-3xl mb-3">📦</div>
        <p className="text-sm text-blue-500 italic">
          {status === 'bundling' ? 'Creating bundle...' : 'Opening GitHub...'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold mb-2">Your PR is open!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          We opened your browser to a pre-filled pull request on GitHub. Review it and click
          "Create pull request" to submit.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-semibold mb-2">What happens next?</h4>
        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
          <li>CI runs automated validation checks on your submission</li>
          <li>A human reviewer will look over your app</li>
          <li>Once merged, your app goes live in the VibeDepot store</li>
        </ol>
      </div>

      <div className="mt-4 text-center">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.shellAPI.publish.openPR(manifest, '').catch(() => {});
          }}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          No GitHub account? Create one first →
        </a>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Publish Another App
        </button>
      </div>
    </div>
  );
}
