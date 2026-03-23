import React, { useState } from 'react';

interface DropStepProps {
  onFolderSelected: (folderPath: string) => void;
}

export function DropStep({ onFolderSelected }: DropStepProps): React.ReactElement {
  const [dragover, setDragover] = useState(false);

  const handleBrowse = async (): Promise<void> => {
    const folderPath = await window.shellAPI.publish.selectFolder();
    if (folderPath) {
      onFolderSelected(folderPath);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Drop your app folder</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Select the folder containing your app's files. We'll take it from there.
      </p>
      <div
        onClick={handleBrowse}
        onDragOver={(e) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragover(false);
          // Note: Electron file drops don't work in sandboxed renderer the same way.
          // The browse button is the primary interaction.
          handleBrowse();
        }}
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
          dragover
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <div className="text-4xl mb-3">📁</div>
        <div className="text-gray-600 dark:text-gray-300 font-medium">
          Click to browse for your app folder
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Must contain an HTML entry file
        </div>
      </div>
    </div>
  );
}
