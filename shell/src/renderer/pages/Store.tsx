import React from 'react';

export function Store(): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Store</h2>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          The VibeDepot Store is coming in Phase 2.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Browse and install AI-native apps from the community registry.
        </p>
      </div>
    </div>
  );
}
