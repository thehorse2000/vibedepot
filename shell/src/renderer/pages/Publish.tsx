import React, { useState } from 'react';
import { StepIndicator } from '../components/publish/StepIndicator';
import { DropStep } from '../components/publish/DropStep';
import { ReviewStep } from '../components/publish/ReviewStep';
import { PermsStep } from '../components/publish/PermsStep';
import { ValidateStep } from '../components/publish/ValidateStep';
import { SubmitStep } from '../components/publish/SubmitStep';

export function Publish(): React.ReactElement {
  const [step, setStep] = useState(1);
  const [folderPath, setFolderPath] = useState('');
  const [manifest, setManifest] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const handleFolderSelected = async (path: string): Promise<void> => {
    setLoading(true);
    try {
      const result = await window.shellAPI.publish.readFolder(path);
      setFolderPath(path);
      setManifest(result.manifest);
      setStep(2);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to read folder');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    setStep(1);
    setFolderPath('');
    setManifest({});
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Publish an App</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Share your app with the VibeDepot community
      </p>

      <StepIndicator current={step} />

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm text-blue-500 italic">Reading folder...</p>
          </div>
        ) : (
          <>
            {step === 1 && <DropStep onFolderSelected={handleFolderSelected} />}
            {step === 2 && (
              <ReviewStep
                manifest={manifest}
                onUpdate={setManifest}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <PermsStep
                manifest={manifest}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <ValidateStep
                folderPath={folderPath}
                manifest={manifest}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <SubmitStep
                folderPath={folderPath}
                manifest={manifest}
                onBack={() => setStep(4)}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
